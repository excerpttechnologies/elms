import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { generateTokenPair, verifyRefreshToken } from '@/lib/auth/jwt';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { refreshTokenSchema } from '@/lib/validators/auth.validator';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validated = refreshTokenSchema.parse(body);

    // Verify refresh token
    const decoded = verifyRefreshToken(validated.refreshToken);
    if (!decoded) {
      return ApiResponseBuilder.unauthorized('Invalid refresh token');
    }

    // Check if refresh token exists in database
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(validated.refreshToken)) {
      return ApiResponseBuilder.unauthorized('Invalid refresh token');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return ApiResponseBuilder.forbidden('Account is not active');
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    });

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== validated.refreshToken
    );
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    // Create response
    const response = ApiResponseBuilder.success(
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      'Token refreshed successfully'
    );

    // Update cookie
    response.cookies.set('token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}