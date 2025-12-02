// ============================================
// src/app/api/enrollments/route.ts
// GET /api/enrollments - Get all enrollments (Admin/Teacher)
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Enrollment from '@/models/Enrollment';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireTeacher } from '@/middleware/auth';
import { getPagination, extractPaginationParams } from '@/lib/utils/pagination';

export const GET = requireTeacher(async (request: NextRequest, currentUser: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const paginationParams = extractPaginationParams(searchParams);
    const { skip, limit, sort } = getPagination(paginationParams);

    // Build query
    const query: any = {};

    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    }

    const courseId = searchParams.get('courseId');
    if (courseId) {
      query.courseId = courseId;
    }

    const studentId = searchParams.get('studentId');
    if (studentId) {
      query.studentId = studentId;
    }

    // Get total count
    const total = await Enrollment.countDocuments();

    // Get enrollments
    const enrollments = await Enrollment.find()
      .populate('studentId', 'firstName lastName email avatar')
      .populate('courseId', 'title thumbnail')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedEnrollments = enrollments.map(enrollment => ({
      ...enrollment,
      _id: enrollment._id.toString(),
      studentId: enrollment.studentId ? {
        ...enrollment.studentId,
        _id: (enrollment.studentId as any)._id.toString(),
      } : null,
      courseId: enrollment.courseId ? {
        ...enrollment.courseId,
        _id: (enrollment.courseId as any)._id.toString(),
      } : null,
    }));

    return ApiResponseBuilder.paginated(
      formattedEnrollments,
      paginationParams.page || 1,
      limit,
      total
    );
  } catch (error) {
    return handleApiError(error);
  }
});
