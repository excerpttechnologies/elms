'use client';

import React, { useEffect, useState } from 'react';

type Teacher = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
};

type Course = {
  _id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  level?: string;
  status?: string;
  price?: number;
  tags?: string[];
  teacherId?: Teacher;
};

type StudentEnrollment = {
  _id: string;
  studentId: string;
  courseId: Course;
  status: string;
  enrolledAt: string;
  progressPercentage: number;
};

export default function EnrollmentStudentPage() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/enrollments/my', { credentials: 'same-origin' })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.data) {
          setEnrollments(data.data);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse text-center text-gray-600">Loading your enrollments…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Enrollments</h1>
        <p className="text-gray-600">
          You are enrolled in <span className="font-semibold">{enrollments.length}</span> course{enrollments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Empty State */}
      {enrollments.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <div className="text-gray-500 mb-2">
            <span className="icon-[tabler--inbox] size-12 mx-auto mb-4" />
          </div>
          <p className="text-gray-600 font-medium">No enrollments yet</p>
          <p className="text-gray-500 text-sm">Browse available courses to get started</p>
        </div>
      ) : (
        <>
         {/* Summary Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Total Courses</div>
              <div className="text-3xl font-bold text-gray-900">{enrollments.length}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Active Courses</div>
              <div className="text-3xl font-bold text-gray-900">
                {enrollments.filter((e) => e.status === 'ACTIVE').length}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="text-sm font-medium text-gray-500 mb-2">Completed Courses</div>
              <div className="text-3xl font-bold text-gray-900">
                {enrollments.filter((e) => e.status === 'COMPLETED').length}
              </div>
            </div>
          </div>
          
          {/* Enrollments Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Course Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Teacher
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Enrolled Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => {
                  const course = enrollment.courseId;
                  const teacher = course.teacherId;
                  return (
                    <tr key={enrollment._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm">
                        <div className="font-semibold text-gray-900">{course.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{course.shortDescription}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {course.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="text-gray-900 font-medium">
                          {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">{teacher?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            course.level === 'BEGINNER'
                              ? 'bg-green-100 text-green-800'
                              : course.level === 'INTERMEDIATE'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {course.level || 'All Levels'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            enrollment.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : enrollment.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${enrollment.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 min-w-10">
                            {enrollment.progressPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(enrollment.enrolledAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

         
        </>
      )}
    </div>
  );
}