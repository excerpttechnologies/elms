

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

export default function AssignmentSubmissionsClient(){
  const params = useParams();
  const routeAssignmentId = (params as any)?.id ?? ""; // adapt if your param name differs

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

  // choose which id to call; backend changed to return teacher-wide submissions
  const assignmentIdToUse = useAllAssignments ? "all" : routeAssignmentId || "all";

  useEffect(() => {
    // whenever assignmentIdToUse changes, re-fetch
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentIdToUse]);

  async function fetchSubmissions() {
    setLoading(true);
    setError(null);

    try {
      // backend earlier was returning teacher-wide submissions even when id param was present.
      // We call `/api/assignments/${assignmentIdToUse}/submissions` where id may be 'all' for teacher-wide.
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

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <h4 className="mb-0">Submissions</h4>
          <small className="text-muted">({useAllAssignments ? "All assignments" : routeAssignmentId ? `Assignment ${routeAssignmentId}` : "All"})</small>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="form-check form-switch me-2">
            <input
              id="toggleAll"
              className="form-check-input"
              type="checkbox"
              checked={useAllAssignments}
              onChange={(e) => setUseAllAssignments(e.target.checked)}
            />
            <label className="form-check-label small" htmlFor="toggleAll">
              View all assignments
            </label>
          </div>

          <input
            className="form-control form-control-sm me-2"
            style={{ minWidth: 160 }}
            placeholder="Search student / email / assignment"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="form-select form-select-sm me-2"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            style={{ width: 140 }}
          >
            <option value="ALL">All</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="LATE">Late</option>
            <option value="GRADED">Graded</option>
          </select>

          <button className="btn btn-secondary btn-sm me-2" onClick={() => fetchSubmissions()} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {loading && <div className="p-3">Loading submissions...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && submissions.length === 0 && <div className="alert alert-info">No submissions found.</div>}

      {!loading && submissions.length > 0 && (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th style={{ width: 48 }}></th>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Assignment</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Attempt</th>
                  <th>Time Spent</th>
                  <th>Submitted At</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((s) => (
                  <tr key={s._id}>
                    <td>
                      {s.studentId?.avatar ? (
                        <img src={s.studentId.avatar} alt="avatar" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: 6, background: "#f0f0f0" }} />
                      )}
                    </td>
                    <td>{s.studentId ? `${s.studentId.firstName ?? ""} ${s.studentId.lastName ?? ""}`.trim() : "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{s.studentId?.email ?? "—"}</td>
                    <td style={{ fontSize: 13 }}>{s.assignmentId ?? "—"}</td>
                    <td>{s.status}</td>
                    <td>{s.score ?? "—"}</td>
                    <td>{s.attemptNumber ?? "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatTime(s.timeSpent)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openDetail(s)}>View</button>
                        <button className="btn btn-sm btn-outline-success" onClick={() => openDetail(s)}>Grade</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="small text-muted">Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalFiltered)} of {totalFiltered}</div>
            <div>
              <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Prev
              </button>
              <span className="mx-2 small">Page {page} / {totalPages}</span>
              <button className="btn btn-sm btn-outline-secondary ms-1" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal - Submission Detail */}
      {selected && (
        <div className="modal show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Submission - { selected?.studentId ? `${selected.studentId.firstName ?? ""} ${selected.studentId.lastName ?? ""}`.trim() : (selected?.studentId as StudentRef | undefined)?.email ?? "Student" }
                </h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeDetail}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <strong>Assignment:</strong> {selected.assignmentId ?? "—"} • <strong>Status:</strong> {selected.status} • <strong>Attempt:</strong> {selected.attemptNumber} • <strong>Submitted:</strong> {selected.submittedAt ? new Date(selected.submittedAt).toLocaleString() : "—"}
                </div>

                <div className="mb-3">
                  <h6>Answers</h6>
                  {selected.answers && selected.answers.length > 0 ? (
                    selected.answers.map((a, i) => (
                      <div key={i} className="card mb-2">
                        <div className="card-body">
                          <div className="small text-muted">Question ID: {a.questionId}</div>
                          <div>{Array.isArray(a.answer) ? a.answer.join(", ") : a.answer}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted">No answers included (might be file submissions or auto-graded only).</div>
                  )}
                </div>

                <div>
                  <h6>Grade</h6>
                  <div className="mb-2">
                    <label className="form-label">Score</label>
                    <input className="form-control" type="number" min={0} value={grading?.score ?? ""} onChange={(e) => onChangeScore(e.target.value)} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Feedback (optional)</label>
                    <textarea className="form-control" rows={3} value={grading?.feedback ?? ""} onChange={(e) => onChangeFeedback(e.target.value)} />
                  </div>
                </div>

                <div className="mt-3 small text-muted">Time Spent: {formatTime(selected.timeSpent)}</div>

                {error && <div className="alert alert-danger mt-3">{error}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDetail}>Close</button>
                <button type="button" className="btn btn-primary" onClick={saveGrade} disabled={savingGrade}>{savingGrade ? 'Saving...' : 'Save Grade'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
