// ============================================
// src/app/api/courses/[id]/unpublish/route.ts
// PUT /api/courses/:id/unpublish - Unpublish course
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireTeacher } from '@/middleware/auth';
import { Types } from 'mongoose';

export const PUT = requireTeacher(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const courseId = params.id;

    if (!Types.ObjectId.isValid(courseId)) {
      return ApiResponseBuilder.badRequest('Invalid course ID');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponseBuilder.notFound('Course not found');
    }

    // Check ownership
    if (
      currentUser.role !== 'ADMIN' &&
      course.teacherId.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('Access denied');
    }

    // Update status
    course.status = 'DRAFT' as any;
    await course.save();

    return ApiResponseBuilder.success(
      {
        _id: (course._id as any).toString(),
        status: course.status,
      },
      'Course unpublished successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});
