// ============================================
// src/app/api/users/route.ts
// GET /api/users - List all users (Admin only)
// POST /api/users - Create new user (Admin only)
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth/password';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAdmin } from '@/middleware/auth';
import { getPagination, extractPaginationParams } from '@/lib/utils/pagination';
import { registerSchema } from '@/lib/validators/auth.validator';

// GET /api/users - List all users with pagination, search, and filters
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const paginationParams = extractPaginationParams(searchParams);
    const { skip, limit, sort } = getPagination(paginationParams);

    // Build query
    const query: any = {};
    
    // Filter by role
    const role = searchParams.get('role');
    console.log('Role filter:', role);
    if (role) {
      query.role = role;
    }

    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    }

    // Search by name or email
    const search = searchParams.get('search');
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await User.countDocuments();

    // Get users
    const users = await User.find()
      .select('-password -refreshTokens -resetPasswordToken -resetPasswordExpires')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
 console.log('Fetched users:', users);
    // Convert _id to string for each user
    const formattedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString(),
    }));

    return ApiResponseBuilder.paginated(
      formattedUsers,
      paginationParams.page || 1,
      limit,
      total,
      'Users retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});

// POST /api/users - Create new user (Admin only)
export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return ApiResponseBuilder.badRequest('Email already exists');
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

    return ApiResponseBuilder.created(
      {
        _id: (user._id as any).toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
      'User created successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});
