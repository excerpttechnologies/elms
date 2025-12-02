// ============================================
// src/app/api/attendance/summary/route.ts
// GET /api/attendance/summary - Get attendance summary
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Attendance from '@/models/Attendance';
import Course from '@/models/Course';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth } from '@/middleware/auth';

export const GET = requireAuth(async (request: NextRequest, currentUser: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    // Build query
    const query: any = {};

    if (currentUser.role === 'STUDENT') {
      query.studentId = currentUser.userId;
    }

    if (courseId) {
      query.courseId = courseId;
    }

    // Get records
    const records = await Attendance.find(query).lean();

    // Calculate statistics
    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const late = records.filter(r => r.status === 'LATE').length;
    const excused = records.filter(r => r.status === 'EXCUSED').length;

    const attendancePercentage = total > 0 ? Math.round((present / total) * 100 * 10) / 10 : 0;

    // Get recent records
    const recentRecords = await Attendance.find(query)
      .populate('courseId', 'title')
      .sort({ date: -1 })
      .limit(10)
      .lean();

    const formattedRecent = recentRecords.map(record => ({
      _id: record._id.toString(),
      date: record.date,
      status: record.status,
      courseId: record.courseId ? {
        ...(record.courseId as any),
        _id: (record.courseId as any)._id.toString(),
      } : null,
    }));

    return ApiResponseBuilder.success({
      summary: {
        totalClasses: total,
        present,
        absent,
        late,
        excused,
        attendancePercentage,
      },
      recentRecords: formattedRecent,
    });
  } catch (error) {
    return handleApiError(error);
  }
});