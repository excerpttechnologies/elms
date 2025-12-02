// src/app/api/assignments/[id]/publish/route.ts
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Assignment from '@/models/Assignment';
import Course from '@/models/Course';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireTeacher } from '@/middleware/auth';
import { Types } from 'mongoose';
import { AssignmentStatus } from '@/models/Assignment'; // <-- make sure this is exported

export const PUT = requireTeacher(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDB();

    const { id: assignmentId } = await params;

    if (!Types.ObjectId.isValid(assignmentId)) {
      return ApiResponseBuilder.badRequest('Invalid assignment ID');
    }

    const assignment = await Assignment.findById(assignmentId).populate('courseId');
    if (!assignment) {
      return ApiResponseBuilder.notFound('Assignment not found');
    }

    // Check ownership
    const course = assignment.courseId as any;
    if (
      currentUser.role !== 'ADMIN' &&
      course.teacherId.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('Access denied');
    }

    // Validate assignment has questions
    if (!assignment.questions || assignment.questions.length === 0) {
      return ApiResponseBuilder.badRequest(
        'Cannot publish assignment without questions'
      );
    }

    // Use enum value so TS is happy
    assignment.status = AssignmentStatus.PUBLISHED;
    await assignment.save();

    return ApiResponseBuilder.success(
      {
        _id: (assignment!._id as any).toString(),
        status: assignment.status,
      },
      'Assignment published successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
});
