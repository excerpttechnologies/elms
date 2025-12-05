

// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { useParams } from "next/navigation";

// // Types
// export type StudentRef = {
//   _id: string;
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   avatar?: string | null;
// };

// export type Submission = {
//   _id: string;
//   assignmentId: string;
//   studentId: StudentRef | null;
//   status: "LATE" | "SUBMITTED" | "GRADED" | string;
//   score?: number | null;
//   attemptNumber: number;
//   submittedAt: string;
//   answers?: Array<{ questionId: string; answer: string | string[] }>;
//   timeSpent?: number; // seconds
// };

// const PAGE_SIZE = 12;

// export default function AssignmentSubmissionsClient(){
//   const params = useParams();
//   const routeAssignmentId = (params as any)?.id ?? ""; // adapt if your param name differs

//   const [useAllAssignments, setUseAllAssignments] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [submissions, setSubmissions] = useState<Submission[]>([]);
//   const [selected, setSelected] = useState<Submission | null>(null);
//   const [grading, setGrading] = useState<{ score?: number; feedback?: string } | null>(null);
//   const [savingGrade, setSavingGrade] = useState<boolean>(false);
//   const [filterStatus, setFilterStatus] = useState<string>("ALL");
//   const [search, setSearch] = useState<string>("");
//   const [page, setPage] = useState<number>(1);

//   // choose which id to call; backend changed to return teacher-wide submissions
//   const assignmentIdToUse = useAllAssignments ? "all" : routeAssignmentId || "all";

//   useEffect(() => {
//     // whenever assignmentIdToUse changes, re-fetch
//     fetchSubmissions();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [assignmentIdToUse]);

//   async function fetchSubmissions() {
//     setLoading(true);
//     setError(null);

//     try {
//       // backend earlier was returning teacher-wide submissions even when id param was present.
//       // We call `/api/assignments/${assignmentIdToUse}/submissions` where id may be 'all' for teacher-wide.
//       const res = await fetch(`/api/assignments/${assignmentIdToUse}/submissions`, {
//         credentials: "include",
//       });
//       const json = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(json?.message || `Failed to load (${res.status})`);
//       const data = json.data ?? json;
//       setSubmissions(Array.isArray(data) ? data : []);
//       setPage(1);
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : String(err));
//       setSubmissions([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function filteredList(): Submission[] {
//     let list = submissions.slice();

//     if (filterStatus !== "ALL") {
//       list = list.filter((s) => s.status === filterStatus);
//     }

//     if (search.trim()) {
//       const q = search.trim().toLowerCase();
//       list = list.filter((s) => {
//         const name = s.studentId ? `${s.studentId.firstName ?? ""} ${s.studentId.lastName ?? ""}`.trim().toLowerCase() : "";
//         const email = s.studentId?.email?.toLowerCase() ?? "";
//         const aid = (s.assignmentId ?? "").toLowerCase();
//         return name.includes(q) || email.includes(q) || aid.includes(q);
//       });
//     }

//     return list;
//   }

//   const totalFiltered = filteredList().length;
//   const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
//   const pageItems = useMemo(() => {
//     const list = filteredList();
//     const start = (page - 1) * PAGE_SIZE;
//     return list.slice(start, start + PAGE_SIZE);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [submissions, filterStatus, search, page, useAllAssignments]);

//   function openDetail(sub: Submission) {
//     setSelected(sub);
//     setGrading({ score: sub.score ?? undefined, feedback: undefined });
//   }

//   function closeDetail() {
//     setSelected(null);
//     setGrading(null);
//   }

//   function onChangeScore(v: string) {
//     const n = v === "" ? undefined : Number(v);
//     setGrading((g) => ({ ...(g ?? {}), score: n }));
//   }

//   function onChangeFeedback(v: string) {
//     setGrading((g) => ({ ...(g ?? {}), feedback: v }));
//   }

//   async function saveGrade() {
//     if (!selected) return;
//     if (grading == null) return;
//     setSavingGrade(true);

//     try {
//       const res = await fetch(`/api/submissions/${selected._id}`, {
//         method: "PUT",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ score: grading.score, status: "GRADED", feedback: grading.feedback }),
//       });
//       const json = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(json?.message || `Failed to save (${res.status})`);

//       // update local list
//       setSubmissions((prev) =>
//         prev.map((p) =>
//           p._id === selected._id ? { ...p, score: grading.score ?? p.score, status: "GRADED" } : p
//         )
//       );
//       setSelected((s) => (s ? { ...s, score: grading.score ?? s.score, status: "GRADED" } : s));
//       closeDetail();
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : String(err));
//     } finally {
//       setSavingGrade(false);
//     }
//   }

