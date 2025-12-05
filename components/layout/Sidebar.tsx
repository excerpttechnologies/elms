// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";

// type MenuItem = {
//   id: string;
//   href: string;
//   label: string;
//   icon?: string;
//   badge?: string;
// };

// type User = {
//   _id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   fullName?: string;
//   role?: "ADMIN" | "TEACHER" | "STUDENT" | string | null;
//   avatar?: string | null;
// };

// const ADMIN_MENU: MenuItem[] = [
//   { id: "Dashboard", href: "/dashboard/admin", label: "Dashboard", icon: "icon-[tabler--dashboard]", badge: "2" },
//   { id: "Course", href: "/dashboard/admin/course", label: "Course", icon: "icon-[tabler--file-invoice]" },
//   { id: "Enrollment", href: "/dashboard/admin/enrollment", label: "Enrollment", icon: "icon-[tabler--users]" },
//   { id: "Users", href: "/dashboard/admin/users", label: "Users", icon: "icon-[tabler--chart-pie-2]" },
//   { id: "Assignment", href: "/dashboard/admin/assignment", label: "Assignment", icon: "icon-[tabler--arrows-left-right]" },
//   { id: "Profile", href: "/dashboard/admin/profile", label: "Profile", icon: "icon-[tabler--clock]" },
// ];

// const TEACHER_MENU: MenuItem[] = [
//   { id: "Dashboard", href: "/dashboard/teacher", label: "Dashboard", icon: "icon-[tabler--dashboard]" },
//   { id: "CreateCourse", href: "/dashboard/teacher/coursecreation", label: "Create Course", icon: "icon-[tabler--file-plus]" },
//   { id: "Assessment", href: "/dashboard/teacher/assessment", label: "Module", icon: "icon-[tabler--arrows-left-right]" },
//   { id: "Assignments", href: "/dashboard/teacher/assignments", label: "Assignments", icon: "icon-[tabler--arrows-left-right]" },
//    { id: "StudentAssignment", href: "/dashboard/teacher/assignmentsubmission", label: "StudentAssignment", icon: "icon-[tabler--arrows-left-right]" },
//   { id: "Lesson", href: "/dashboard/teacher/lesson", label: "lesson", icon: "icon-[tabler--clock]" },
//   { id: "Profile", href: "/dashboard/admin/profile", label: "Profile", icon: "icon-[tabler--clock]" },
// ];

// const STUDENT_MENU: MenuItem[] = [
//   { id: "Dashboard", href: "/dashboard/student", label: "Dashboard", icon: "icon-[tabler--dashboard]" },
//   { id: "Enrollment", href: "/dashboard/student/enrollment", label: "Enrollment", icon: "icon-[tabler--users]" },
//   { id: "Assignmnets", href: "/dashboard/student/assignments", label: "Assignments", icon: "icon-[tabler--clock]" },
//   { id: "Profile", href: "/dashboard/admin/profile", label: "Profile", icon: "icon-[tabler--clock]" },
// ];

// export default function Sidebar(): React.ReactElement {
//   const pathname = usePathname() || "/";
//   const router = useRouter();
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isLoggingOut, setIsLoggingOut] = useState(false);
//   const [logoutError, setLogoutError] = useState<string | null>(null);

//   useEffect(() => {
//     let mounted = true;
//     fetch("/api/auth/me", { credentials: "same-origin" })
//       .then((res) => res.json())
//       .then((payload) => {
//         if (!mounted) return;
//         const data = payload?.data ?? null;
//         setUser(data);
//       })
//       .catch(() => {
//         if (!mounted) return;
//         setUser(null);
//       })
//       .finally(() => {
//         if (!mounted) return;
//         setLoading(false);
//       });
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const getMenuForRole = (): MenuItem[] => {
//     const role = user?.role ?? null;
//     if (role === "ADMIN") return ADMIN_MENU;
//     if (role === "TEACHER") return TEACHER_MENU;
//     if (role === "STUDENT") return STUDENT_MENU;
//     return [];
//   };

//   // Handle logout
// const handleLogout = async () => {
//   setIsLoggingOut(true);
//   setLogoutError(null);

//   try {
//     // read refresh token from localStorage if you stored it there
//     const refreshToken = localStorage.getItem('refreshToken') || undefined;

//     const res = await fetch('/api/auth/logout', {
//       method: 'POST',
//       credentials: 'include', // include cookie token if you have one
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ refreshToken }), // send to server to remove from DB
//     });

//     // Clear client state regardless of response
//     setUser(null);
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     sessionStorage.clear();
//     // router.push('/login');
//     window.location.replace('/login');

//     if (!res.ok) {
//       const data = await res.json().catch(() => ({}));
//       console.error('Logout API error:', data?.message || res.status);
//     }
//   } catch (err: any) {
//     console.error('Logout error:', err);
//     setUser(null);
//     localStorage.removeItem('user');
//     localStorage.removeItem('refreshToken');
//     sessionStorage.clear();
//     router.push('/login');
//   } finally {
//     setIsLoggingOut(false);
//   }
// };


//   const menu = getMenuForRole();

