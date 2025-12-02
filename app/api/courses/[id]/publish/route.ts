// ============================================
// src/app/api/courses/[id]/publish/route.ts
// PUT /api/courses/:id/publish - Publish course
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

    // Validate course has content before publishing
    if (course.modules.length === 0) {
      return ApiResponseBuilder.badRequest(
        'Cannot publish course without modules'
      );
    }

    // Update status
    course.status = 'PUBLISHED' as any;
    await course.save();

    return ApiResponseBuilder.success(
      {
        _id: (course._id as any).toString(),
        status: course.status,
      },
      'Course published successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});