// ============================================
// src/app/api/courses/stats/route.ts
// GET /api/courses/stats - Get course statistics
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAdmin } from '@/middleware/auth';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    // Get total courses
    const totalCourses = await Course.countDocuments();

    // Get courses by status
    const statusStats = await Course.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get courses by level
    const levelStats = await Course.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total enrollments
    const totalEnrollments = await Enrollment.countDocuments();

    // Get active enrollments
    const activeEnrollments = await Enrollment.countDocuments({
      status: 'ACTIVE',
    });

    // Get most popular courses
    const popularCourses = await Course.find()
      .populate('teacherId', 'firstName lastName email')
      .sort({ enrollmentCount: -1 })
      .limit(5)
      .select('title enrollmentCount teacherId')
      .lean();

    return ApiResponseBuilder.success({
      total: totalCourses,
      totalEnrollments,
      activeEnrollments,
      byStatus: statusStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>),
      byLevel: levelStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>),
      popularCourses: popularCourses.map(c => ({
        _id: c._id.toString(),
        title: c.title,
        enrollmentCount: c.enrollmentCount,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
});