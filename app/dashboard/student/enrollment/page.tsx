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
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'progress' | 'title'>('recent');

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

  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return enrollment.status === 'ACTIVE';
    if (activeTab === 'completed') return enrollment.status === 'COMPLETED';
    return true;
  });

  const sortedEnrollments = [...filteredEnrollments].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
    }
    if (sortBy === 'progress') {
      return b.progressPercentage - a.progressPercentage;
    }
    if (sortBy === 'title') {
      return a.courseId.title.localeCompare(b.courseId.title);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-6 rounded-r-lg shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <span className="icon-[tabler--alert-circle] size-6 text-red-600"></span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Enrollments</h3>
                <p className="text-gray-600">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                >
                  <span className="icon-[tabler--refresh] size-4"></span>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Learning Journey</h1>
              <p className="text-gray-600">Track your progress across all enrolled courses</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
                <span className="icon-[tabler--download] size-4"></span>
                Export
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                <span className="icon-[tabler--plus] size-4"></span>
                Browse Courses
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Courses</p>
                  <h3 className="text-3xl font-bold mt-2">{enrollments.length}</h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <span className="icon-[tabler--books] size-8"></span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {enrollments.filter((e) => e.status === 'ACTIVE').length}
                  </h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <span className="icon-[tabler--trending-up] size-8"></span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Completed</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {enrollments.filter((e) => e.status === 'COMPLETED').length}
                  </h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <span className="icon-[tabler--check] size-8"></span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Avg Progress</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {Math.round(
                      enrollments.reduce((acc, curr) => acc + curr.progressPercentage, 0) / 
                      Math.max(enrollments.length, 1)
                    )}%
                  </h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <span className="icon-[tabler--chart-bar] size-8"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
              {(['all', 'active', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                    {tab === 'all'
                      ? enrollments.length
                      : enrollments.filter((e) => e.status === tab.toUpperCase()).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="icon-[tabler--sort-ascending] size-5 text-gray-400"></span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border-none bg-transparent text-sm font-medium focus:outline-none focus:ring-0"
                >
                  <option value="recent">Recently Enrolled</option>
                  <option value="progress">Progress High to Low</option>
                  <option value="title">Course Title A-Z</option>
                </select>
              </div>
              <div className="relative">
                <span className="icon-[tabler--search] size-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"></span>
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enrollments Grid */}
        {sortedEnrollments.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <span className="icon-[tabler--inbox] size-12 text-gray-400"></span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">You don't have any {activeTab !== 'all' ? activeTab : ''} courses yet.</p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
              <span className="icon-[tabler--book] size-5"></span>
              Browse Available Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedEnrollments.map((enrollment) => {
              const course = enrollment.courseId;
              const teacher = course.teacherId;
              
              return (
                <div
                  key={enrollment._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {course.category || 'General'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            course.level === 'BEGINNER'
                              ? 'bg-green-100 text-green-800'
                              : course.level === 'INTERMEDIATE'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {course.level || 'All Levels'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {course.shortDescription || course.description || 'No description available'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        enrollment.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : enrollment.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {enrollment.status}
                      </span>
                    </div>

                    {/* Teacher Info */}
                    <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {teacher?.firstName?.[0]}{teacher?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher'}
                        </p>
                        <p className="text-xs text-gray-500">Instructor</p>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Course Progress</span>
                        <span className="text-sm font-bold text-gray-900">
                          {enrollment.progressPercentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                          style={{ width: `${enrollment.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        Enrolled on {formatDate(enrollment.enrolledAt)}
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                          View Course
                        </button>
                        <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Toggle */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
            <button className="p-2 rounded hover:bg-white">
              <span className="icon-[tabler--layout-grid] size-5 text-gray-600"></span>
            </button>
            <button className="p-2 rounded hover:bg-white">
              <span className="icon-[tabler--list] size-5 text-gray-600"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}