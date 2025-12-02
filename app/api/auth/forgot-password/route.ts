import { NextRequest } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { forgotPasswordSchema } from '@/lib/validators/auth.validator';
import { sendEmail } from '@/lib/email/mailer';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validated = forgotPasswordSchema.parse(body);

    // Find user
    const user = await User.findOne({ email: validated.email });
    if (!user) {
      // Don't reveal if user exists or not
      return ApiResponseBuilder.success(
        null,
        'If that email exists, a password reset link has been sent'
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save token to user (expires in 1 hour)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Send email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `<p>Hello ${user.firstName},</p><p>Please use the following token to reset your password: ${resetToken}</p>`,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
    }

    return ApiResponseBuilder.success(
      null,
      'If that email exists, a password reset link has been sent'
    );
  } catch (error) {
    return handleApiError(error);
  }
}