//   return (
//     <aside
//       id="layout-toggle"
//       className="overlay overlay-open:translate-x-0 drawer drawer-start inset-y-0 start-0 hidden h-full [--auto-close:lg] sm:w-65 lg:block lg:translate-x-0 lg:shadow-none"
//       aria-label="Sidebar"
//     >
//       <div className="drawer-body border-base-content/20 h-full border-e p-0">
//         <div className="flex h-full max-h-full flex-col">
//           {/* <button
//             type="button"
//             className="btn btn-text btn-circle btn-sm absolute end-3 top-3 lg:hidden"
//             aria-label="Close"
//             data-overlay="#layout-toggle"
//           >
//             <span className="icon-[tabler--x] size-5" aria-hidden />
//           </button> */}

//           <div className="flex items-center gap-3 py-3 px-4 border-b">
//             <div className="flex items-center gap-3">
//               <div className="text-primary" aria-hidden />
//               <div>
//                 <div className="font-bold">LMS</div>
//                 <div className="text-xs text-gray-500">Platform</div>
//               </div>
//             </div>
//           </div>

//           <div className="h-full overflow-y-auto">
//             <ul className="menu menu-sm gap-1 px-4 py-3">
//               {loading ? (
//                 <li className="px-2 py-2 text-sm text-gray-500">Loading menu…</li>
//               ) : menu.length === 0 ? (
//                 <li className="px-2 py-2 text-sm text-gray-500">No menu available</li>
//               ) : (
//                 menu.map((item) => {
//                   const active = pathname === item.href || pathname.startsWith(item.href + "/");
//                   return (
//                     <li key={item.id}>
//                       <Link
//                         href={item.href}
//                         className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
//                           active ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
//                         }`}
//                       >
//                         {item.icon && <span className={`${item.icon} size-5`} aria-hidden />}
//                         <span className="flex-1">{item.label}</span>
//                         {item.badge && (
//                           <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
//                             {item.badge}
//                           </span>
//                         )}
//                       </Link>
//                     </li>
//                   );
//                 })
//               )}
//             </ul>
//           </div>

//           {/* User Profile Section with Logout */}
//           <div className="mt-auto border-t p-4 space-y-3">
//             {/* User Info */}
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-sm text-blue-600 font-semibold flex-shrink-0">
//                 {user?.firstName ? user.firstName.charAt(0).toUpperCase() : "G"}
//               </div>
//               <div className="text-sm flex-1 min-w-0">
//                 <div className="text-xs text-gray-500">Signed in as</div>
//                 <div className="font-medium text-gray-900 truncate">{user?.fullName ?? user?.email ?? "Guest"}</div>
//                 <div className="text-xs text-gray-500">{user?.role ?? "Guest"}</div>
//               </div>
//             </div>

//             {/* Logout Error Message */}
//             {logoutError && (
//               <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
//                 {logoutError}
//               </div>
//             )}

//             {/* Logout Button */}
//             <button
//               onClick={handleLogout}
//               disabled={isLoggingOut}
//               className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
//             >
//               {isLoggingOut ? (
//                 <>
//                   <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     />
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     />
//                   </svg>
//                   Logging out...
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
//                     />
//                   </svg>
//                   Logout
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }



"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type MenuItem = {
  id: string;
  href: string;
  label: string;
  icon?: string;
  badge?: string;
};

type User = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role?: "ADMIN" | "TEACHER" | "STUDENT" | string | null;
  avatar?: string | null;
};

const ADMIN_MENU: MenuItem[] = [
  { id: "Dashboard", href: "/dashboard/admin", label: "Dashboard", icon: "icon-[tabler--dashboard]", badge: "2" },
  { id: "Course", href: "/dashboard/admin/course", label: "Courses", icon: "icon-[tabler--book]" },
  { id: "Enrollment", href: "/dashboard/admin/enrollment", label: "Enrollments", icon: "icon-[tabler--users]" },
  { id: "Users", href: "/dashboard/admin/users", label: "Users", icon: "icon-[tabler--user-circle]" },
  { id: "Assignment", href: "/dashboard/admin/assignment", label: "Assignments", icon: "icon-[tabler--clipboard-check]" },
  { id: "Analytics", href: "/dashboard/admin/analytics", label: "Analytics", icon: "icon-[tabler--chart-bar]" },
  { id: "Settings", href: "/dashboard/admin/settings", label: "Settings", icon: "icon-[tabler--settings]" },
];

const TEACHER_MENU: MenuItem[] = [
  { id: "Dashboard", href: "/dashboard/teacher", label: "Dashboard", icon: "icon-[tabler--dashboard]" },
  { id: "CreateCourse", href: "/dashboard/teacher/coursecreation", label: "Create Course", icon: "icon-[tabler--plus]" },
  { id: "Modules", href: "/dashboard/teacher/assessment", label: "Modules", icon: "icon-[tabler--folder]" },
  { id: "Assignments", href: "/dashboard/teacher/assignments", label: "Assignments", icon: "icon-[tabler--list-check]" },
  { id: "Submissions", href: "/dashboard/teacher/assignmentsubmission", label: "Submissions", icon: "icon-[tabler--upload]" },
  { id: "Lessons", href: "/dashboard/teacher/lesson", label: "Lessons", icon: "icon-[tabler--presentation]" },
  { id: "Grades", href: "/dashboard/teacher/grades", label: "Grades", icon: "icon-[tabler--stars]" },
];

