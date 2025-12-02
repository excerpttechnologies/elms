// ============================================
// src/app/api/assignments/stats/route.ts
// GET /api/assignments/stats - Get assignment statistics
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireTeacher } from '@/middleware/auth';

export const GET = requireTeacher(async (request: NextRequest, currentUser: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const assignmentQuery: any = {};
    if (courseId) {
      assignmentQuery.courseId = courseId;
    }

    // Get total assignments
    const totalAssignments = await Assignment.countDocuments(assignmentQuery);

    // Get assignments by status
    const statusStats = await Assignment.aggregate([
      { $match: assignmentQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get assignments by type
    const typeStats = await Assignment.aggregate([
      { $match: assignmentQuery },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get submission statistics
    const assignments = await Assignment.find(assignmentQuery).select('_id');
    const assignmentIds = assignments.map(a => a._id);

    const totalSubmissions = await Submission.countDocuments({
      assignmentId: { $in: assignmentIds },
    });

    const gradedSubmissions = await Submission.countDocuments({
      assignmentId: { $in: assignmentIds },
      status: 'GRADED',
    });

    const pendingSubmissions = await Submission.countDocuments({
      assignmentId: { $in: assignmentIds },
      status: { $in: ['PENDING', 'SUBMITTED'] },
    });

    return ApiResponseBuilder.success({
      totalAssignments,
      totalSubmissions,
      gradedSubmissions,
      pendingSubmissions,
      byStatus: statusStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>),
      byType: typeStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    return handleApiError(error);
  }
});