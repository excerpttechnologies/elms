// ============================================
// src/app/api/grades/student/[id]/route.ts
// GET /api/grades/student/:id - Get student's grades
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Submission from '@/models/Submission';
import Assignment from '@/models/Assignment';
import Course from '@/models/Course';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth } from '@/middleware/auth';
import { Types } from 'mongoose';

export const GET = requireAuth(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const studentId = params.id;

    if (!Types.ObjectId.isValid(studentId)) {
      return ApiResponseBuilder.badRequest('Invalid student ID');
    }

    // Students can only view their own grades unless admin/teacher
    if (
      currentUser.role === 'STUDENT' &&
      currentUser.userId !== studentId
    ) {
      return ApiResponseBuilder.forbidden('Access denied');
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    // Build query
    let assignmentQuery: any = {};
    if (courseId) {
      assignmentQuery.courseId = courseId;
    }

    const assignments = await Assignment.find(assignmentQuery);
    const assignmentIds = assignments.map(a => a._id);

    const submissions = await Submission.find({
      studentId,
      assignmentId: { $in: assignmentIds },
      status: 'GRADED',
    })
      .populate({
        path: 'assignmentId',
        select: 'title type totalPoints courseId',
        populate: { path: 'courseId', select: 'title' },
      })
      .sort({ gradedAt: -1 })
      .lean();

    // Calculate statistics
    const totalSubmissions = submissions.length;
    const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
    const totalPossible = submissions.reduce(
      (sum, s) => sum + ((s.assignmentId as any)?.totalPoints || 0),
      0
    );
    const averagePercentage =
      totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

    const formattedSubmissions = submissions.map(submission => ({
      _id: submission._id.toString(),
      assignment: submission.assignmentId ? {
        ...(submission.assignmentId as any),
        _id: (submission.assignmentId as any)._id.toString(),
        courseId: (submission.assignmentId as any).courseId ? {
          ...(submission.assignmentId as any).courseId,
          _id: (submission.assignmentId as any).courseId._id.toString(),
        } : null,
      } : null,
      score: submission.score,
      feedback: submission.feedback,
      gradedAt: submission.gradedAt,
      submittedAt: submission.submittedAt,
    }));

    return ApiResponseBuilder.success({
      submissions: formattedSubmissions,
      statistics: {
        totalSubmissions,
        totalScore,
        totalPossible,
        averagePercentage: Math.round(averagePercentage * 10) / 10,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});