// "use client";

// import React, { useEffect, useState } from "react";

// type User = {
//   id?: string | number;
//   _id?: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   role: string;
//   status: "ACTIVE" | "INACTIVE" | "PENDING" | string;
//   createdAt?: string;
//   [key: string]: any;
// };

// type CreateUserFormData = {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   role: "ADMIN" | "TEACHER" | "STUDENT";
// };

// export default function UsersTable() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [isSearching, setIsSearching] = useState<boolean>(false);
//   const [selectedRole, setSelectedRole] = useState<string>("ALL");
//   const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

//   const [formData, setFormData] = useState<CreateUserFormData>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     role: "STUDENT",
//   });

//   // role-change UI state
//   const [roleLoading, setRoleLoading] = useState<Record<string, boolean>>({});
//   const [roleError, setRoleError] = useState<Record<string, string | null>>({});
//   const [roleSuccess, setRoleSuccess] = useState<Record<string, string | null>>({});

//   // current user (for UI permission checks) - pulled from localStorage.user if present
//   const [currentUser, setCurrentUser] = useState<any>(null);

//   // Edit user modal state
//   const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
//   const [editingUserId, setEditingUserId] = useState<string | null>(null);
//   const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
//   const [editLoading, setEditLoading] = useState<boolean>(false);
//   const [editSaving, setEditSaving] = useState<boolean>(false);
//   const [editError, setEditError] = useState<string | null>(null);
//   const [editSuccess, setEditSuccess] = useState<string | null>(null);

//   // delete state
//   const [deleting, setDeleting] = useState<Record<string, boolean>>({});

//   useEffect(() => {
//     const sss = localStorage.getItem("user");
//     setCurrentUser(sss ? JSON.parse(sss) : null);
//   }, []);

//   // Fetch all users on mount
//   useEffect(() => {
//     const controller = new AbortController();
//     const signal = controller.signal;

//     async function load() {
//       setLoading(true);
//       setError(null);

//       try {
//         const res = await fetch("/api/users", { signal });
//         if (!res.ok) {
//           const text = await res.text().catch(() => res.statusText);
//           throw new Error(text || `HTTP ${res.status}`);
//         }

//         const text = await res.text();
//         let data: any = null;
//         if (text) {
//           try {
//             data = JSON.parse(text);
//           } catch {
//             data = text;
//           }
//         }
//         const list: User[] = Array.isArray(data) ? data : (data?.data ?? []);
//         setUsers(list);
//       } catch (err: any) {
//         if (err.name === "AbortError") return;
//         console.error("Fetch /api/users error:", err);
//         setError(err?.message ?? String(err));
//       } finally {
//         setLoading(false);
//       }
//     }

//     load();
//     return () => controller.abort();
//   }, []);

//   // Search handler
//   const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const query = e.target.value;
//     setSearchQuery(query);

//     if (query.length < 2) {
//       // reset to all users
//       try {
//         const res = await fetch("/api/users");
//         const data = await res.json().catch(() => null);
//         const list: User[] = Array.isArray(data) ? data : (data?.data ?? []);
//         setUsers(list);
//       } catch (err) {
//         console.error("Error resetting users:", err);
//       }
//       return;
//     }

//     setIsSearching(true);
//     try {
//       const roleParam = selectedRole !== "ALL" ? `&role=${selectedRole}` : "";
//       const res = await fetch(
//         `/api/users/search?q=${encodeURIComponent(query)}${roleParam}&limit=50`,
//         { credentials: "same-origin" }
//       );

//       if (!res.ok) {
//         throw new Error(`Search failed: ${res.statusText}`);
//       }

//       const data = await res.json();
//       const searchResults: User[] = Array.isArray(data?.data) ? data.data : [];
//       setUsers(searchResults);
//     } catch (err: any) {
//       console.error("Search error:", err);
//       setError(err?.message ?? "Search failed");
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   // Handle form input change (create)
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Create user
//   const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setSubmitError(null);
//     setSubmitSuccess(null);
//     setIsSubmitting(true);

