// ============================================
// src/app/api/attendance/report/route.ts
// GET /api/attendance/report - Generate attendance report
// ============================================
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Attendance from '@/models/Attendance';
import Course from '@/models/Course';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { requireTeacher } from '@/middleware/auth';

export const GET = requireTeacher(async (request: NextRequest, currentUser: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const studentId = searchParams.get('studentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!courseId) {
      return ApiResponseBuilder.badRequest('Course ID is required');
    }

    // Check course access
    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponseBuilder.notFound('Course not found');
    }

    if (
      currentUser.role !== 'ADMIN' &&
      course.teacherId.toString() !== currentUser.userId
    ) {
      return ApiResponseBuilder.forbidden('Access denied');
    }

    // Build query
    const query: any = { courseId };

    if (studentId) {
      query.studentId = studentId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get attendance records
    const records = await Attendance.find(query)
      .populate('studentId', 'firstName lastName email')
      .lean();

    // Get all enrolled students
    const enrollments = await Enrollment.find({
      courseId,
      status: 'ACTIVE',
    }).populate('studentId', 'firstName lastName email');

    // Calculate statistics per student
    const studentStats = enrollments.map(enrollment => {
      const student = enrollment.studentId as any;
      const studentRecords = records.filter(
        r => (r.studentId as any)._id.toString() === student._id.toString()
      );

      const totalClasses = studentRecords.length;
      const present = studentRecords.filter(r => r.status === 'PRESENT').length;
      const absent = studentRecords.filter(r => r.status === 'ABSENT').length;
      const late = studentRecords.filter(r => r.status === 'LATE').length;
      const excused = studentRecords.filter(r => r.status === 'EXCUSED').length;

      const attendancePercentage =
        totalClasses > 0 ? Math.round((present / totalClasses) * 100 * 10) / 10 : 0;

      return {
        student: {
          _id: student._id.toString(),
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
        },
        statistics: {
          totalClasses,
          present,
          absent,
          late,
          excused,
          attendancePercentage,
        },
      };
    });

    // Overall statistics
    const overallStats = {
      totalStudents: enrollments.length,
      totalRecords: records.length,
      averageAttendance:
        studentStats.length > 0
          ? Math.round(
              (studentStats.reduce((sum, s) => sum + s.statistics.attendancePercentage, 0) /
                studentStats.length) *
                10
            ) / 10
          : 0,
    };

    return ApiResponseBuilder.success({
      course: {
        _id: (course._id as any).toString(),
        title: course.title,
      },
      period: {
        startDate: startDate || 'N/A',
        endDate: endDate || 'N/A',
      },
      overallStats,
      studentReports: studentStats,
    });
  } catch (error) {
    return handleApiError(error);
  }
});