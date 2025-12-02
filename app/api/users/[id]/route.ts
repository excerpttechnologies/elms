// ============================================
// src/app/api/users/[id]/route.ts
// GET /api/users/:id - Get user by ID
// PUT /api/users/:id - Update user
// DELETE /api/users/:id - Delete user
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAuth } from '@/middleware/auth';
import { updateUserSchema } from '@/lib/validators/user.validator';
import { Types } from 'mongoose';

// GET /api/users/:id - Get user by ID
export const GET = requireAuth(async (
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

        // Users can only view their own profile unless they're admin
        if (currentUser.role !== 'ADMIN' && currentUser.userId !== userId) {
            return ApiResponseBuilder.forbidden('Access denied');
        }

        const user = await User.findById(userId)
            .select('-password -refreshTokens -resetPasswordToken -resetPasswordExpires')
            .lean();

        if (!user) {
            return ApiResponseBuilder.notFound('User not found');
        }

        return ApiResponseBuilder.success({
            ...user,
            _id: user._id.toString(),
        });
    } catch (error) {
        return handleApiError(error);
    }
});

// PUT /api/users/:id - Update user
export const PUT = requireAuth(async (
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

        // Users can only update their own profile unless they're admin
        if (currentUser.role !== 'ADMIN' && currentUser.userId !== userId) {
            return ApiResponseBuilder.forbidden('Access denied');
        }

        const body = await request.json();
        const validated = updateUserSchema.parse(body);

        // Find user first to check if exists
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return ApiResponseBuilder.notFound('User not found');
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            userId,
            validated,
            { new: true, runValidators: true }
        )
            .select('-password -refreshTokens -resetPasswordToken -resetPasswordExpires')
            .lean();

        return ApiResponseBuilder.success(
            {
                ...user,
                _id: user!._id.toString(),
            },
            'User updated successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
});

// DELETE /api/users/:id - Delete user (Admin only)
export const DELETE = requireAuth(async (
    request: NextRequest,
    currentUser: any,
    context: { params: Promise<{ id: string }> }
) => {
    try {
        await connectDB();

        // Only admins can delete users
        if (currentUser.role !== 'ADMIN') {
            return ApiResponseBuilder.forbidden('Only admins can delete users');
        }

        const { id: userId } = await context.params;

        // Validate ObjectId
        if (!Types.ObjectId.isValid(userId)) {
            return ApiResponseBuilder.badRequest('Invalid user ID');
        }

        // Prevent deleting yourself
        if (currentUser.userId === userId) {
            return ApiResponseBuilder.badRequest('Cannot delete your own account');
        }

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return ApiResponseBuilder.notFound('User not found');
        }

        // TODO: In production, you might want to:
        // - Delete user's enrollments
        // - Delete user's submissions
        // - Archive user's data instead of deleting
        // - Send notification email

        return ApiResponseBuilder.success(null, 'User deleted successfully');
    } catch (error) {
        return handleApiError(error);
    }
});