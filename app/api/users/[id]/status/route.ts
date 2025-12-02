// ============================================
// src/app/api/users/[id]/status/route.ts
// PUT /api/users/:id/status - Update user status (Admin only)
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAdmin } from '@/middleware/auth';
import { updateUserStatusSchema } from '@/lib/validators/user.validator';
import { Types } from 'mongoose';

export const PUT = requireAdmin(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    const userId = params.id;

    // Validate ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return ApiResponseBuilder.badRequest('Invalid user ID');
    }

    // Prevent changing your own status
    if (currentUser.userId === userId) {
      return ApiResponseBuilder.badRequest('Cannot change your own status');
    }

    const body = await request.json();
    const validated = updateUserStatusSchema.parse(body);

    const user = await User.findByIdAndUpdate(
      userId,
      { status: validated.status },
      { new: true }
    )
      .select('-password -refreshTokens')
      .lean();

    if (!user) {
      return ApiResponseBuilder.notFound('User not found');
    }

    // If suspending user, clear their refresh tokens (logout from all devices)
    if (validated.status === 'SUSPENDED' || validated.status === 'INACTIVE') {
      await User.findByIdAndUpdate(userId, { refreshTokens: [] });
    }

    return ApiResponseBuilder.success(
      {
        ...user,
        _id: user._id.toString(),
      },
      `User ${validated.status.toLowerCase()} successfully`
    );
  } catch (error) {
    return handleApiError(error);
  }
});