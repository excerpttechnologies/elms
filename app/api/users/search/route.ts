// ============================================
// src/app/api/users/search/route.ts
// GET /api/users/search - Search users by name or email
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth } from '@/middleware/auth';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const role = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return ApiResponseBuilder.badRequest('Search query must be at least 2 characters');
    }

    const searchQuery: any = {
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    };

    if (role) {
      searchQuery.role = role;
    }

    const users = await User.find(searchQuery)
      .select('firstName lastName email role avatar')
      .limit(limit)
      .lean();

    return ApiResponseBuilder.success(
      users.map(u => ({
        ...u,
        _id: u._id.toString(),
        fullName: `${u.firstName} ${u.lastName}`,
      }))
    );
  } catch (error) {
    return handleApiError(error);
  }
});