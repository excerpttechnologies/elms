// ============================================
// src/app/api/courses/my-courses/route.ts
// GET /api/courses/my-courses - Get user's courses (as teacher or student)
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth } from '@/middleware/auth';

export const GET = requireAuth(async (request: NextRequest, currentUser: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'teaching' or 'enrolled'

    if (currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN') {
      // Get courses created by teacher
      const courses = await Course.find({ teacherId: currentUser.userId })
        .sort({ createdAt: -1 })
        .lean();

      return ApiResponseBuilder.success(
        courses.map(c => ({
          ...c,
          _id: c._id.toString(),
          teacherId: c.teacherId.toString(),
        })),
        'Teaching courses retrieved successfully'
      );
    } else {
      // Get enrolled courses for student
      const enrollments = await Enrollment.find({
        studentId: currentUser.userId,
        status: 'ACTIVE',
      })
        .populate({
          path: 'courseId',
          populate: {
            path: 'teacherId',
            select: 'firstName lastName email avatar',
          },
        })
        .lean();

      const courses = enrollments.map(enrollment => ({
        ...(enrollment.courseId as any),
        _id: (enrollment.courseId as any)._id.toString(),
        teacherId: (enrollment.courseId as any).teacherId ? {
          ...(enrollment.courseId as any).teacherId,
          _id: (enrollment.courseId as any).teacherId._id.toString(),
        } : null,
        enrollment: {
          _id: enrollment._id.toString(),
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          progress: enrollment.progressPercentage,
        },
      }));

      return ApiResponseBuilder.success(
        courses,
        'Enrolled courses retrieved successfully'
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
});