import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { comparePassword } from '@/lib/auth/password';
import { generateTokenPair } from '@/lib/auth/jwt';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { loginSchema } from '@/lib/validators/auth.validator';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validated = loginSchema.parse(body);

    // Find user with password field
    const user = await User.findOne({ email: validated.email }).select('+password');
    if (!user) {
      return ApiResponseBuilder.unauthorized('Invalid email or password');
    }

    // Check password
    const isValidPassword = await comparePassword(validated.password, user.password);
    if (!isValidPassword) {
      return ApiResponseBuilder.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return ApiResponseBuilder.forbidden(`Account is ${user.status.toLowerCase()}`);
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token and update last login
    user.refreshTokens.push(tokens.refreshToken);
    user.lastLogin = new Date();
    await user.save();

    // Create response
    const response = ApiResponseBuilder.success(
      {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      'Login successful'
    );

    // Set HTTP-only cookie
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