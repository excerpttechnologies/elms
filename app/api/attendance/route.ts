// ============================================
// src/app/api/attendance/route.ts
// GET /api/attendance - Get attendance records
// POST /api/attendance - Mark attendance (bulk)
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Attendance from '@/models/Attendance';
import Course from '@/models/Course';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth, requireTeacher } from '@/middleware/auth';
import { getPagination, extractPaginationParams } from '@/lib/utils/pagination';
import { z } from 'zod';

// GET /api/attendance - Get attendance records
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

    const studentId = searchParams.get('studentId');
    if (studentId) {
      query.studentId = studentId;
    }

    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    }

    // Date range filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Students can only see their own attendance
    if (currentUser.role === 'STUDENT') {
      query.studentId = currentUser.userId;
    }

    // Get total count
    const total = await Attendance.countDocuments(query);

    // Get attendance records
    const records = await Attendance.find(query)
      .populate('studentId', 'firstName lastName email avatar')
      .populate('courseId', 'title')
      .populate('markedBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedRecords = records.map(record => ({
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
    }));

    return ApiResponseBuilder.paginated(
      formattedRecords,
      paginationParams.page || 1,
      limit,
      total
    );
  } catch (error) {
    return handleApiError(error);
  }
});

const bulkAttendanceSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  date: z.string(),
  attendance: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
      notes: z.string().optional(),
    })
  ),
});

// POST /api/attendance - Bulk mark attendance
export const POST = requireTeacher(async (request: NextRequest, currentUser: any) => {
  try {
    await connectDB();

    const body = await request.json();
    const validated = bulkAttendanceSchema.parse(body);

    // Check if course exists and user has access
    const course = await Course.findById(validated.courseId);
    if (!course) {
      return ApiResponseBuilder.notFound('Course not found');
    }

    if (
      currentUser.role !== 'ADMIN' &&
      course.teacherId.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('You can only mark attendance for your own courses');
    }

    const attendanceDate = new Date(validated.date);

    // Check if attendance already marked for this date
    const existingRecords = await Attendance.find({
      courseId: validated.courseId,
      date: {
        $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
        $lt: new Date(attendanceDate.setHours(23, 59, 59, 999)),
      },
    });

    if (existingRecords.length > 0) {
      return ApiResponseBuilder.badRequest(
        'Attendance already marked for this date. Use update endpoint to modify.'
      );
    }

    // Validate all students are enrolled
    const studentIds = validated.attendance.map(a => a.studentId);
    const enrollments = await Enrollment.find({
      courseId: validated.courseId,
      studentId: { $in: studentIds },
      status: 'ACTIVE',
    });

    if (enrollments.length !== studentIds.length) {
      return ApiResponseBuilder.badRequest('Some students are not enrolled in this course');
    }

    // Create attendance records
    const attendanceRecords = validated.attendance.map(record => ({
      courseId: validated.courseId,
      studentId: record.studentId,
      date: new Date(validated.date),
      status: record.status,
      notes: record.notes,
      markedBy: currentUser.userId,
    }));

    const created = await Attendance.insertMany(attendanceRecords);

    return ApiResponseBuilder.created(
      {
        count: created.length,
        date: validated.date,
        courseId: validated.courseId,
      },
      `Attendance marked for ${created.length} students`
    );
  } catch (error) {
    return handleApiError(error);
  }
});
