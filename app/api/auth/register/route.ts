import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth/password';
import { generateTokenPair } from '@/lib/auth/jwt';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { registerSchema } from '@/lib/validators/auth.validator';
import { sendEmail } from '@/lib/email/mailer';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return ApiResponseBuilder.badRequest('Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(validated.password);

    // Create user
    const user = await User.create({
      email: validated.email,
      password: hashedPassword,
      firstName: validated.firstName,
      lastName: validated.lastName,
      role: validated.role || 'STUDENT',
      phoneNumber: validated.phoneNumber,
      dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : undefined,
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token
    user.refreshTokens = [tokens.refreshToken];
    await user.save();

    // Send welcome email (optional - don't block response)
    sendEmail({
      to: user.email,
      subject: 'Welcome to LMS Platform',
      html: `<p>Hi ${user.firstName || ''}, welcome to LMS Platform!</p>`,
    }).catch(err => console.error('Email error:', err));

    // Create response
    const response = ApiResponseBuilder.created(
      {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      'Registration successful'
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