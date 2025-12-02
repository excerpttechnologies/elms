// ============================================
// src/app/api/assignments/[id]/submit/route.ts
// POST /api/assignments/:id/submit - Submit assignment
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Assignment from '@/models/Assignment';
import Course from '@/models/Course';
import User from '@/models/User';
import Submission from '@/models/Submission';
import Enrollment from '@/models/Enrollment';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth } from '@/middleware/auth';
import { Types } from 'mongoose';
import { z } from 'zod';

const submitAssignmentSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.string(), z.array(z.string())]),
    })
  ),
  timeSpent: z.number().int().min(0).optional(),
});

export const POST = requireAuth(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

     const { id: assignmentId } = await params;

    if (!Types.ObjectId.isValid(assignmentId)) {
      return ApiResponseBuilder.badRequest('Invalid assignment ID');
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return ApiResponseBuilder.notFound('Assignment not found');
    }

    // Check if student is enrolled
    const enrollment = await Enrollment.findOne({
      studentId: currentUser.userId,
      courseId: assignment.courseId,
      status: 'ACTIVE',
    });

    if (!enrollment) {
      return ApiResponseBuilder.forbidden('You must be enrolled in this course');
    }

    // Check assignment status
    if (assignment.status !== 'PUBLISHED') {
      return ApiResponseBuilder.badRequest('Assignment is not available');
    }

    // Check due date
    const now = new Date();
    const isLate = assignment.dueDate && now > assignment.dueDate;

    if (isLate && !assignment.allowLateSubmission) {
      return ApiResponseBuilder.badRequest('Assignment deadline has passed');
    }

    // Check attempt count
    const previousSubmissions = await Submission.countDocuments({
      assignmentId,
      studentId: currentUser.userId,
    });

    if (assignment.maxAttempts && previousSubmissions >= assignment.maxAttempts) {
      return ApiResponseBuilder.badRequest('Maximum attempts exceeded');
    }

    const body = await request.json();
    const validated = submitAssignmentSchema.parse(body);

    // Auto-grade objective questions
    let score = 0;
    let totalPossiblePoints = 0;

    assignment.questions.forEach((question, index) => {
      const studentAnswer = validated.answers.find(
        (a) => a.questionId === index.toString()
      );

      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        totalPossiblePoints += question.points;

        if (studentAnswer && question.correctAnswer) {
          const isCorrect = Array.isArray(question.correctAnswer)
            ? JSON.stringify(question.correctAnswer.sort()) ===
              JSON.stringify((studentAnswer.answer as string[]).sort())
            : question.correctAnswer === studentAnswer.answer;

          if (isCorrect) {
            score += question.points;
          }
        }
      } else {
        // Essay/Short answer - needs manual grading
        totalPossiblePoints += question.points;
      }
    });

    // Apply late penalty
    if (isLate && assignment.latePenalty) {
      score = score * (1 - assignment.latePenalty / 100);
    }

    // Determine status
    const needsManualGrading = assignment.questions.some(
      (q) => q.type === 'ESSAY' || q.type === 'SHORT_ANSWER'
    );

    const submission = await Submission.create({
      assignmentId,
      studentId: currentUser.userId,
      answers: validated.answers,
      status: isLate ? 'LATE' : needsManualGrading ? 'SUBMITTED' : 'GRADED',
      attemptNumber: previousSubmissions + 1,
      submittedAt: now,
      score: needsManualGrading ? undefined : score,
      timeSpent: validated.timeSpent,
    });

    return ApiResponseBuilder.created(
      {
        _id: (submission._id as any).toString(),
        assignmentId: submission.assignmentId.toString(),
        studentId: submission.studentId.toString(),
        status: submission.status,
        score: submission.score,
        attemptNumber: submission.attemptNumber,
        submittedAt: submission.submittedAt,
      },
      'Assignment submitted successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});
