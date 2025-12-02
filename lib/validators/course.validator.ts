import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().max(500).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  duration: z.number().optional(),
  price: z.number().min(0).optional(),
  capacity: z.number().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  learningOutcomes: z.array(z.string()).optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const queryCourseSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});