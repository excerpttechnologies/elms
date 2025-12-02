// ============================================
// src/app/api/attendance/[id]/route.ts
// GET /api/attendance/:id - Get attendance record
// PUT /api/attendance/:id - Update attendance record
// DELETE /api/attendance/:id - Delete attendance record
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Attendance from '@/models/Attendance';
import Course from '@/models/Course';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth, requireTeacher } from '@/middleware/auth';
import { Types } from 'mongoose';
import { z } from 'zod';

// GET /api/attendance/:id
export const GET = requireAuth(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const attendanceId = params.id;

    if (!Types.ObjectId.isValid(attendanceId)) {
      return ApiResponseBuilder.badRequest('Invalid attendance ID');
    }

    const record = await Attendance.findById(attendanceId)
      .populate('studentId', 'firstName lastName email')
      .populate('courseId', 'title')
      .populate('markedBy', 'firstName lastName')
      .lean();

    if (!record) {
      return ApiResponseBuilder.notFound('Attendance record not found');
    }

    // Students can only view their own records
    if (
      currentUser.role === 'STUDENT' &&
      record.studentId &&
      (record.studentId as any)._id.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('Access denied');
    }

    return ApiResponseBuilder.success({
      ...record,
      _id: record._id.toString(),
      studentId: record.studentId ? {
        ...(record.studentId as any),
        _id: (record.studentId as any)._id.toString(),
      } : null,
      courseId: record.courseId ? {
        ...(record.courseId as any),
        _id: (record.courseId as any)._id.toString(),
      } : null,
      markedBy: record.markedBy ? {
        ...(record.markedBy as any),
        _id: (record.markedBy as any)._id.toString(),
      } : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
});

const updateAttendanceSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  notes: z.string().optional(),
});

// PUT /api/attendance/:id
export const PUT = requireTeacher(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const attendanceId = params.id;

    if (!Types.ObjectId.isValid(attendanceId)) {
      return ApiResponseBuilder.badRequest('Invalid attendance ID');
    }

    const record = await Attendance.findById(attendanceId).populate('courseId');
    if (!record) {
      return ApiResponseBuilder.notFound('Attendance record not found');
    }

    // Check ownership
    const course = record.courseId as any;
    if (
      currentUser.role !== 'ADMIN' &&
      course.teacherId.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('Access denied');
    }

    const body = await request.json();
    const validated = updateAttendanceSchema.parse(body);

    // Update record
    record.status = validated.status as any;
    if (validated.notes !== undefined) {
      record.notes = validated.notes;
    }
    record.markedBy = new Types.ObjectId(currentUser.userId);

    await record.save();

    await record.populate([
      { path: 'studentId', select: 'firstName lastName email' },
      { path: 'courseId', select: 'title' },
      { path: 'markedBy', select: 'firstName lastName' },
    ]);

    return ApiResponseBuilder.success(
      {
        ...record.toObject(),
        _id: (record._id as any).toString(),
        studentId: {
          ...(record.studentId as any).toObject(),
          _id: (record.studentId as any)._id.toString(),
        },
        courseId: {
          ...(record.courseId as any).toObject(),
          _id: (record.courseId as any)._id.toString(),
        },
        markedBy: {
          ...(record.markedBy as any).toObject(),
          _id: (record.markedBy as any)._id.toString(),
        },
      },
      'Attendance updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});

// DELETE /api/attendance/:id
export const DELETE = requireTeacher(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const attendanceId = params.id;

    if (!Types.ObjectId.isValid(attendanceId)) {
      return ApiResponseBuilder.badRequest('Invalid attendance ID');
    }

    const record = await Attendance.findById(attendanceId).populate('courseId');
    if (!record) {
      return ApiResponseBuilder.notFound('Attendance record not found');
    }

    // Check ownership
    const course = record.courseId as any;
    if (
      currentUser.role !== 'ADMIN' &&
      course.teacherId.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('Access denied');
    }

    await Attendance.findByIdAndDelete(attendanceId);

    return ApiResponseBuilder.success(null, 'Attendance record deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
});
