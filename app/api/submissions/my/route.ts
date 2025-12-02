// ============================================
// src/app/api/submissions/my/route.ts
// GET /api/submissions/my - Get current user's submissions
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Submission from '@/models/Submission';
import Assignment from '@/models/Assignment';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth } from '@/middleware/auth';

export const GET = requireAuth(async (request: NextRequest, currentUser: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const query: any = {
      studentId: currentUser.userId,
    };

    if (courseId) {
      // Get assignments for this course first
      const assignments = await Assignment.find({ courseId }).select('_id');
      const assignmentIds = assignments.map(a => a._id);
      query.assignmentId = { $in: assignmentIds };
    }

    const submissions = await Submission.find(query)
      .populate({
        path: 'assignmentId',
        select: 'title type totalPoints dueDate',
        populate: { path: 'courseId', select: 'title' },
      })
      .sort({ submittedAt: -1 })
      .lean();

    const formattedSubmissions = submissions.map(submission => ({
      ...submission,
      _id: submission._id.toString(),
      assignmentId: submission.assignmentId ? {
        ...(submission.assignmentId as any),
        _id: (submission.assignmentId as any)._id.toString(),
        courseId: (submission.assignmentId as any).courseId ? {
          ...(submission.assignmentId as any).courseId,
          _id: (submission.assignmentId as any).courseId._id.toString(),
        } : null,
      } : null,
      studentId: submission.studentId.toString(),
    }));

    return ApiResponseBuilder.success(formattedSubmissions);
  } catch (error) {
    return handleApiError(error);
  }
});
