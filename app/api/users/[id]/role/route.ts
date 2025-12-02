// app/api/users/[id]/role/route.ts
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAdmin } from '@/middleware/auth';
import { updateUserRoleSchema } from '@/lib/validators/user.validator';
import { Types } from 'mongoose';

// PUT /api/users/:id/role - Update user role (Admin only)
export const PUT = requireAdmin(async (
    request: NextRequest,
    currentUser: any,
    context: { params: Promise<{ id: string }> }
) => {
    try {
        await connectDB();

        const { id: userId } = await context.params;

        // Validate ObjectId
        if (!Types.ObjectId.isValid(userId)) {
            return ApiResponseBuilder.badRequest('Invalid user ID');
        }

        // Prevent changing your own role
        if (currentUser.userId === userId) {
            return ApiResponseBuilder.badRequest('Cannot change your own role');
        }

        const body = await request.json();
        const { role } = updateUserRoleSchema.parse(body);

        // Find user first to check if exists
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return ApiResponseBuilder.notFound('User not found');
        }

        // Update user role
        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true, runValidators: true }
        )
            .select('-password -refreshTokens -resetPasswordToken -resetPasswordExpires')
            .lean();

        return ApiResponseBuilder.success(
            {
                ...user,
                _id: user!._id.toString(),
            },
            'User role updated successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
});