const STUDENT_MENU: MenuItem[] = [
  { id: "Dashboard", href: "/dashboard/student", label: "Dashboard", icon: "icon-[tabler--dashboard]" },
  { id: "Enrollment", href: "/dashboard/student/enrollment", label: "Enrollment", icon: "icon-[tabler--users]" },
  { id: "Assignmnets", href: "/dashboard/student/assignments", label: "Assignments", icon: "icon-[tabler--clock]" },
];

export default function Sidebar(): React.ReactElement {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((payload) => {
        if (!mounted) return;
        const data = payload?.data ?? null;
        setUser(data);
      })
      .catch(() => {
        if (!mounted) return;
        setUser(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const getMenuForRole = (): MenuItem[] => {
    const role = user?.role ?? null;
    if (role === "ADMIN") return ADMIN_MENU;
    if (role === "TEACHER") return TEACHER_MENU;
    if (role === "STUDENT") return STUDENT_MENU;
    return [];
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const refreshToken = localStorage.getItem('refreshToken') || undefined;
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.clear();
      window.location.replace('/login');
    } catch (err: any) {
      console.error('Logout error:', err);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      sessionStorage.clear();
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menu = getMenuForRole();
  const userInitials = user?.firstName 
    ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : "G";

  const getRoleColor = (role: string | undefined) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'TEACHER': return 'bg-blue-100 text-blue-800';
      case 'STUDENT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <aside
      id="layout-toggle"
      className={`overlay drawer drawer-start inset-y-0 start-0 h-full 
    transition-all duration-300 ease-in-out
    ${collapsed ? 'sm:w-16' : 'sm:w-64'}
    -translate-x-full lg:translate-x-0 lg:block
    open:translate-x-0`}
      aria-label="Sidebar"
    >
      <div className="drawer-body border-r border-gray-200 h-full p-0 bg-gradient-to-b from-white to-gray-50/50">
        <div className="flex h-full max-h-full flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                {!collapsed && (
                  <div>
                    <h1 className="font-bold text-gray-900 text-lg tracking-tight">LMS Platform</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Learning Management System</p>
                  </div>
                )}
              </div>
              {!collapsed && (
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="btn btn-circle btn-text btn-sm border border-gray-300 hover:border-gray-400"
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <span className="icon-[tabler--chevron-left] size-4"></span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-1">
              {loading ? (
                <div className="space-y-2 px-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : menu.length === 0 ? (
                <div className="text-center py-8 px-2">
                  <span className="icon-[tabler--lock] size-8 text-gray-400 mx-auto mb-2"></span>
                  <p className="text-sm text-gray-500">No menu available</p>
                </div>
              ) : (
                menu.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                        ${active 
                          ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 text-indigo-700 shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                        } ${collapsed ? 'justify-center' : ''}`}
                    >
                      {item.icon && (
                        <span className={`${item.icon} size-5 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-gray-500'}`} aria-hidden />
                      )}
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                          {item.badge && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-indigo-600 text-white rounded-full min-w-6 h-6">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })
              )}
            </div>

            {/* Quick Stats (Only for Admin) */}
            {user?.role === 'ADMIN' && !collapsed && (
              <div className="mt-8 px-2">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-300">Quick Stats</span>
                    <span className="icon-[tabler--chart-bar] size-4 text-gray-400"></span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <div className="text-white font-bold text-lg">42</div>
                      <div className="text-xs text-gray-400">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold text-lg">18</div>
                      <div className="text-xs text-gray-400">Courses</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="border-t border-gray-200 p-4 space-y-3 bg-white">
            {/* User Info */}
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden flex items-center justify-center text-white font-semibold shadow-md">
                  {userInitials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500"></div>
              </div>
              
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-900 truncate">{user?.fullName || user?.email || "Guest"}</div>
                    {user?.role && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{user?.email || "No email"}</div>
                </div>
              )}
            </div>

            {/* Logout Error Message */}
            {logoutError && !collapsed && (
              <div className="p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                <div className="flex items-center gap-1">
                  <span className="icon-[tabler--alert-circle] size-4"></span>
                  {logoutError}
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 
                flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                ${collapsed ? 'px-2' : ''}
                bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                text-white shadow-sm hover:shadow-md active:scale-[0.98]`}
            >
              {isLoggingOut ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {!collapsed && "Logging out..."}
                </>
              ) : (
                <>
                  <span className="icon-[tabler--logout] size-5"></span>
                  {!collapsed && "Logout"}
                </>
              )}
            </button>

            {/* Collapse Toggle (at bottom when collapsed) */}
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="btn btn-circle btn-text btn-sm border border-gray-300 hover:border-gray-400 mx-auto mt-2"
                aria-label="Expand sidebar"
              >
                <span className="icon-[tabler--chevron-right] size-4"></span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}