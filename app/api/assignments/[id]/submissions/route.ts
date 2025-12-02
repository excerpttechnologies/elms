// ============================================

// GET /api/assignments/submissions - Get all submissions for assignment
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Assignment from '@/models/Assignment';
import Course from '@/models/Course';
import User from '@/models/User';
import Submission from '@/models/Submission';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireTeacher } from '@/middleware/auth';
import { Types } from 'mongoose';

export const GET = requireTeacher(async (
  request: NextRequest,
  currentUser: any,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();

    // Step 1: Get all assignments of this teacher
    const teacherCourseIds = await Course.find({
      teacherId: currentUser.userId
    }).distinct("_id");

    const teacherAssignmentIds = await Assignment.find({
      courseId: { $in: teacherCourseIds }
    }).distinct("_id");

    // Step 2: Fetch all submissions for those assignments
    const submissions = await Submission.find({
      assignmentId: { $in: teacherAssignmentIds }
    })
      .populate('studentId', 'firstName lastName email avatar')
      .sort({ submittedAt: -1 })
      .lean();

    // Format response
    const formatted = submissions.map(s => ({
      ...s,
      _id: s._id.toString(),
      assignmentId: s.assignmentId.toString(),
      studentId: s.studentId
        ? {
            ...(s.studentId as any),
            _id: (s.studentId as any)._id.toString(),
          }
        : null,
    }));

    return ApiResponseBuilder.success(formatted);

  } catch (error) {
    return handleApiError(error);
  }
});
