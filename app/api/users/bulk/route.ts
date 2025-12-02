// ============================================
// src/app/api/users/bulk/route.ts
// POST /api/users/bulk - Bulk create users (Admin only)
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth/password';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireAdmin } from '@/middleware/auth';
import { z } from 'zod';

const bulkUserSchema = z.object({
  users: z.array(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      role: z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']).optional(),
      phoneNumber: z.string().optional(),
    })
  ),
});

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    await connectDB();

    const body = await request.json();
    const validated = bulkUserSchema.parse(body);

    // Check for duplicate emails
    const emails = validated.users.map(u => u.email);
    const existingUsers = await User.find({ email: { $in: emails } });
    
    if (existingUsers.length > 0) {
      const existingEmails = existingUsers.map(u => u.email);
      return ApiResponseBuilder.badRequest(
        `These emails already exist: ${existingEmails.join(', ')}`
      );
    }

    // Hash all passwords
    const usersToCreate = await Promise.all(
      validated.users.map(async (userData) => ({
        ...userData,
        password: await hashPassword(userData.password),
        role: userData.role || 'STUDENT',
      }))
    );

    // Bulk insert
    const createdUsers = await User.insertMany(usersToCreate);

    return ApiResponseBuilder.created(
      {
        count: createdUsers.length,
        users: createdUsers.map(u => ({
          _id: (u._id as any).toString(),
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
        })),
      },
      `${createdUsers.length} users created successfully`
    );
  } catch (error) {
    return handleApiError(error);
  }
});
