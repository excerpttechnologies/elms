'use client';

import React, { useEffect, useState } from 'react';

type Student = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
};

type Course = {
  _id: string;
  title: string;
};

type Enrollment = {
  _id: string;
  studentId: Student;
  courseId: Course;
  status: string;
  enrolledAt: string;
  progressPercentage: number;
};

type StudentEnrollmentSummary = {
  studentId: string;
  studentName: string;
  email: string;
  totalCourses: number;
  courses: Course[];
  enrollments: Enrollment[];
};

export default function AdminEnrollmentPage() {
  const [studentSummaries, setStudentSummaries] = useState<StudentEnrollmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/enrollments')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.data) {
          // Group enrollments by studentId
          const groupedByStudent = new Map<string, StudentEnrollmentSummary>();

          data.data.forEach((enrollment: Enrollment) => {
            const studentId = enrollment.studentId._id;
            if (!groupedByStudent.has(studentId)) {
              groupedByStudent.set(studentId, {
                studentId,
                studentName: `${enrollment.studentId.firstName} ${enrollment.studentId.lastName}`,
                email: enrollment.studentId.email,
                totalCourses: 0,
                courses: [],
                enrollments: [],
              });
            }

            const summary = groupedByStudent.get(studentId)!;
            summary.enrollments.push(enrollment);
            summary.totalCourses = summary.enrollments.length;

            // Add course if not already added
            const courseExists = summary.courses.some((c) => c._id === enrollment.courseId._id);
            if (!courseExists) {
              summary.courses.push(enrollment.courseId);
            }
          });

          setStudentSummaries(Array.from(groupedByStudent.values()));
        } else {
          setError(data?.message ?? 'Unable to load enrollments');
        }
      })
      .catch(() => {
        if (!mounted) return;
        setError('Network error');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse text-center">Loading enrollments…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Enrollments</h1>
        <p className="text-gray-600">
          Total students: <span className="font-semibold">{studentSummaries.length}</span>
        </p>
      </div>

      {/* Empty State */}
      {studentSummaries.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-gray-600">No enrollments found</p>
        </div>
      ) : (
        <>
          {/* Student Summary Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Total Courses Enrolled
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Courses
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentSummaries.map((summary) => (
                  <tr key={summary.studentId} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{summary.studentName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {summary.email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
                        {summary.totalCourses}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex flex-wrap gap-2">
                        {summary.courses.map((course) => (
                          <span
                            key={course._id}
                            className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                          >
                            {course.title}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}