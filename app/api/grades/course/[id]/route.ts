// ============================================
// src/app/api/grades/course/[id]/route.ts
// GET /api/grades/course/:id - Get all grades for a course
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import User from '@/models/User';
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

    const courseId = params.id;

    if (!Types.ObjectId.isValid(courseId)) {
      return ApiResponseBuilder.badRequest('Invalid course ID');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponseBuilder.notFound('Course not found');
    }

    // Check ownership
    if (
      currentUser.role !== 'ADMIN' &&
      course.teacherId.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('Access denied');
    }

    // Get all assignments for this course
    const assignments = await Assignment.find({ courseId });
    const assignmentIds = assignments.map(a => a._id);

    // Get all graded submissions
    const submissions = await Submission.find({
      assignmentId: { $in: assignmentIds },
      status: 'GRADED',
    })
      .populate('studentId', 'firstName lastName email')
      .populate('assignmentId', 'title totalPoints')
      .lean();

    // Group by student
    const studentGrades: Record<string, any> = {};

    submissions.forEach(submission => {
      const studentId = (submission.studentId as any)._id.toString();

      if (!studentGrades[studentId]) {
        studentGrades[studentId] = {
          student: {
            _id: studentId,
            firstName: (submission.studentId as any).firstName,
            lastName: (submission.studentId as any).lastName,
            email: (submission.studentId as any).email,
          },
          grades: [],
          totalScore: 0,
          totalPossible: 0,
        };
      }

      studentGrades[studentId].grades.push({
        assignment: {
          _id: (submission.assignmentId as any)._id.toString(),
          title: (submission.assignmentId as any).title,
          totalPoints: (submission.assignmentId as any).totalPoints,
        },
        score: submission.score,
        submittedAt: submission.submittedAt,
        gradedAt: submission.gradedAt,
      });

      studentGrades[studentId].totalScore += submission.score || 0;
      studentGrades[studentId].totalPossible +=
        (submission.assignmentId as any).totalPoints || 0;
    });

    // Calculate averages
    const gradesArray = Object.values(studentGrades).map(sg => ({
      ...sg,
      averagePercentage:
        sg.totalPossible > 0
          ? Math.round((sg.totalScore / sg.totalPossible) * 100 * 10) / 10
          : 0,
    }));

    return ApiResponseBuilder.success(gradesArray);
  } catch (error) {
    return handleApiError(error);
  }
});
