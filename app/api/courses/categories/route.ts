// ============================================
// src/app/api/courses/categories/route.ts
// GET /api/courses/categories - Get all course categories
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get unique categories
    const categories = await Course.distinct('category');

    // Get count per category
    const categoryCounts = await Course.aggregate([
      {
        $match: {
          category: { $nin: [null, ''] },
          status: 'PUBLISHED',
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return ApiResponseBuilder.success({
      categories: categories.filter(c => c),
      categoriesWithCount: categoryCounts.map(c => ({
        category: c._id,
        count: c.count,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
