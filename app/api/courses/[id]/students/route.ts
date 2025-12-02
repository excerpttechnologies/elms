// ============================================
// src/app/api/courses/[id]/students/route.ts
// GET /api/courses/:id/students - Get enrolled students
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireTeacher } from '@/middleware/auth';
import { Types } from 'mongoose';

export const GET = requireTeacher(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const { id: courseId } = await params;

    if (!Types.ObjectId.isValid(courseId)) {
      return ApiResponseBuilder.badRequest('Invalid course ID');
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponseBuilder.notFound('Course not found');
    }

    // Check if user is course teacher or admin
    if (
      currentUser.role !== 'ADMIN' &&
      course.teacherId.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('Access denied');
    }

    // Get enrollments with student info
    const enrollments = await Enrollment.find({ courseId })
      .populate('studentId', 'firstName lastName email avatar')
      .lean();

    const formattedEnrollments = enrollments.map(enrollment => ({
      ...enrollment,
      _id: enrollment._id.toString(),
      studentId: enrollment.studentId ? {
        ...enrollment.studentId,
        _id: (enrollment.studentId as any)._id.toString(),
      } : null,
      courseId: enrollment.courseId.toString(),
    }));

    return ApiResponseBuilder.success(formattedEnrollments);
  } catch (error) {
    return handleApiError(error);
  }
});