//   function formatTime(seconds?: number) {
//     if (!seconds && seconds !== 0) return "—";
//     const s = Math.floor(seconds);
//     const hrs = Math.floor(s / 3600);
//     const mins = Math.floor((s % 3600) / 60);
//     const secs = s % 60;
//     return `${hrs ? hrs + "h " : ""}${mins ? mins + "m " : ""}${secs ? secs + "s" : ""}`.trim() || "0s";
//   }

//   return (
//     <div className="container my-4">
//       <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
//         <div className="d-flex align-items-center gap-2">
//           <h4 className="mb-0">Submissions</h4>
//           <small className="text-muted">({useAllAssignments ? "All assignments" : routeAssignmentId ? `Assignment ${routeAssignmentId}` : "All"})</small>
//         </div>

//         <div className="d-flex align-items-center gap-2">
//           <div className="form-check form-switch me-2">
//             <input
//               id="toggleAll"
//               className="form-check-input"
//               type="checkbox"
//               checked={useAllAssignments}
//               onChange={(e) => setUseAllAssignments(e.target.checked)}
//             />
//             <label className="form-check-label small" htmlFor="toggleAll">
//               View all assignments
//             </label>
//           </div>

//           <input
//             className="form-control form-control-sm me-2"
//             style={{ minWidth: 160 }}
//             placeholder="Search student / email / assignment"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />

//           <select
//             className="form-select form-select-sm me-2"
//             value={filterStatus}
//             onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
//             style={{ width: 140 }}
//           >
//             <option value="ALL">All</option>
//             <option value="SUBMITTED">Submitted</option>
//             <option value="LATE">Late</option>
//             <option value="GRADED">Graded</option>
//           </select>

//           <button className="btn btn-secondary btn-sm me-2" onClick={() => fetchSubmissions()} disabled={loading}>
//             Refresh
//           </button>
//         </div>
//       </div>

//       {loading && <div className="p-3">Loading submissions...</div>}
//       {error && <div className="alert alert-danger">{error}</div>}

//       {!loading && submissions.length === 0 && <div className="alert alert-info">No submissions found.</div>}

//       {!loading && submissions.length > 0 && (
//         <>
//           <div className="table-responsive">
//             <table className="table table-striped table-hover align-middle">
//               <thead>
//                 <tr>
//                   <th style={{ width: 48 }}></th>
//                   <th>Student</th>
//                   <th>Email</th>
//                   <th>Assignment</th>
//                   <th>Status</th>
//                   <th>Score</th>
//                   <th>Attempt</th>
//                   <th>Time Spent</th>
//                   <th>Submitted At</th>
//                   <th></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {pageItems.map((s) => (
//                   <tr key={s._id}>
//                     <td>
//                       {s.studentId?.avatar ? (
//                         <img src={s.studentId.avatar} alt="avatar" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }} />
//                       ) : (
//                         <div style={{ width: 36, height: 36, borderRadius: 6, background: "#f0f0f0" }} />
//                       )}
//                     </td>
//                     <td>{s.studentId ? `${s.studentId.firstName ?? ""} ${s.studentId.lastName ?? ""}`.trim() : "—"}</td>
//                     <td style={{ whiteSpace: "nowrap" }}>{s.studentId?.email ?? "—"}</td>
//                     <td style={{ fontSize: 13 }}>{s.assignmentId ?? "—"}</td>
//                     <td>{s.status}</td>
//                     <td>{s.score ?? "—"}</td>
//                     <td>{s.attemptNumber ?? "—"}</td>
//                     <td style={{ whiteSpace: "nowrap" }}>{formatTime(s.timeSpent)}</td>
//                     <td style={{ whiteSpace: "nowrap" }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}</td>
//                     <td>
//                       <div className="btn-group" role="group">
//                         <button className="btn btn-sm btn-outline-primary" onClick={() => openDetail(s)}>View</button>
//                         <button className="btn btn-sm btn-outline-success" onClick={() => openDetail(s)}>Grade</button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           <div className="d-flex justify-content-between align-items-center mt-2">
//             <div className="small text-muted">Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalFiltered)} of {totalFiltered}</div>
//             <div>
//               <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
//                 Prev
//               </button>
//               <span className="mx-2 small">Page {page} / {totalPages}</span>
//               <button className="btn btn-sm btn-outline-secondary ms-1" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
//                 Next
//               </button>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Modal - Submission Detail */}
//       {selected && (
//         <div className="modal show d-block" tabIndex={-1} role="dialog">
//           <div className="modal-dialog modal-lg" role="document">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   Submission - { selected?.studentId ? `${selected.studentId.firstName ?? ""} ${selected.studentId.lastName ?? ""}`.trim() : (selected?.studentId as StudentRef | undefined)?.email ?? "Student" }
//                 </h5>
//                 <button type="button" className="btn-close" aria-label="Close" onClick={closeDetail}></button>
//               </div>
//               <div className="modal-body">
//                 <div className="mb-2">
//                   <strong>Assignment:</strong> {selected.assignmentId ?? "—"} • <strong>Status:</strong> {selected.status} • <strong>Attempt:</strong> {selected.attemptNumber} • <strong>Submitted:</strong> {selected.submittedAt ? new Date(selected.submittedAt).toLocaleString() : "—"}
//                 </div>

