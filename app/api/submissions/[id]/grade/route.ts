// ============================================
// src/app/api/submissions/[id]/grade/route.ts
// PUT /api/submissions/:id/grade - Grade submission (Teacher/Admin)
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Submission from '@/models/Submission';
import Assignment from '@/models/Assignment';
import Course from '@/models/Course';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireTeacher } from '@/middleware/auth';
import { Types } from 'mongoose';
import { z } from 'zod';

const gradeSubmissionSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().optional(),
});

export const PUT = requireTeacher(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const submissionId = params.id;

    if (!Types.ObjectId.isValid(submissionId)) {
      return ApiResponseBuilder.badRequest('Invalid submission ID');
    }

    const submission = await Submission.findById(submissionId).populate({
      path: 'assignmentId',
      populate: { path: 'courseId' },
    });

    if (!submission) {
      return ApiResponseBuilder.notFound('Submission not found');
    }

    // Check ownership
    const assignment = submission.assignmentId as any;
    const course = assignment.courseId as any;

    if (
      currentUser.role !== 'ADMIN' &&
      course.teacherId.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('Access denied');
    }

    const body = await request.json();
    const validated = gradeSubmissionSchema.parse(body);

    // Validate score doesn't exceed total points
    if (validated.score > assignment.totalPoints) {
      return ApiResponseBuilder.badRequest(
        `Score cannot exceed ${assignment.totalPoints} points`
      );
    }

    // Update submission
    submission.score = validated.score;
    submission.feedback = validated.feedback;
    submission.gradedBy = new Types.ObjectId(currentUser.userId);
    submission.gradedAt = new Date();
    submission.status = 'GRADED' as any;

    await submission.save();

    await submission.populate([
      { path: 'assignmentId', select: 'title totalPoints' },
      { path: 'studentId', select: 'firstName lastName email' },
      { path: 'gradedBy', select: 'firstName lastName email' },
    ]);

    return ApiResponseBuilder.success(
      {
        ...submission.toObject(),
        _id: (submission._id as any).toString(),
        assignmentId: {
          ...(submission.assignmentId as any).toObject(),
          _id: (submission.assignmentId as any)._id.toString(),
        },
        studentId: {
          ...(submission.studentId as any).toObject(),
          _id: (submission.studentId as any)._id.toString(),
        },
        gradedBy: {
          ...(submission.gradedBy as any).toObject(),
          _id: (submission.gradedBy as any)._id.toString(),
        },
      },
      'Submission graded successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});
