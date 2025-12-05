// 'use client';

// import React, { useEffect, useState } from 'react';

// type Student = {
//   _id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
// };

// type Course = {
//   _id: string;
//   title: string;
// };

// type Enrollment = {
//   _id: string;
//   studentId: Student;
//   courseId: Course;
//   status: string;
//   enrolledAt: string;
//   progressPercentage: number;
// };

// type StudentEnrollmentSummary = {
//   studentId: string;
//   studentName: string;
//   email: string;
//   totalCourses: number;
//   courses: Course[];
//   enrollments: Enrollment[];
// };

// export default function AdminEnrollmentPage() {
//   const [studentSummaries, setStudentSummaries] = useState<StudentEnrollmentSummary[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let mounted = true;
//     setLoading(true);
//     fetch('/api/enrollments')
//       .then((res) => res.json())
//       .then((data) => {
//         if (!mounted) return;
//         if (data?.data) {
//           // Group enrollments by studentId
//           const groupedByStudent = new Map<string, StudentEnrollmentSummary>();

//           data.data.forEach((enrollment: Enrollment) => {
//             const studentId = enrollment.studentId._id;
//             if (!groupedByStudent.has(studentId)) {
//               groupedByStudent.set(studentId, {
//                 studentId,
//                 studentName: `${enrollment.studentId.firstName} ${enrollment.studentId.lastName}`,
//                 email: enrollment.studentId.email,
//                 totalCourses: 0,
//                 courses: [],
//                 enrollments: [],
//               });
//             }

//             const summary = groupedByStudent.get(studentId)!;
//             summary.enrollments.push(enrollment);
//             summary.totalCourses = summary.enrollments.length;

//             // Add course if not already added
//             const courseExists = summary.courses.some((c) => c._id === enrollment.courseId._id);
//             if (!courseExists) {
//               summary.courses.push(enrollment.courseId);
//             }
//           });

//           setStudentSummaries(Array.from(groupedByStudent.values()));
//         } else {
//           setError(data?.message ?? 'Unable to load enrollments');
//         }
//       })
//       .catch(() => {
//         if (!mounted) return;
//         setError('Network error');
//       })
//       .finally(() => {
//         if (!mounted) return;
//         setLoading(false);
//       });
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="animate-pulse text-center">Loading enrollments…</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="alert alert-error">
//           <span>{error}</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Enrollments</h1>
//         <p className="text-gray-600">
//           Total students: <span className="font-semibold">{studentSummaries.length}</span>
//         </p>
//       </div>

//       {/* Empty State */}
//       {studentSummaries.length === 0 ? (
//         <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
//           <p className="text-gray-600">No enrollments found</p>
//         </div>
//       ) : (
//         <>
//           {/* Student Summary Table */}
//           <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-gray-100 border-b border-gray-200">
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                     Student Name
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                     Email
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                     Total Courses Enrolled
//                   </th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
//                     Courses
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {studentSummaries.map((summary) => (
//                   <tr key={summary.studentId} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 text-sm text-gray-900">
//                       <div className="font-medium">{summary.studentName}</div>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-600">
//                       {summary.email}
//                     </td>
//                     <td className="px-6 py-4 text-sm">
//                       <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
//                         {summary.totalCourses}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-900">
//                       <div className="flex flex-wrap gap-2">
//                         {summary.courses.map((course) => (
//                           <span
//                             key={course._id}
//                             className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
//                           >
//                             {course.title}
//                           </span>
//                         ))}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }


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
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  enrolledAt: string;
  progressPercentage: number;
};

export default function AdminEnrollmentPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({key: 'enrolledAt', direction: 'desc'});
  const [bulkAction, setBulkAction] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/enrollments')
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

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = searchTerm === '' || 
      enrollment.studentId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.studentId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.studentId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.courseId.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort enrollments
  const sortedEnrollments = [...filteredEnrollments].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortConfig.key) {
      case 'student':
        aValue = `${a.studentId.firstName} ${a.studentId.lastName}`;
        bValue = `${b.studentId.firstName} ${b.studentId.lastName}`;
        break;
      case 'course':
        aValue = a.courseId.title;
        bValue = b.courseId.title;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'progress':
        aValue = a.progressPercentage;
        bValue = b.progressPercentage;
        break;
      case 'enrolledAt':
        aValue = new Date(a.enrolledAt).getTime();
        bValue = new Date(b.enrolledAt).getTime();
        break;
      default:
        return 0;
    }
    
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'DROPPED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === sortedEnrollments.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sortedEnrollments.map(e => e._id));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedRows.length === 0) return;
    
    // Implement bulk action logic
    console.log(`Performing ${bulkAction} on:`, selectedRows);
    
    // Reset after action
    setSelectedRows([]);
    setBulkAction('');
  };

  const updateEnrollmentStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/enrollments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setEnrollments(prev =>
          prev.map(enrollment =>
            enrollment._id === id
              ? { ...enrollment, status: newStatus as any }
              : enrollment
          )
        );
      }
    } catch (error) {
      console.error('Failed to update enrollment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enrollment Management</h1>
          <p className="text-gray-600">Manage and track student enrollments across courses</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 1.438l1.5-1.5 1.5 1.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-semibold text-gray-900">{enrollments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {enrollments.filter(e => e.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {enrollments.filter(e => e.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-50 rounded-lg mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dropped</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {enrollments.filter(e => e.status === 'DROPPED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by student name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="DROPPED">Dropped</option>
              </select>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Export
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedRows.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-blue-700 font-medium">
                  {selectedRows.length} enrollment{selectedRows.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Bulk Actions</option>
                  <option value="activate">Mark as Active</option>
                  <option value="complete">Mark as Completed</option>
                  <option value="drop">Mark as Dropped</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
                <button
                  onClick={() => setSelectedRows([])}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-12 px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === sortedEnrollments.length && sortedEnrollments.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('student')}
                  >
                    <div className="flex items-center">
                      Student
                      {sortConfig.key === 'student' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('course')}
                  >
                    <div className="flex items-center">
                      Course
                      {sortConfig.key === 'course' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortConfig.key === 'status' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('progress')}
                  >
                    <div className="flex items-center">
                      Progress
                      {sortConfig.key === 'progress' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('enrolledAt')}
                  >
                    <div className="flex items-center">
                      Enrolled Date
                      {sortConfig.key === 'enrolledAt' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                 
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        No enrollments found
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedEnrollments.map((enrollment) => (
                    <tr 
                      key={enrollment._id} 
                      className={`hover:bg-gray-50 ${selectedRows.includes(enrollment._id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(enrollment._id)}
                          onChange={() => handleRowSelect(enrollment._id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-medium mr-3">
                            {enrollment.studentId.firstName[0]}{enrollment.studentId.lastName[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.studentId.firstName} {enrollment.studentId.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enrollment.studentId.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {enrollment.courseId.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                            {enrollment.status}
                          </span>
                          <select
                            value={enrollment.status}
                            onChange={(e) => updateEnrollmentStatus(enrollment._id, e.target.value)}
                            className="ml-2 text-sm border-none bg-transparent focus:outline-none focus:ring-0"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="DROPPED">Dropped</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${enrollment.progressPercentage < 30 ? 'bg-red-500' : enrollment.progressPercentage < 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${enrollment.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900 font-medium">
                            {enrollment.progressPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(enrollment.enrolledAt)}
                      </td>
                     
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{sortedEnrollments.length}</span> of{' '}
                <span className="font-medium">{enrollments.length}</span> enrollments
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">
                  Previous
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-end space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Low Progress (&lt;30%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span>Medium Progress (30-70%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>High Progress (&gt;70%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}