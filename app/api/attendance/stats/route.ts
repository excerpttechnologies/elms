// ============================================
// src/app/api/attendance/stats/route.ts
// GET /api/attendance/stats - Get attendance statistics (Admin)
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Attendance from '@/models/Attendance';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAdmin } from '@/middleware/auth';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    // Get total records
    const totalRecords = await Attendance.countDocuments();

    // Get stats by status
    const statusStats = await Attendance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
    });

    // Get this week's attendance
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const weekAttendance = await Attendance.countDocuments({
      date: { $gte: weekStart },
    });

    return ApiResponseBuilder.success({
      totalRecords,
      todayAttendance,
      weekAttendance,
      byStatus: statusStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    return handleApiError(error);
  }
});