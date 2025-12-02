import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireTeacher } from '@/middleware/auth';
import { Types } from 'mongoose';
import { z } from 'zod';

const addLessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
  order: z.number().int().min(0),
  resources: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      type: z.string(),
    })
  ).optional(),
});

export const POST = requireTeacher(async (
  request: NextRequest,
  currentUser: any,
  context: { params: Promise<{ id: string; moduleIndex: string }> } // <- keep as Promise if your project expects it
) => {
  try {
    await connectDB();

    const { id: courseId, moduleIndex } = await context.params; // await the promise
    const moduleIdx = parseInt(moduleIndex, 10);

    if (!Types.ObjectId.isValid(courseId)) {
      return ApiResponseBuilder.badRequest('Invalid course ID');
    }

    if (Number.isNaN(moduleIdx) || moduleIdx < 0) {
      return ApiResponseBuilder.badRequest('Invalid module index');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponseBuilder.notFound('Course not found');
    }

    if (
      currentUser.role !== 'ADMIN' &&
      course.teacherId.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('Access denied');
    }

    // ensure modules exists and index in range
    if (!Array.isArray(course.modules) || moduleIdx >= course.modules.length) {
      return ApiResponseBuilder.notFound('Module not found');
    }

    const body = await request.json();
    const validated = addLessonSchema.parse(body);

    // Add lesson
    course.modules[moduleIdx].lessons.push({
      title: validated.title,
      description: validated.description,
      content: validated.content,
      videoUrl: validated.videoUrl,
      duration: validated.duration,
      order: validated.order,
      resources: validated.resources || [],
    });

    await course.save();

    return ApiResponseBuilder.created(
      {
        _id: (course._id as any).toString(),
        module: course.modules[moduleIdx],
      },
      'Lesson added successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});
