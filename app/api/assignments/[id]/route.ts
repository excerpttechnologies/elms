// ============================================
// src/app/api/assignments/[id]/route.ts
// GET /api/assignments/:id - Get assignment by ID
// PUT /api/assignments/:id - Update assignment
// DELETE /api/assignments/:id - Delete assignment
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Assignment from '@/models/Assignment';
import Course from '@/models/Course';
import User from '@/models/User';
import Submission from '@/models/Submission';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth, requireTeacher } from '@/middleware/auth';
import { Types } from 'mongoose';
import { z } from 'zod';

const updateAssignmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  instructions: z.string().optional(),
  totalPoints: z.number().min(0).optional(),
  passingScore: z.number().min(0).max(100).optional(),
  dueDate: z.string().optional(),
  allowLateSubmission: z.boolean().optional(),
  latePenalty: z.number().min(0).max(100).optional(),
  maxAttempts: z.number().int().min(1).optional(),
  timeLimit: z.number().int().min(0).optional(),
});

// GET /api/assignments/:id
export const GET = requireAuth(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    // const assignmentId = params.id;
     const { id: assignmentId } = await params;

    if (!Types.ObjectId.isValid(assignmentId)) {
      return ApiResponseBuilder.badRequest('Invalid assignment ID');
    }

    const assignment = await Assignment.findById(assignmentId)
      .populate('courseId', 'title')
      .populate('createdBy', 'firstName lastName email')
      .lean();

    if (!assignment) {
      return ApiResponseBuilder.notFound('Assignment not found');
    }

    // Hide correct answers from students
    if (currentUser.role === 'STUDENT') {
      assignment.questions = assignment.questions.map(q => {
        const { correctAnswer, ...rest } = q;
        return rest as any;
      });
    }

    return ApiResponseBuilder.success({
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
    });
  } catch (error) {
    return handleApiError(error);
  }
});

// PUT /api/assignments/:id
export const PUT = requireTeacher(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    // const assignmentId = params.id;
     const { id: assignmentId } = await params;

    if (!Types.ObjectId.isValid(assignmentId)) {
      return ApiResponseBuilder.badRequest('Invalid assignment ID');
    }

    const assignment = await Assignment.findById(assignmentId).populate('courseId');
    if (!assignment) {
      return ApiResponseBuilder.notFound('Assignment not found');
    }

    // Check ownership
    const course = assignment.courseId as any;
    if (
      currentUser.role !== 'ADMIN' &&
      course.teacherId.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('Access denied');
    }

    const body = await request.json();
    const validated = updateAssignmentSchema.parse(body);

    // Update assignment
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
      },
      { new: true, runValidators: true }
    )
      .populate('courseId', 'title')
      .populate('createdBy', 'firstName lastName email')
      .lean();

    return ApiResponseBuilder.success(
      {
        ...updatedAssignment,
        _id: updatedAssignment!._id.toString(),
        courseId: {
          ...(updatedAssignment!.courseId as any),
          _id: (updatedAssignment!.courseId as any)._id.toString(),
        },
        createdBy: {
          ...(updatedAssignment!.createdBy as any),
          _id: (updatedAssignment!.createdBy as any)._id.toString(),
        },
      },
      'Assignment updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});

// DELETE /api/assignments/:id
export const DELETE = requireTeacher(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    // const assignmentId = params.id;
     const { id: assignmentId } = await params;
     console.log("[DELETE] assignmentId:", assignmentId, "user:", currentUser?.userId, "role:", currentUser?.role);

    if (!Types.ObjectId.isValid(assignmentId)) {
      console.warn("[DELETE] invalid ObjectId:", assignmentId);
      return ApiResponseBuilder.badRequest('Invalid assignment ID');
    }

    const assignment = await Assignment.findById(assignmentId).populate('courseId');
    if (!assignment) {
       console.warn("[DELETE] missing assignmentId");
      return ApiResponseBuilder.notFound('Assignment not found');
    }

    // Check ownership
    const course = assignment.courseId as any;
     if (!course) {
        console.warn("[DELETE] assignment has no course:", assignmentId);
        return ApiResponseBuilder.badRequest("Assignment has no course associated");
      }
    if (
      currentUser.role !== 'ADMIN' &&
      String(course.teacherId) !== String(currentUser.userId)
    ) {
      console.warn("[DELETE] access denied. course.teacherId:", String(course.teacherId), "currentUser:", currentUser.userId);
      return ApiResponseBuilder.forbidden('Access denied');
    }

    // Check if there are submissions
    const submissionCount = await Submission.countDocuments({ assignmentId });
    console.log("[DELETE] submissionCount:", submissionCount, "for assignment:", assignmentId);

    if (submissionCount > 0) {
      console.warn("[DELETE] cannot delete - submissions exist:", submissionCount);
      return ApiResponseBuilder.badRequest(
        'Cannot delete assignment with existing submissions'
      );
    }

    await Assignment.findByIdAndDelete(assignmentId);
    console.log("[DELETE] assignment deleted:", assignmentId);

    return ApiResponseBuilder.success(null, 'Assignment deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
});