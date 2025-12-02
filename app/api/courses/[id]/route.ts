// ============================================
// src/app/api/courses/[id]/route.ts
// GET /api/courses/:id - Get course by ID
// PUT /api/courses/:id - Update course
// DELETE /api/courses/:id - Delete course
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth, requireTeacher } from '@/middleware/auth';
import { updateCourseSchema } from '@/lib/validators/course.validator';
import { Types } from 'mongoose';

// GET /api/courses/:id - Get course by ID
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDB();

    const { id: courseId } = await params;

    // Validate ObjectId
    if (!Types.ObjectId.isValid(courseId)) {
      return ApiResponseBuilder.badRequest('Invalid course ID');
    }

    const course = await Course.findById(courseId)
      .populate('teacherId', 'firstName lastName email avatar')
      .lean();

    if (!course) {
      return ApiResponseBuilder.notFound('Course not found');
    }

    return ApiResponseBuilder.success({
      ...course,
      _id: course._id.toString(),
      teacherId: course.teacherId ? {
        ...course.teacherId,
        _id: (course.teacherId as any)._id.toString(),
      } : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// PUT /api/courses/:id - Update course
export const PUT = requireTeacher(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDB();
    console.log("Connected to database");
    
    const { id: courseId } = await params;
    console.log("Updating course with ID:", courseId);
    
    // Validate ObjectId
    if (!Types.ObjectId.isValid(courseId)) {
      return ApiResponseBuilder.badRequest('Invalid course ID');
    }

    // Check if course exists
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return ApiResponseBuilder.notFound('Course not found');
    }

    // Check if user is course owner or admin
    if (
      currentUser.role !== 'ADMIN' &&
      existingCourse.teacherId.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('You can only edit your own courses');
    }

    const body = await request.json();
    const validated = updateCourseSchema.parse(body);

    // Update course
    const course = await Course.findByIdAndUpdate(
      courseId,
      validated,
      { new: true, runValidators: true }
    )
      .populate('teacherId', 'firstName lastName email')
      .lean();

    return ApiResponseBuilder.success(
      {
        ...course,
        _id: course!._id.toString(),
        teacherId: course!.teacherId ? {
          ...course!.teacherId,
          _id: (course!.teacherId as any)._id.toString(),
        } : null,
      },
      'Course updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});
// DELETE /api/courses/:id - Delete course
export const DELETE = requireTeacher(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const { id: courseId } = await params;

    // Validate ObjectId
    if (!Types.ObjectId.isValid(courseId)) {
      return ApiResponseBuilder.badRequest('Invalid course ID');
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponseBuilder.notFound('Course not found');
    }

    // Check if user is course owner or admin
    if (
      currentUser.role !== 'ADMIN' &&
      course.teacherId.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('You can only delete your own courses');
    }

    // Check if course has enrollments
    const enrollmentCount = await Enrollment.countDocuments({ courseId });
    if (enrollmentCount > 0) {
      return ApiResponseBuilder.badRequest(
        'Cannot delete course with active enrollments. Archive it instead.'
      );
    }

    await Course.findByIdAndDelete(courseId);

    return ApiResponseBuilder.success(null, 'Course deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
});
