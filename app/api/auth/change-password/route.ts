import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { comparePassword, hashPassword } from '@/lib/auth/password';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { getUserFromRequest } from '@/lib/utils/token-helper';
import { changePasswordSchema } from '@/lib/validators/auth.validator';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const tokenUser = getUserFromRequest(request);
    if (!tokenUser) {
      return ApiResponseBuilder.unauthorized('Not authenticated');
    }

    const body = await request.json();
    const validated = changePasswordSchema.parse(body);

    // Get user with password
    const user = await User.findById(tokenUser.userId).select('+password');
    if (!user) {
      return ApiResponseBuilder.notFound('User not found');
    }

    // Verify current password
    const isValidPassword = await comparePassword(
      validated.currentPassword,
      user.password
    );
    if (!isValidPassword) {
      return ApiResponseBuilder.badRequest('Current password is incorrect');
    }

    // Update password
    user.password = await hashPassword(validated.newPassword);
    await user.save();

    return ApiResponseBuilder.success(null, 'Password changed successfully');
  } catch (error) {
    return handleApiError(error);
  }
}