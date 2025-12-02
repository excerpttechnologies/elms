// ============================================
// src/app/api/submissions/[id]/route.ts
// GET /api/submissions/:id - Get submission by ID
// PUT /api/submissions/:id - Update submission (resubmit)
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Submission from '@/models/Submission';
import Assignment from '@/models/Assignment';
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

    const submissionId = params.id;

    if (!Types.ObjectId.isValid(submissionId)) {
      return ApiResponseBuilder.badRequest('Invalid submission ID');
    }

    const submission = await Submission.findById(submissionId)
      .populate('assignmentId', 'title type totalPoints')
      .populate('studentId', 'firstName lastName email avatar')
      .populate('gradedBy', 'firstName lastName email')
      .lean();

    if (!submission) {
      return ApiResponseBuilder.notFound('Submission not found');
    }

    // Students can only view their own submissions
    if (
      currentUser.role === 'STUDENT' &&
      submission.studentId &&
      (submission.studentId as any)._id.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('Access denied');
    }

    return ApiResponseBuilder.success({
      ...submission,
      _id: submission._id.toString(),
      assignmentId: submission.assignmentId ? {
        ...(submission.assignmentId as any),
        _id: (submission.assignmentId as any)._id.toString(),
      } : null,
      studentId: submission.studentId ? {
        ...(submission.studentId as any),
        _id: (submission.studentId as any)._id.toString(),
      } : null,
      gradedBy: submission.gradedBy ? {
        ...(submission.gradedBy as any),
        _id: (submission.gradedBy as any)._id.toString(),
      } : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
});