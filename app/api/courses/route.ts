// ============================================
// src/app/api/courses/route.ts
// GET /api/courses - List all courses
// POST /api/courses - Create new course (Teacher/Admin only)
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth, requireTeacher } from '@/middleware/auth';
import { getPagination, extractPaginationParams } from '@/lib/utils/pagination';
import { createCourseSchema } from '@/lib/validators/course.validator';
import User from '@/models/User';
// GET /api/courses - List all courses (Public/Authenticated)
export const GET = async (request: NextRequest) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const paginationParams = extractPaginationParams(searchParams);
    const { skip, limit, sort } = getPagination(paginationParams);

    // Build query
    const query: any = {};

    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    } else {
      // By default, only show published courses for non-admins
      query.status = 'PUBLISHED';
    }

    // Filter by level
    const level = searchParams.get('level');
    if (level) {
      query.level = level;
    }

    // Filter by category
    const category = searchParams.get('category');
    if (category) {
      query.category = category;
    }
    

    // Filter by teacher
    const teacherId = searchParams.get('teacherId');
    if (teacherId) {
      query.teacherId = teacherId;
    }

    // Search by title or description
    const search = searchParams.get('search');
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await Course.countDocuments();

    // Get courses with teacher info
    const courses = await Course.find()
      .populate('teacherId', 'firstName lastName email avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Format response
    const formattedCourses = courses.map(course => ({
      ...course,
      _id: course._id.toString(),
      teacherId: course.teacherId ? {
        ...course.teacherId,
        _id: (course.teacherId as any)._id.toString(),
      } : null,
    }));


    return ApiResponseBuilder.paginated(
      formattedCourses,
      paginationParams.page || 1,
      limit,
      total,
      'Courses retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
};

// POST /api/courses - Create new course (Teacher/Admin only)
export const POST = requireTeacher(async (request: NextRequest, currentUser: any) => {
  try {
    await connectDB();

    const body = await request.json();
    const validated = createCourseSchema.parse(body);

    // force default status when teacher creates a course
      // if (!validated.status) {
      //   validated.status = "PUBLISHED";
      // }

    // Create course
    const course = await Course.create({
      ...validated,
      teacherId: currentUser.userId,
      enrollmentCount: 0,
      modules: [],
    });

    // Populate teacher info
    await course.populate('teacherId', 'firstName lastName email');

    return ApiResponseBuilder.created(
      {
        ...course.toObject(),
        _id: (course._id as any).toString(),
        teacherId: {
          ...(course.teacherId as any).toObject(),
          _id: (course.teacherId as any)._id.toString(),
        },
      },
      'Course created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});