//                 <div className="mb-3">
//                   <h6>Answers</h6>
//                   {selected.answers && selected.answers.length > 0 ? (
//                     selected.answers.map((a, i) => (
//                       <div key={i} className="card mb-2">
//                         <div className="card-body">
//                           <div className="small text-muted">Question ID: {a.questionId}</div>
//                           <div>{Array.isArray(a.answer) ? a.answer.join(", ") : a.answer}</div>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-muted">No answers included (might be file submissions or auto-graded only).</div>
//                   )}
//                 </div>

//                 <div>
//                   <h6>Grade</h6>
//                   <div className="mb-2">
//                     <label className="form-label">Score</label>
//                     <input className="form-control" type="number" min={0} value={grading?.score ?? ""} onChange={(e) => onChangeScore(e.target.value)} />
//                   </div>
//                   <div className="mb-2">
//                     <label className="form-label">Feedback (optional)</label>
//                     <textarea className="form-control" rows={3} value={grading?.feedback ?? ""} onChange={(e) => onChangeFeedback(e.target.value)} />
//                   </div>
//                 </div>

//                 <div className="mt-3 small text-muted">Time Spent: {formatTime(selected.timeSpent)}</div>

//                 {error && <div className="alert alert-danger mt-3">{error}</div>}
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="btn btn-secondary" onClick={closeDetail}>Close</button>
//                 <button type="button" className="btn btn-primary" onClick={saveGrade} disabled={savingGrade}>{savingGrade ? 'Saving...' : 'Save Grade'}</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

// Types
export type StudentRef = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string | null;
};

export type Submission = {
  _id: string;
  assignmentId: string;
  studentId: StudentRef | null;
  status: "LATE" | "SUBMITTED" | "GRADED" | string;
  score?: number | null;
  attemptNumber: number;
  submittedAt: string;
  answers?: Array<{ questionId: string; answer: string | string[] }>;
  timeSpent?: number; // seconds
};

const PAGE_SIZE = 12;

