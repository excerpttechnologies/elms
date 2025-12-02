// ============================================
// src/app/api/enrollments/my/route.ts
// GET /api/enrollments/my - Get current user's enrollments
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Enrollment from '@/models/Enrollment';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth } from '@/middleware/auth';

export const GET = requireAuth(async (request: NextRequest, currentUser: any) => {
  try {
    await connectDB();

    const enrollments = await Enrollment.find({
      studentId: currentUser.userId,
    })
      .populate({
        path: 'courseId',
        populate: {
          path: 'teacherId',
          select: 'firstName lastName email',
        },
      })
      .sort({ enrolledAt: -1 })
      .lean();

    const formattedEnrollments = enrollments.map(enrollment => ({
      ...enrollment,
      _id: enrollment._id.toString(),
      studentId: enrollment.studentId.toString(),
      courseId: enrollment.courseId ? {
        ...(enrollment.courseId as any),
        _id: (enrollment.courseId as any)._id.toString(),
        teacherId: (enrollment.courseId as any).teacherId ? {
          ...(enrollment.courseId as any).teacherId,
          _id: (enrollment.courseId as any).teacherId._id.toString(),
        } : null,
      } : null,
    }));

    return ApiResponseBuilder.success(formattedEnrollments);
  } catch (error) {
    return handleApiError(error);
  }
});