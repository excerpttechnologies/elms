import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireTeacher } from '@/middleware/auth';
import { Types } from 'mongoose';
import { z } from 'zod';

const addModuleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  order: z.number().int().min(0),
});

export const POST = requireTeacher(async (
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

    const body = await request.json();
    const validated = addModuleSchema.parse(body);

    // Add module
    course.modules.push({
      title: validated.title,
      description: validated.description,
      order: validated.order,
      lessons: [],
    });

    await course.save();

    return ApiResponseBuilder.created(
      {
        _id: (course._id as any).toString(),
        modules: course.modules,
      },
      'Module added successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});
