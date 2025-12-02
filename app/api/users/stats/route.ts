// ============================================
// src/app/api/users/stats/route.ts
// GET /api/users/stats - Get user statistics (Admin only)
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAdmin } from '@/middleware/auth';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    // Get counts by role
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get counts by status
    const statusStats = await User.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Get verified users count
    const verifiedUsers = await User.countDocuments({ emailVerified: true });

    return ApiResponseBuilder.success({
      total: totalUsers,
      newThisMonth: newUsersThisMonth,
      verified: verifiedUsers,
      byRole: roleStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>),
      byStatus: statusStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    return handleApiError(error);
  }
});