export default function AssignmentSubmissionsClient() {
  const params = useParams();
  const routeAssignmentId = (params as any)?.id ?? "";

  const [useAllAssignments, setUseAllAssignments] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [grading, setGrading] = useState<{ score?: number; feedback?: string } | null>(null);
  const [savingGrade, setSavingGrade] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const assignmentIdToUse = useAllAssignments ? "all" : routeAssignmentId || "all";

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentIdToUse]);

  async function fetchSubmissions() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/assignments/${assignmentIdToUse}/submissions`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `Failed to load (${res.status})`);
      const data = json.data ?? json;
      setSubmissions(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }

  function filteredList(): Submission[] {
    let list = submissions.slice();

    if (filterStatus !== "ALL") {
      list = list.filter((s) => s.status === filterStatus);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => {
        const name = s.studentId ? `${s.studentId.firstName ?? ""} ${s.studentId.lastName ?? ""}`.trim().toLowerCase() : "";
        const email = s.studentId?.email?.toLowerCase() ?? "";
        const aid = (s.assignmentId ?? "").toLowerCase();
        return name.includes(q) || email.includes(q) || aid.includes(q);
      });
    }

    return list;
  }

  const totalFiltered = filteredList().length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const list = filteredList();
    const start = (page - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions, filterStatus, search, page, useAllAssignments]);

  function openDetail(sub: Submission) {
    setSelected(sub);
    setGrading({ score: sub.score ?? undefined, feedback: undefined });
  }

  function closeDetail() {
    setSelected(null);
    setGrading(null);
  }

  function onChangeScore(v: string) {
    const n = v === "" ? undefined : Number(v);
    setGrading((g) => ({ ...(g ?? {}), score: n }));
  }

  function onChangeFeedback(v: string) {
    setGrading((g) => ({ ...(g ?? {}), feedback: v }));
  }

  async function saveGrade() {
    if (!selected) return;
    if (grading == null) return;
    setSavingGrade(true);

    try {
      const res = await fetch(`/api/submissions/${selected._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: grading.score, status: "GRADED", feedback: grading.feedback }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `Failed to save (${res.status})`);

      // update local list
      setSubmissions((prev) =>
        prev.map((p) =>
          p._id === selected._id ? { ...p, score: grading.score ?? p.score, status: "GRADED" } : p
        )
      );
      setSelected((s) => (s ? { ...s, score: grading.score ?? s.score, status: "GRADED" } : s));
      closeDetail();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingGrade(false);
    }
  }

  function formatTime(seconds?: number) {
    if (!seconds && seconds !== 0) return "—";
    const s = Math.floor(seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs ? hrs + "h " : ""}${mins ? mins + "m " : ""}${secs ? secs + "s" : ""}`.trim() || "0s";
  }

  // Get status badge color
  function getStatusColor(status: string) {
    switch (status) {
      case "SUBMITTED": return "bg-blue-100 text-blue-700";
      case "LATE": return "bg-amber-100 text-amber-700";
      case "GRADED": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <div className="card w-full mx-auto p-2">
      {/* Header */}
      
        {/* Filters */}
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Search :</label>
              <div className="relative">
                <input
                  className="input w-full pl-10"
                  placeholder="Search student, email, or assignment..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="icon-[tabler--search] size-4"></span>
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status :</label>
              <select
                className="select w-full md:w-40"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              >
                <option value="ALL">All Status</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="LATE">Late</option>
                <option value="GRADED">Graded</option>
              </select>
            </div>
          </div>
        </div>
      

      {/* Main Content */}
      <div className="p-3">

        {loading ? (
          <div className="card-body">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-500">Loading submissions...</p>
            </div>
          </div>
        ) : error ? (
          <div className="card-body">
            <div className="alert alert-error">
              <span className="icon-[tabler--alert-circle] size-5"></span>
              {error}
            </div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="card-body">
            <div className="text-center py-12">
              <span className="icon-[tabler--file-off] size-16 text-gray-300 mb-4 block mx-auto"></span>
              <h4 className="text-lg font-medium text-gray-700 mb-2">No submissions found</h4>
              <p className="text-gray-500 mb-6">Try adjusting your filters or check back later</p>
              <button
                onClick={() => fetchSubmissions()}
                className="btn btn-primary"
              >
                <span className="icon-[tabler--refresh] size-5 mr-2"></span>
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto border-base-content/25 rounded-lg border">
              <table className="table">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="font-medium text-gray-700">Student</th>
                    <th className="font-medium text-gray-700">Email</th>
                    <th className="font-medium text-gray-700">Assignment</th>
                    <th className="font-medium text-gray-700">Status</th>
                    <th className="font-medium text-gray-700">Score</th>
                    <th className="font-medium text-gray-700">Attempt</th>
                    <th className="font-medium text-gray-700">Time Spent</th>
                    <th className="font-medium text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {s.studentId?.avatar ? (
                              <img 
                                src={s.studentId.avatar} 
                                alt="avatar" 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-primary">
                                {(s.studentId?.firstName?.[0] || '') + (s.studentId?.lastName?.[0] || '')}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {s.studentId ? `${s.studentId.firstName ?? ""} ${s.studentId.lastName ?? ""}`.trim() : "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-gray-700">{s.studentId?.email ?? "—"}</span>
                      </td>
                      <td>
                        <div className="text-sm text-gray-700 truncate max-w-[150px]" title={s.assignmentId ?? "—"}>
                          {s.assignmentId ?? "—"}
                        </div>
                      </td>
                      <td>
                        <span className={`badge text-xs ${getStatusColor(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <div className="text-sm font-medium text-gray-800">
                          {s.score !== null && s.score !== undefined ? s.score : "—"}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-gray-700">{s.attemptNumber ?? "—"}</span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-700">{formatTime(s.timeSpent)}</span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetail(s)}
                            className="btn btn-circle btn-text btn-sm hover:bg-blue-50 hover:text-blue-600"
                            aria-label="View submission"
                          >
                            <span className="icon-[tabler--eye] size-4"></span>
                          </button>
                          {s.status !== "GRADED" && (
                            <button
                              onClick={() => openDetail(s)}
                              className="btn btn-circle btn-text btn-sm hover:bg-green-50 hover:text-green-600"
                              aria-label="Grade submission"
                            >
                              <span className="icon-[tabler--pencil] size-4"></span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card-footer">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">{(page - 1) * PAGE_SIZE + 1}</span> - 
                    <span className="font-medium"> {Math.min(page * PAGE_SIZE, totalFiltered)} </span>
                    of <span className="font-medium">{totalFiltered}</span> submissions
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      disabled={page <= 1} 
                      onClick={() => setPage((p) => Math.max(1, p - 1))} 
                      className="btn btn-soft btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="icon-[tabler--chevron-left] size-4"></span>
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`btn btn-circle btn-sm ${page === pageNum ? 'btn-primary' : 'btn-text'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      disabled={page >= totalPages} 
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                      className="btn btn-soft btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <span className="icon-[tabler--chevron-right] size-4 ml-2"></span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for Submission Detail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={closeDetail}
          />
          
          {/* Modal Content */}
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Submission Details
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Grade and review student submission
                  </p>
                </div>
                <button
                  onClick={closeDetail}
                  className="btn btn-circle btn-text btn-sm"
                >
                  <span className="icon-[tabler--x] size-5"></span>
                </button>
              </div>

              {/* Student Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {selected.studentId?.avatar ? (
                      <img 
                        src={selected.studentId.avatar} 
                        alt="avatar" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-medium text-primary">
                        {(selected.studentId?.firstName?.[0] || '') + (selected.studentId?.lastName?.[0] || '')}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {selected.studentId ? `${selected.studentId.firstName ?? ""} ${selected.studentId.lastName ?? ""}`.trim() : "Unknown Student"}
                    </h4>
                    <p className="text-sm text-gray-600">{selected.studentId?.email ?? "—"}</p>
                  </div>
                </div>
              </div>

              {/* Submission Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Assignment</div>
                  <div className="font-medium text-gray-800 truncate">{selected.assignmentId ?? "—"}</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <span className={`badge ${getStatusColor(selected.status)}`}>
                    {selected.status}
                  </span>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Attempt</div>
                  <div className="font-medium text-gray-800">#{selected.attemptNumber}</div>
                </div>
              </div>

              {/* Submitted Time */}
              <div className="mb-6">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Submitted:</span>{" "}
                  {selected.submittedAt ? new Date(selected.submittedAt).toLocaleString() : "—"}
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Time Spent:</span> {formatTime(selected.timeSpent)}
                </div>
              </div>

              {/* Answers Section */}
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">Answers</h5>
                {selected.answers && selected.answers.length > 0 ? (
                  <div className="space-y-3">
                    {selected.answers.map((a, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="text-xs text-gray-500 mb-2">Question ID: {a.questionId}</div>
                        <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded">
                          {Array.isArray(a.answer) ? a.answer.join(", ") : a.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <span className="icon-[tabler--file-text] size-12 text-gray-400 mb-3 block mx-auto"></span>
                    <p className="text-gray-500">No answers available</p>
                    <p className="text-xs text-gray-400 mt-1">This might be a file submission or auto-graded assignment</p>
                  </div>
                )}
              </div>

              {/* Grading Section */}
              <div className="border-t pt-6">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">Grading</h5>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                    <input 
                      className="input w-32" 
                      type="number" 
                      min={0} 
                      value={grading?.score ?? ""} 
                      onChange={(e) => onChangeScore(e.target.value)} 
                      placeholder="Enter score"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feedback (optional)</label>
                    <textarea 
                      className="textarea w-full" 
                      rows={3} 
                      value={grading?.feedback ?? ""} 
                      onChange={(e) => onChangeFeedback(e.target.value)} 
                      placeholder="Add feedback for the student..."
                    />
                  </div>
                </div>

                {error && (
                  <div className="alert alert-error mt-4">
                    <span className="icon-[tabler--alert-circle] size-5"></span>
                    {error}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
                <button 
                  type="button" 
                  onClick={closeDetail} 
                  className="btn btn-text"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={saveGrade} 
                  disabled={savingGrade} 
                  className="btn btn-primary min-w-[140px]"
                >
                  {savingGrade ? (
                    <>
                      <span className="icon-[tabler--loader] size-5 animate-spin mr-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="icon-[tabler--check] size-5 mr-2"></span>
                      Save Grade
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}