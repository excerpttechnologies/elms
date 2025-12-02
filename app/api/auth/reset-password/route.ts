import { NextRequest } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth/password';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { resetPasswordSchema } from '@/lib/validators/auth.validator';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validated = resetPasswordSchema.parse(body);

    // Hash the token from URL
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(validated.token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return ApiResponseBuilder.badRequest('Invalid or expired reset token');
    }

    // Update password
    user.password = await hashPassword(validated.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // Clear all refresh tokens (logout from all devices)
    user.refreshTokens = [];
    
    await user.save();

    return ApiResponseBuilder.success(null, 'Password reset successful');
  } catch (error) {
    return handleApiError(error);
  }
}