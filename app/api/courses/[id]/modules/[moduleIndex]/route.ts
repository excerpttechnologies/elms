// src/app/api/courses/[id]/modules/[moduleIndex]/route.ts
// PUT /api/courses/:id/modules/:moduleIndex - Update module
// DELETE /api/courses/:id/modules/:moduleIndex - Delete module

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireTeacher } from '@/middleware/auth';
import { Types } from 'mongoose';
import { z } from 'zod';

const updateModuleSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const PUT = requireTeacher(async (
  request: NextRequest,
  currentUser: any,
  context: { params: Promise<{ id: string; moduleIndex: string }> } // keep as Promise if your Next types expect it
) => {
  try {
    await connectDB();

    const { id: courseId, moduleIndex } = await context.params;
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

    if (!Array.isArray(course.modules) || moduleIdx >= course.modules.length) {
      return ApiResponseBuilder.notFound('Module not found');
    }

    const body = await request.json();
    const validated = updateModuleSchema.parse(body);

    // Update module
    const moduleDoc = course.modules[moduleIdx];
    if (validated.title !== undefined) moduleDoc.title = validated.title;
    if (validated.description !== undefined) moduleDoc.description = validated.description;
    if (validated.order !== undefined) moduleDoc.order = validated.order;

    await course.save();

    // Return updated module (serialize subdoc properly)
    const updatedModule = (moduleDoc as any).toObject ? (moduleDoc as any).toObject() : moduleDoc;
    if ((updatedModule as any)._id) (updatedModule as any)._id = (moduleDoc as any)._id.toString();

    return ApiResponseBuilder.success(
      {
        _id: (course._id as any).toString(),
        module: updatedModule,
      },
      'Module updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});

export const DELETE = requireTeacher(async (
  request: NextRequest,
  currentUser: any,
  context: { params: Promise<{ id: string; moduleIndex: string }> }
) => {
  try {
    await connectDB();

    const { id: courseId, moduleIndex } = await context.params;
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

    if (!Array.isArray(course.modules) || moduleIdx >= course.modules.length) {
      return ApiResponseBuilder.notFound('Module not found');
    }

    // Remove module
    course.modules.splice(moduleIdx, 1);
    await course.save();

    return ApiResponseBuilder.success(null, 'Module deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
});
