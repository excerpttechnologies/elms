// ============================================
// src/app/api/courses/[id]/progress/route.ts
// GET /api/courses/:id/progress - Get student's progress in course
// PUT /api/courses/:id/progress - Update student's progress
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth } from '@/middleware/auth';
import { Types } from 'mongoose';
import { z } from 'zod';

// Get progress
export const GET = requireAuth(async (
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

    const enrollment = await Enrollment.findOne({
      studentId: currentUser.userId,
      courseId,
    }).lean();

    if (!enrollment) {
      return ApiResponseBuilder.notFound('Not enrolled in this course');
    }

    return ApiResponseBuilder.success({
      ...enrollment,
      _id: enrollment._id.toString(),
      studentId: enrollment.studentId.toString(),
      courseId: enrollment.courseId.toString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
});

const updateProgressSchema = z.object({
  moduleId: z.string(),
  lessonId: z.string(),
  completed: z.boolean(),
});

// Update progress
export const PUT = requireAuth(async (
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

    const enrollment = await Enrollment.findOne({
      studentId: currentUser.userId,
      courseId,
    });

    if (!enrollment) {
      return ApiResponseBuilder.notFound('Not enrolled in this course');
    }

    const body = await request.json();
    const validated = updateProgressSchema.parse(body);

    // Find existing progress entry
    const existingIndex = enrollment.progress.findIndex(
      p => p.moduleId === validated.moduleId && p.lessonId === validated.lessonId
    );

    if (existingIndex >= 0) {
      // Update existing
      enrollment.progress[existingIndex].completed = validated.completed;
      if (validated.completed) {
        enrollment.progress[existingIndex].completedAt = new Date();
      }
    } else {
      // Add new
      enrollment.progress.push({
        moduleId: validated.moduleId,
        lessonId: validated.lessonId,
        completed: validated.completed,
        completedAt: validated.completed ? new Date() : undefined,
      });
    }

    // Calculate progress percentage
    const course = await Course.findById(courseId);
    if (course) {
      const totalLessons = course.modules.reduce(
        (sum, module) => sum + module.lessons.length,
        0
      );
      const completedLessons = enrollment.progress.filter(p => p.completed).length;
      enrollment.progressPercentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      // Check if course completed
      if (enrollment.progressPercentage === 100 && !enrollment.completedAt) {
        enrollment.completedAt = new Date();
        enrollment.status = 'COMPLETED' as any;
      }
    }

    await enrollment.save();

    return ApiResponseBuilder.success(
      {
        _id: (enrollment._id as any).toString(),
        progress: enrollment.progress,
        progressPercentage: enrollment.progressPercentage,
        status: enrollment.status,
      },
      'Progress updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});