//     // Validation
//     if (!formData.firstName.trim()) {
//       setSubmitError("First name is required");
//       setIsSubmitting(false);
//       return;
//     }
//     if (!formData.lastName.trim()) {
//       setSubmitError("Last name is required");
//       setIsSubmitting(false);
//       return;
//     }
//     if (!formData.email.trim()) {
//       setSubmitError("Email is required");
//       setIsSubmitting(false);
//       return;
//     }
//     if (!formData.password.trim()) {
//       setSubmitError("Password is required");
//       setIsSubmitting(false);
//       return;
//     }
//     if (formData.password.length < 6) {
//       setSubmitError("Password must be at least 6 characters");
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const res = await fetch("/api/users", {
//         method: "POST",
//         credentials: "same-origin",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json().catch(() => null);

//       if (!res.ok) throw new Error(data?.message || `Error: ${res.status}`);

//       setSubmitSuccess("User created successfully!");
//       setFormData({ firstName: "", lastName: "", email: "", password: "", role: "STUDENT" });

//       // Refresh users after a short delay so UX shows success
//       setTimeout(() => {
//         setShowCreateModal(false);
//         fetchUsers();
//       }, 500);
//     } catch (err: any) {
//       console.error("Create user error:", err);
//       setSubmitError(err?.message ?? "Failed to create user");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       const res = await fetch("/api/users");
//       const data = await res.json().catch(() => null);
//       const list: User[] = Array.isArray(data) ? data : (data?.data ?? []);
//       setUsers(list);
//     } catch (err) {
//       console.error("Error refreshing users:", err);
//     }
//   };

//   // Role change (existing)
//   async function changeUserRole(userId: string, newRole: "ADMIN" | "TEACHER" | "STUDENT") {
//     const meId = currentUser?._id ?? currentUser?.id ?? currentUser?.userId;
//     if (String(meId) === String(userId)) {
//       setRoleError((s) => ({ ...s, [userId]: "You cannot change your own role" }));
//       setTimeout(() => setRoleError((s) => ({ ...s, [userId]: null })), 3000);
//       return;
//     }

//     setRoleLoading((s) => ({ ...s, [userId]: true }));
//     setRoleError((s) => ({ ...s, [userId]: null }));
//     setRoleSuccess((s) => ({ ...s, [userId]: null }));

//     try {
//       const res = await fetch(`/api/users/${userId}/role`, {
//         method: "PUT",
//         credentials: "same-origin",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ role: newRole }),
//       });

//       const json = await res.json().catch(() => null);
//       console.log("changeUserRole response:", json.data || json);
//       if (!res.ok) {
//         const msg = json?.message || `Failed to update role (${res.status})`;
//         throw new Error(msg);
//       }

//       const updatedUser = json?.data || json || null;
//       if (updatedUser) {
//         setUsers((prev) => prev.map((u) => {
//           const id = u._id ?? u.id;
//           if (String(id) === String(userId)) return { ...u, ...updatedUser };
//           return u;
//         }));
//       } else {
//         await fetchUsers();
//       }

//       setRoleSuccess((s) => ({ ...s, [userId]: "Role updated" }));
//       setTimeout(() => setRoleSuccess((s) => ({ ...s, [userId]: null })), 2500);
//     } catch (err: any) {
//       console.error("changeUserRole error", err);
//       setRoleError((s) => ({ ...s, [userId]: err?.message ?? "Failed to update role" }));
//     } finally {
//       setRoleLoading((s) => ({ ...s, [userId]: false }));
//     }
//   }

//   // --- NEW: Edit flow using GET /api/users/:id and PUT /api/users/:id
//   async function openEditModal(userId: string) {
//     setEditError(null);
//     setEditSuccess(null);
//     setEditLoading(true);
//     setEditingUserId(userId);
//     setEditModalOpen(true);
//     setEditingUser(null);

//     try {
//       const res = await fetch(`/api/users/${userId}`, {
//         method: "GET",
//         credentials: "same-origin",
//         headers: { "Content-Type": "application/json" },
//       });
//       const json = await res.json().catch(() => null);
//       if (!res.ok) {
//         throw new Error(json?.message || `Failed to fetch user (${res.status})`);
//       }

//       const user = json?.data || json || null;
//       if (!user) throw new Error("User response malformed");

//       // Only allow editing if admin or self (backend enforces this too)
//       const meId = currentUser?._id ?? currentUser?.id ?? currentUser?.userId;
//       if (currentUser?.role !== "ADMIN" && String(meId) !== String(user._id || user.id)) {
//         throw new Error("Access denied to edit user");
//       }

//       setEditingUser({
//         _id: user._id || user.id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         role: user.role,
//         status: user.status,
//       });
//     } catch (err: any) {
//       console.error("openEditModal error", err);
//       setEditError(err?.message ?? "Failed to load user");
//       // keep modal open so admin sees the error or close automatically:
//       // setEditModalOpen(false);
//     } finally {
//       setEditLoading(false);
//     }
//   }

//   function closeEditModal() {
//     setEditModalOpen(false);
//     setEditingUserId(null);
//     setEditingUser(null);
//     setEditError(null);
//     setEditSuccess(null);
//   }

//   function updateEditingUserField<K extends keyof User>(key: K, value: any) {
//     setEditingUser((prev) => (prev ? { ...prev, [key]: value } : { [key]: value } as any));
//   }

//   async function saveEditingUser() {
//     if (!editingUserId || !editingUser) return;
//     setEditSaving(true);
//     setEditError(null);
//     setEditSuccess(null);

//     try {
//       // Build payload allowed by updateUserSchema (don't send password here)
//       const payload: any = {
//         firstName: editingUser.firstName,
//         lastName: editingUser.lastName,
//         email: editingUser.email,
//         role: editingUser.role,
//         status: editingUser.status,
//       };
      
//       Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

//       const res = await fetch(`/api/users/${editingUserId}`, {
//         method: "PUT",
//         credentials: "same-origin",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const json = await res.json().catch(() => null);
//       if (!res.ok) {
//         throw new Error(json?.message || `Failed to update user (${res.status})`);
//       }

//       const updatedUser = json?.data || json || null;
//       console.log("saveEditingUser response:", updatedUser);
//       if (updatedUser) {
//         setUsers((prev) => prev.map((u) => {
//           const id = u._id ?? u.id;
//           if (String(id) === String(editingUserId)) return { ...u, ...updatedUser };
//           return u;
//         }));
//       } else {
//         await fetchUsers();
//       }

//       setEditSuccess("User updated successfully");
//       setTimeout(() => setEditSuccess(null), 2500);
//       // keep modal open so user can see success, or close automatically:
//       // closeEditModal();
//     } catch (err: any) {
//       console.error("saveEditingUser error", err);
//       setEditError(err?.message ?? "Failed to save user");
//     } finally {
//       setEditSaving(false);
//     }
//   }

//   // --- NEW: Delete user using DELETE /api/users/:id (Admin only)
//   async function handleDeleteUser(userId: string) {
//     // guard: admin only (UI)
//     if (currentUser?.role !== "ADMIN") {
//       alert("Only admins can delete users");
//       return;
//     }
//     if (!confirm("Delete this user? This action cannot be undone.")) return;
//     if (String(currentUser?._id ?? currentUser?.id ?? currentUser?.userId) === String(userId)) {
//       alert("You cannot delete your own account");
//       return;
//     }

//     setDeleting((s) => ({ ...s, [userId]: true }));
//     try {
//       const res = await fetch(`/api/users/${userId}`, {
//         method: "DELETE",
//         credentials: "same-origin",
//         headers: { "Content-Type": "application/json" },
//       });
//       const json = await res.json().catch(() => null);
//       if (!res.ok) {
//         throw new Error(json?.message || `Failed to delete user (${res.status})`);
//       }

//       // remove from local list
//       setUsers((prev) => prev.filter((u) => String(u._id ?? u.id) !== String(userId)));
//       // if we were editing the deleted user, close modal
//       if (editingUserId === userId) closeEditModal();
//     } catch (err: any) {
//       console.error("handleDeleteUser error", err);
//       alert(err?.message ?? "Failed to delete user");
//     } finally {
//       setDeleting((s) => ({ ...s, [userId]: false }));
//     }
//   }

//   // UI helpers
//   const filteredUsers = users.filter((user) => {
//     if (selectedRole !== "ALL" && user.role?.toUpperCase() !== selectedRole) return false;
//     return true;
//   });

//   const getRoleColor = (role: string) => {
//     switch (role?.toUpperCase()) {
//       case "ADMIN":
//         return "bg-red-50 text-red-700";
//       case "TEACHER":
//         return "bg-purple-50 text-purple-700";
//       case "STUDENT":
//         return "bg-blue-50 text-blue-700";
//       default:
//         return "bg-gray-50 text-gray-700";
//     }
//   };

//   const userCount = filteredUsers.length;

//   return (
//     <div className="w-full max-w-7xl mx-auto p-4">
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
//           <p className="text-sm text-gray-600 mt-1">
//             Showing {userCount} user{userCount !== 1 ? "s" : ""}
//           </p>
//         </div>
//         <button
//           onClick={() => setShowCreateModal(true)}
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
//         >
//           + Add New User
//         </button>
//       </div>

//       {/* Search & Filters */}
//       <div className="mb-6 space-y-4">
//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Search by first name, last name or email..."
//             value={searchQuery}
//             onChange={handleSearch}
//             className="w-full px-4 py-3 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//           />
//           <span className="absolute left-3 top-3 text-gray-400">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </span>
//           {isSearching && (
//             <span className="absolute right-3 top-3 text-gray-400">
//               <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//               </svg>
//             </span>
//           )}
//         </div>

//         <div className="flex flex-wrap gap-2">
//           <button onClick={() => setSelectedRole("ALL")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedRole === "ALL" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>All Roles</button>
//           <button onClick={() => setSelectedRole("ADMIN")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedRole === "ADMIN" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>Admin</button>
//           <button onClick={() => setSelectedRole("TEACHER")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedRole === "TEACHER" ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-700 hover:bg-purple-100"}`}>Teacher</button>
//           <button onClick={() => setSelectedRole("STUDENT")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedRole === "STUDENT" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}>Student</button>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto bg-white rounded-lg shadow">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//               {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
//               <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>

//           <tbody className="bg-white divide-y divide-gray-100">
//             {loading ? (
//               <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Loading users...</td></tr>
//             ) : error ? (
//               <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-red-500">Error: {error}</td></tr>
//             ) : filteredUsers.length === 0 ? (
//               <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">{searchQuery ? "No users match your search." : "No users found."}</td></tr>
//             ) : (
//               filteredUsers.map((user) => {
//                 const identifier = String(user._id ?? user.id ?? "");
//                 const isMe = currentUser && (String(currentUser._id || currentUser.id || currentUser.userId) === identifier);
//                 return (
//                   <tr key={identifier} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">{user.firstName?.charAt(0)?.toUpperCase() ?? "U"}</div>
//                         <div className="ml-3">
//                           <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
//                           <div className="text-xs text-gray-500">ID: {user.id ?? user._id}</div>
//                         </div>
//                       </div>
//                     </td>

//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>

//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {currentUser?.role === "ADMIN" ? (
//                         <div className="flex items-center gap-2">
//                           <select
//                             value={user.role || "STUDENT"}
//                             onChange={(e) => changeUserRole(String(user._id ?? user.id), e.target.value as any)}
//                             disabled={roleLoading[identifier] || isMe}
//                             className="px-2 py-1 border rounded text-sm"
//                           >
//                             <option value="STUDENT">Student</option>
//                             <option value="TEACHER">Teacher</option>
//                             <option value="ADMIN">Admin</option>
//                           </select>

//                           {roleLoading[identifier] && <span className="text-xs text-gray-400">Updating...</span>}
//                           {roleError[identifier] && <span className="text-xs text-red-600">{roleError[identifier]}</span>}
//                           {roleSuccess[identifier] && <span className="text-xs text-green-600">{roleSuccess[identifier]}</span>}

//                           {isMe && <span className="text-xs text-gray-500 ml-2">(you)</span>}
//                         </div>
//                       ) : (
//                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>{user.role || "Unknown"}</span>
//                       )}
//                     </td>

//                     {/* <td className="px-6 py-4 whitespace-nowrap">
//                       {user.status === "active" || user.status === "ACTIVE" ? (
//                         <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-800">Active</span>
//                       ) : user.status === "inactive" || user.status === "INACTIVE" ? (
//                         <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Inactive</span>
//                       ) : (
//                         <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800">{String(user.status).charAt(0).toUpperCase() + String(user.status).slice(1)}</span>
//                       )}
//                     </td> */}

//                     <td className="px-6 py-4 whitespace-nowrap text-center">
//                       <div className="flex items-center justify-center gap-2">
//                         {/* Edit: admins or the user themself */}
//                         <button
//                           onClick={() => openEditModal(String(user._id ?? user.id))}
//                           className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
//                           disabled={editLoading}
//                         >
//                           Edit
//                         </button>

//                         {/* Delete: only admins, not allowed to delete self */}
//                         {currentUser?.role === "ADMIN" && (
//                           <button
//                             onClick={() => handleDeleteUser(String(user._id ?? user.id))}
//                             className="px-3 py-1 text-sm border rounded text-red-600 hover:bg-red-50"
//                             disabled={deleting[String(user._id ?? user.id)]}
//                           >
//                             {deleting[String(user._id ?? user.id)] ? "Deleting..." : "Delete"}
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="mt-4 flex justify-between text-xs text-gray-400">
//         <div>All roles included: Admin, Teacher, Student</div>
//       </div>

//       {/* Create User Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-bold text-gray-900">Create New User</h3>
//               <button onClick={() => { setShowCreateModal(false); setSubmitError(null); setSubmitSuccess(null); }} className="text-gray-400 hover:text-gray-600">
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
//               </button>
//             </div>

//             {submitSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{submitSuccess}</div>}
//             {submitError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{submitError}</div>}

//             <form onSubmit={handleCreateUser} className="space-y-4">
//               <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name</label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="John" /></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Doe" /></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="john@example.com" /></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="••••••" /></div>
//               <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="STUDENT">Student</option><option value="TEACHER">Teacher</option><option value="ADMIN">Admin</option></select></div>

//               <div className="flex gap-3 pt-4">
//                 <button type="button" onClick={() => { setShowCreateModal(false); setSubmitError(null); setSubmitSuccess(null); }} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
//                 <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? "Creating..." : "Create User"}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit User Modal */}
//       {editModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
//               <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
//               </button>
//             </div>

//             {editLoading ? (
//               <div>Loading user...</div>
//             ) : editError ? (
//               <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{editError}</div>
//             ) : editingUser ? (
//               <>
//                 {editSuccess && <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 rounded">{editSuccess}</div>}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium">First name</label>
//                     <input value={editingUser.firstName || ""} onChange={(e) => updateEditingUserField("firstName", e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium">Last name</label>
//                     <input value={editingUser.lastName || ""} onChange={(e) => updateEditingUserField("lastName", e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
//                   </div>
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium">Email</label>
//                     <input value={editingUser.email || ""} onChange={(e) => updateEditingUserField("email", e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
//                   </div>

//                   {/* Admins may change role/status here (backend enforces) */}
//                   <div>
//                     <label className="block text-sm font-medium">Role</label>
//                     <select value={editingUser.role || "STUDENT"} onChange={(e) => updateEditingUserField("role", e.target.value)} className="w-full px-3 py-2 border rounded text-sm">
//                       <option value="STUDENT">Student</option>
//                       <option value="TEACHER">Teacher</option>
//                       <option value="ADMIN">Admin</option>
//                     </select>
//                   </div>

                  
//                 </div>

//                 {editError && <div className="mt-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded">{editError}</div>}

//                 <div className="mt-4 flex items-center gap-3">
//                   <button onClick={saveEditingUser} disabled={editSaving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{editSaving ? "Saving..." : "Save changes"}</button>
//                   <button onClick={closeEditModal} className="px-4 py-2 border rounded">Cancel</button>
//                   {/* Admin-only delete inside modal (optional) */}
//                   {currentUser?.role === "ADMIN" && (String(currentUser._id ?? currentUser.id) !== String(editingUser._id)) && (
//                     <button onClick={() => { if (editingUser._id) handleDeleteUser(String(editingUser._id)); }} className="ml-auto px-3 py-2 text-sm border rounded text-red-600">Delete</button>
//                   )}
//                 </div>
//               </>
//             ) : null}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import React, { useEffect, useState } from "react";

type User = {
  id?: string | number;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | string;
  createdAt?: string;
  [key: string]: any;
};

type CreateUserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
};

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateUserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const [roleLoading, setRoleLoading] = useState<Record<string, boolean>>({});
  const [roleError, setRoleError] = useState<Record<string, string | null>>({});
  const [roleSuccess, setRoleSuccess] = useState<Record<string, string | null>>({});

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [editSaving, setEditSaving] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    setCurrentUser(userData ? JSON.parse(userData) : null);
  }, []);

  // Fetch all users on mount
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/users", { signal });
        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText);
          throw new Error(text || `HTTP ${res.status}`);
        }

        const text = await res.text();
        let data: any = null;
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }
        const list: User[] = Array.isArray(data) ? data : (data?.data ?? []);
        setUsers(list);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Fetch /api/users error:", err);
        setError(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch = searchQuery === "" || 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === "ALL" || user.role?.toUpperCase() === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Handle form input change (create)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create user
  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);

    if (!formData.firstName.trim()) {
      setSubmitError("First name is required");
      setIsSubmitting(false);
      return;
    }
    if (!formData.lastName.trim()) {
      setSubmitError("Last name is required");
      setIsSubmitting(false);
      return;
    }
    if (!formData.email.trim()) {
      setSubmitError("Email is required");
      setIsSubmitting(false);
      return;
    }
    if (!formData.password.trim()) {
      setSubmitError("Password is required");
      setIsSubmitting(false);
      return;
    }
    if (formData.password.length < 6) {
      setSubmitError("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) throw new Error(data?.message || `Error: ${res.status}`);

      setSubmitSuccess("User created successfully!");
      setFormData({ firstName: "", lastName: "", email: "", password: "", role: "STUDENT" });

      // Refresh users after a short delay so UX shows success
      setTimeout(() => {
        setShowCreateModal(false);
        fetchUsers();
      }, 500);
    } catch (err: any) {
      console.error("Create user error:", err);
      setSubmitError(err?.message ?? "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json().catch(() => null);
      const list: User[] = Array.isArray(data) ? data : (data?.data ?? []);
      setUsers(list);
    } catch (err) {
      console.error("Error refreshing users:", err);
    }
  };

  // Role change
  async function changeUserRole(userId: string, newRole: "ADMIN" | "TEACHER" | "STUDENT") {
    const meId = currentUser?._id ?? currentUser?.id ?? currentUser?.userId;
    if (String(meId) === String(userId)) {
      setRoleError((s) => ({ ...s, [userId]: "You cannot change your own role" }));
      setTimeout(() => setRoleError((s) => ({ ...s, [userId]: null })), 3000);
      return;
    }

    setRoleLoading((s) => ({ ...s, [userId]: true }));
    setRoleError((s) => ({ ...s, [userId]: null }));
    setRoleSuccess((s) => ({ ...s, [userId]: null }));

    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.message || `Failed to update role (${res.status})`;
        throw new Error(msg);
      }

      const updatedUser = json?.data || json || null;
      if (updatedUser) {
        setUsers((prev) => prev.map((u) => {
          const id = u._id ?? u.id;
          if (String(id) === String(userId)) return { ...u, ...updatedUser };
          return u;
        }));
      } else {
        await fetchUsers();
      }

      setRoleSuccess((s) => ({ ...s, [userId]: "Role updated" }));
      setTimeout(() => setRoleSuccess((s) => ({ ...s, [userId]: null })), 2500);
    } catch (err: any) {
      console.error("changeUserRole error", err);
      setRoleError((s) => ({ ...s, [userId]: err?.message ?? "Failed to update role" }));
    } finally {
      setRoleLoading((s) => ({ ...s, [userId]: false }));
    }
  }

  // Edit user
  async function openEditModal(userId: string) {
    setEditError(null);
    setEditSuccess(null);
    setEditLoading(true);
    setEditingUserId(userId);
    setEditModalOpen(true);
    setEditingUser(null);

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "GET",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Failed to fetch user (${res.status})`);
      }

      const user = json?.data || json || null;
      if (!user) throw new Error("User response malformed");

      const meId = currentUser?._id ?? currentUser?.id ?? currentUser?.userId;
      if (currentUser?.role !== "ADMIN" && String(meId) !== String(user._id || user.id)) {
        throw new Error("Access denied to edit user");
      }

      setEditingUser({
        _id: user._id || user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } catch (err: any) {
      console.error("openEditModal error", err);
      setEditError(err?.message ?? "Failed to load user");
    } finally {
      setEditLoading(false);
    }
  }

  function closeEditModal() {
    setEditModalOpen(false);
    setEditingUserId(null);
    setEditingUser(null);
    setEditError(null);
    setEditSuccess(null);
  }

  function updateEditingUserField<K extends keyof User>(key: K, value: any) {
    setEditingUser((prev) => (prev ? { ...prev, [key]: value } : { [key]: value } as any));
  }

  async function saveEditingUser() {
    if (!editingUserId || !editingUser) return;
    setEditSaving(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const payload: any = {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
        role: editingUser.role,
        status: editingUser.status,
      };
      
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      const res = await fetch(`/api/users/${editingUserId}`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Failed to update user (${res.status})`);
      }

      const updatedUser = json?.data || json || null;
      if (updatedUser) {
        setUsers((prev) => prev.map((u) => {
          const id = u._id ?? u.id;
          if (String(id) === String(editingUserId)) return { ...u, ...updatedUser };
          return u;
        }));
      } else {
        await fetchUsers();
      }

      setEditSuccess("User updated successfully");
      setTimeout(() => setEditSuccess(null), 2500);
    } catch (err: any) {
      console.error("saveEditingUser error", err);
      setEditError(err?.message ?? "Failed to save user");
    } finally {
      setEditSaving(false);
    }
  }

  // Delete user
  async function handleDeleteUser(userId: string) {
    if (currentUser?.role !== "ADMIN") {
      alert("Only admins can delete users");
      return;
    }
    if (!confirm("Delete this user? This action cannot be undone.")) return;
    if (String(currentUser?._id ?? currentUser?.id ?? currentUser?.userId) === String(userId)) {
      alert("You cannot delete your own account");
      return;
    }

    setDeleting((s) => ({ ...s, [userId]: true }));
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Failed to delete user (${res.status})`);
      }

      setUsers((prev) => prev.filter((u) => String(u._id ?? u.id) !== String(userId)));
      if (editingUserId === userId) closeEditModal();
    } catch (err: any) {
      console.error("handleDeleteUser error", err);
      alert(err?.message ?? "Failed to delete user");
    } finally {
      setDeleting((s) => ({ ...s, [userId]: false }));
    }
  }

  // UI helpers
  const getRoleColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "TEACHER":
        return "bg-purple-100 text-purple-800";
      case "STUDENT":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => String(u._id ?? u.id)));
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const userCount = filteredUsers.length;

  return (
    <div className="min-h-screen  p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage users and their roles in the system</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add User
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 1.438l1.5-1.5 1.5 1.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-50 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.role === "ADMIN").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-50 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teachers</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.role === "TEACHER").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-50 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {users.filter(u => u.role === "STUDENT").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRole("ALL")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedRole === "ALL" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedRole("ADMIN")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedRole === "ADMIN" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
              >
                Admin
              </button>
              <button
                onClick={() => setSelectedRole("TEACHER")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedRole === "TEACHER" ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-700 hover:bg-purple-100"}`}
              >
                Teacher
              </button>
              <button
                onClick={() => setSelectedRole("STUDENT")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedRole === "STUDENT" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}
              >
                Student
              </button>
            </div>
          </div>
        </div>

        {/* Selected Users Actions */}
        {selectedUsers.length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-700 font-medium">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                Export Selected
              </button>
              <button className="px-3 py-1 text-sm text-red-600 hover:text-red-800">
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-12 px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 1.438l1.5-1.5 1.5 1.5" />
                        </svg>
                        <p>No users found</p>
                        {searchQuery && (
                          <p className="text-sm mt-1">Try changing your search query</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const identifier = String(user._id ?? user.id ?? "");
                    const isMe = currentUser && (String(currentUser._id || currentUser.id || currentUser.userId) === identifier);
                    
                    return (
                      <tr 
                        key={identifier} 
                        className={`hover:bg-gray-50 ${selectedUsers.includes(identifier) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(identifier)}
                            onChange={() => handleUserSelect(identifier)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-semibold">
                              {user.firstName?.charAt(0)?.toUpperCase() ?? "U"}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {currentUser?.role === "ADMIN" ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={user.role || "STUDENT"}
                                onChange={(e) => changeUserRole(identifier, e.target.value as any)}
                                disabled={roleLoading[identifier] || isMe}
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="STUDENT">Student</option>
                                <option value="TEACHER">Teacher</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                              {roleLoading[identifier] && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              )}
                              {roleError[identifier] && (
                                <span className="text-xs text-red-600">{roleError[identifier]}</span>
                              )}
                              {roleSuccess[identifier] && (
                                <span className="text-xs text-green-600">{roleSuccess[identifier]}</span>
                              )}
                            </div>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role || "Unknown"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(identifier)}
                              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            >
                              Edit
                            </button>
                            {currentUser?.role === "ADMIN" && !isMe && (
                              <button
                                onClick={() => handleDeleteUser(identifier)}
                                disabled={deleting[identifier]}
                                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              >
                                {deleting[identifier] ? "Deleting..." : "Delete"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredUsers.length}</span> of{' '}
                <span className="font-medium">{users.length}</span> users
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
                <button 
                  onClick={() => { setShowCreateModal(false); setSubmitError(null); setSubmitSuccess(null); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  {submitSuccess}
                </div>
              )}
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); setSubmitError(null); setSubmitSuccess(null); }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {editLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : editError ? (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {editError}
                </div>
              ) : editingUser ? (
                <>
                  {editSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                      {editSuccess}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          value={editingUser.firstName || ""}
                          onChange={(e) => updateEditingUserField("firstName", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          value={editingUser.lastName || ""}
                          onChange={(e) => updateEditingUserField("lastName", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        value={editingUser.email || ""}
                        onChange={(e) => updateEditingUserField("email", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={editingUser.role || "STUDENT"}
                          onChange={(e) => updateEditingUserField("role", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="STUDENT">Student</option>
                          <option value="TEACHER">Teacher</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={editingUser.status || "ACTIVE"}
                          onChange={(e) => updateEditingUserField("status", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="PENDING">Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-3">
                    <button
                      onClick={saveEditingUser}
                      disabled={editSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {editSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={closeEditModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    {currentUser?.role === "ADMIN" && currentUser?._id !== editingUser._id && (
                      <button
                        onClick={() => { if (editingUser._id) handleDeleteUser(String(editingUser._id)); }}
                        className="ml-auto px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete User
                      </button>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}