// ============================================
// src/app/api/assignments/route.ts
// GET /api/assignments - List all assignments
// POST /api/assignments - Create assignment (Teacher/Admin)
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Assignment from '@/models/Assignment';
import Course from '@/models/Course';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth, requireTeacher } from '@/middleware/auth';
import { getPagination, extractPaginationParams } from '@/lib/utils/pagination';
import { z } from 'zod';

const createAssignmentSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['QUIZ', 'ESSAY', 'PROJECT', 'CODING', 'FILE_UPLOAD']),
  instructions: z.string().optional(),
  questions: z.array(
    z.object({
      question: z.string().min(1),
      type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY']),
      options: z.array(z.string()).optional(),
      correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
      points: z.number().min(0),
      order: z.number().int().min(0),
    })
  ).optional(),
  totalPoints: z.number().min(0),
  passingScore: z.number().min(0).max(100).default(60),
  dueDate: z.string().optional(),
  allowLateSubmission: z.boolean().default(false),
  latePenalty: z.number().min(0).max(100).optional(),
  maxAttempts: z.number().int().min(1).optional(),
  timeLimit: z.number().int().min(0).optional(),
});

// GET /api/assignments - List assignments
export const GET = requireAuth(async (request: NextRequest, currentUser: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const paginationParams = extractPaginationParams(searchParams);
    const { skip, limit, sort } = getPagination(paginationParams);

    // Build query
    const query: any = {};

    const courseId = searchParams.get('courseId');
    if (courseId) {
      query.courseId = courseId;
    }

    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    }

    const type = searchParams.get('type');
    if (type) {
      query.type = type;
    }

    // Teachers see all, students see only published
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'TEACHER') {
      query.status = 'PUBLISHED';
    }

    // Get total count
    const total = await Assignment.countDocuments(query);

    // Get assignments
    const assignments = await Assignment.find(query)
      .populate('courseId', 'title')
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedAssignments = assignments.map(assignment => ({
      ...assignment,
      _id: assignment._id.toString(),
      courseId: assignment.courseId ? {
        ...(assignment.courseId as any),
        _id: (assignment.courseId as any)._id.toString(),
      } : null,
      createdBy: assignment.createdBy ? {
        ...(assignment.createdBy as any),
        _id: (assignment.createdBy as any)._id.toString(),
      } : null,
    }));

    return ApiResponseBuilder.paginated(
      formattedAssignments,
      paginationParams.page || 1,
      limit,
      total
    );
  } catch (error) {
    return handleApiError(error);
  }
});

// POST /api/assignments - Create assignment
export const POST = requireTeacher(async (request: NextRequest, currentUser: any) => {
  try {
    await connectDB();

    const body = await request.json();
    const validated = createAssignmentSchema.parse(body);

    // Check if course exists and user has access
    const course = await Course.findById(validated.courseId);
    if (!course) {
      return ApiResponseBuilder.notFound('Course not found');
    }

    if (
      currentUser.role !== 'ADMIN' &&
      course.teacherId.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('You can only create assignments for your own courses');
    }

    // Create assignment
    const assignment = await Assignment.create({
      ...validated,
      createdBy: currentUser.userId,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
      questions: validated.questions || [],
    });

    await assignment.populate([
      { path: 'courseId', select: 'title' },
      { path: 'createdBy', select: 'firstName lastName email' },
    ]);

    return ApiResponseBuilder.created(
      {
        ...assignment.toObject(),
        _id: (assignment!._id as any).toString(),
        courseId: {
          ...(assignment.courseId as any).toObject(),
          _id: (assignment.courseId as any)._id.toString(),
        },
        createdBy: {
          ...(assignment.createdBy as any).toObject(),
          _id: (assignment.createdBy as any)._id.toString(),
        },
      },
      'Assignment created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});