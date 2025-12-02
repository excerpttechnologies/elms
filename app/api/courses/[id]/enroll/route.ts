// ============================================
// src/app/api/courses/[id]/enroll/route.ts
// POST /api/courses/:id/enroll - Enroll in course
// DELETE /api/courses/:id/enroll - Unenroll from course
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth } from '@/middleware/auth';
import { Types } from 'mongoose';

// Enroll in course
export const POST = requireAuth(async (
  request: NextRequest,
  currentUser: any,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDB();

    // Await params to unwrap the Promise
    const { id: courseId } = await context.params;

    if (!Types.ObjectId.isValid(courseId)) {
      return ApiResponseBuilder.badRequest('Invalid course ID');
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponseBuilder.notFound('Course not found');
    }

    // Check if course is published
    if (course.status !== 'PUBLISHED') {
      return ApiResponseBuilder.badRequest('Course is not available for enrollment');
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: currentUser.userId,
      courseId,
    });

    if (existingEnrollment) {
      return ApiResponseBuilder.badRequest('Already enrolled in this course');
    }

    // Check capacity
    if (course.capacity && course.enrollmentCount >= course.capacity) {
      return ApiResponseBuilder.badRequest('Course is full');
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId: currentUser.userId,
      courseId,
      status: 'ACTIVE',
      enrolledAt: new Date(),
    });

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 },
    });

    return ApiResponseBuilder.created(
      {
        _id: (enrollment._id as any).toString(),
        courseId: enrollment.courseId.toString(),
        studentId: enrollment.studentId.toString(),
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
      },
      'Enrolled successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});

// Unenroll from course
export const DELETE = requireAuth(async (
  request: NextRequest,
  currentUser: any,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDB();

    // Await params to unwrap the Promise
    const { id: courseId } = await context.params;

    if (!Types.ObjectId.isValid(courseId)) {
      return ApiResponseBuilder.badRequest('Invalid course ID');
    }

    // Find enrollment
    const enrollment = await Enrollment.findOne({
      studentId: currentUser.userId,
      courseId,
    });

    if (!enrollment) {
      return ApiResponseBuilder.notFound('Not enrolled in this course');
    }

    // Delete enrollment
    await Enrollment.findByIdAndDelete(enrollment._id);

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: -1 },
    });

    return ApiResponseBuilder.success(null, 'Unenrolled successfully');
  } catch (error) {
    return handleApiError(error);
  }
});