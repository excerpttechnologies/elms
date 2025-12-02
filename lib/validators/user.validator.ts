import { z } from 'zod';

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

export const queryUsersSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
