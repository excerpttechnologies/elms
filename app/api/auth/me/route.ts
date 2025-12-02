import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { getUserFromRequest } from '@/lib/utils/token-helper';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const tokenUser = getUserFromRequest(request);
    if (!tokenUser) {
      return ApiResponseBuilder.unauthorized('Not authenticated');
    }

    // Get user from database
    const user = await User.findById(tokenUser.userId);
    if (!user) {
      return ApiResponseBuilder.notFound('User not found');
    }
    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return ApiResponseBuilder.success({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}