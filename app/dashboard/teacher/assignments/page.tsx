

"use client";

import React, { useEffect, useState } from "react";

type UserRef = { _id: string; firstName?: string; lastName?: string; email?: string } | null;
type CourseOption = { _id: string; title: string };

type Question = {
  _localId?: string; // local-only stable key for react lists
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";
  options?: string[];
  correctAnswer?: string | string[] | null;
  points: number;
  order: number;
};

type Assignment = {
  _id: string;
  courseId?: { _id: string; title?: string } | string;
  title: string;
  description?: string;
  type: string;
  totalPoints?: number;
  passingScore?: number;
  dueDate?: string | null;
  allowLateSubmission?: boolean;
  status?: string;
  createdBy?: UserRef;
  createdAt?: string;
  questions?: Question[];
  [key: string]: any;
};

export default function AssignmentsManager() {
  // list state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // filters / pagination
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [filterCourseId, setFilterCourseId] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // Modal states (changed from showCreate)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  
  const [creating, setCreating] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false); // unified saving state for create/update
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    courseId: "",
    title: "",
    description: "",
    type: "QUIZ",
    totalPoints: 100,
    passingScore: 60,
    dueDate: "",
    allowLateSubmission: false,
    latePenalty: 0,
    maxAttempts: 1,
    timeLimit: 0,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  // publish UI state: per-assignment loading/errors/success
  const [publishing, setPublishing] = useState<Record<string, boolean>>({});
  const [publishError, setPublishError] = useState<Record<string, string | null>>({});
  const [publishSuccess, setPublishSuccess] = useState<Record<string, string | null>>({});

  // edit/delete state
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Helper to build query string
  function buildListUrl() {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (filterCourseId) params.set("courseId", filterCourseId);
    if (filterType) params.set("type", filterType);
    if (filterStatus) params.set("status", filterStatus);
    return `/api/assignments?${params.toString()}`;
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filterCourseId, filterType, filterStatus]);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/courses", { credentials: "include" });
      if (!res.ok) return;
      const json = await res.json().catch(() => null);
      const list: CourseOption[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : (json?.data ?? []);
      const mapped = list.map((c: any) => ({ _id: c._id ?? c.id, title: c.title }));
      setCourses(mapped);
    } catch (err) {
      console.error("fetchCourses error", err);
    }
  }

  async function fetchAssignments() {
    setLoadingList(true);
    setListError(null);
    try {
      const url = buildListUrl();
      const res = await fetch(url, { credentials: "include" });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.message || `HTTP ${res.status}`);
      }

      // Robust parsing for multiple pagination shapes
      let items: Assignment[] = [];
      let serverPage = page;
      let serverLimit = limit;
      let serverTotal = total;

      if (Array.isArray(json?.data)) {
        items = json.data;
        serverPage = Number(json.page ?? serverPage);
        serverLimit = Number(json.limit ?? serverLimit);
        serverTotal = Number(json.total ?? serverTotal);
      } else if (Array.isArray(json?.items)) {
        items = json.items;
        serverPage = Number(json?.pagination?.page ?? json.page ?? serverPage);
        serverLimit = Number(json?.pagination?.limit ?? json.limit ?? serverLimit);
        serverTotal = Number(json?.pagination?.total ?? json.total ?? serverTotal);
      } else if (Array.isArray(json)) {
        items = json as any;
      } else if (Array.isArray(json?.data?.data)) {
        items = json.data.data;
        serverPage = Number(json.data.page ?? serverPage);
        serverLimit = Number(json.data.limit ?? serverLimit);
        serverTotal = Number(json.data.total ?? serverTotal);
      } else if (json?.data && Array.isArray((json.data as any).items)) {
        items = (json.data as any).items;
        serverPage = Number((json.data as any).pagination?.page ?? (json.data as any).page ?? serverPage);
        serverLimit = Number((json.data as any).pagination?.limit ?? (json.data as any).limit ?? serverLimit);
        serverTotal = Number((json.data as any).pagination?.total ?? (json.data as any).total ?? serverTotal);
      }

      setAssignments(items);
      setTotal(Number.isFinite(serverTotal) ? serverTotal : items.length);
      setPage(Number.isFinite(serverPage) ? serverPage : page);
      setLimit(Number.isFinite(serverLimit) ? serverLimit : limit);
    } catch (err: any) {
      console.error("fetchAssignments error", err);
      setListError(err?.message ?? "Failed to load assignments");
    } finally {
      setLoadingList(false);
    }
  }

  // ---------- Create form helpers ----------
  function updateForm<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function addQuestion() {
    setQuestions((q) => [
      ...q,
      {
        _localId: Date.now().toString() + Math.random().toString(36).slice(2),
        question: "",
        type: "SHORT_ANSWER",
        options: [],
        correctAnswer: null,
        points: 0,
        order: q.length,
      },
    ]);
  }

  function updateQuestion(idx: number, patch: Partial<Question>) {
    setQuestions((q) => {
      const copy = [...q];
      if (!copy[idx]) return copy;
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  }

  function removeQuestion(idx: number) {
    setQuestions((q) => {
      const copy = [...q];
      copy.splice(idx, 1);
      return copy.map((qq, i) => ({ ...qq, order: i }));
    });
  }

  // Safer add option: ensures question exists
  function addOptionToQuestion(qIdx: number) {
    setQuestions((prev) => {
      const copy = [...prev];
      while (copy.length <= qIdx) {
        copy.push({
          _localId: Date.now().toString() + Math.random().toString(36).slice(2),
          question: "",
          type: "SHORT_ANSWER",
          options: [],
          correctAnswer: null,
          points: 0,
          order: copy.length,
        });
      }
      copy[qIdx] = {
        ...copy[qIdx],
        options: [...(copy[qIdx].options ?? []), ""],
      };
      return copy;
    });
  }

  function updateOption(qIdx: number, optionIdx: number, value: string) {
    const opts = [...(questions[qIdx].options ?? [])];
    opts[optionIdx] = value;
    updateQuestion(qIdx, { options: opts });
  }

  function removeOption(qIdx: number, optionIdx: number) {
    const opts = [...(questions[qIdx].options ?? [])];
    opts.splice(optionIdx, 1);
    updateQuestion(qIdx, { options: opts });
  }

  function validateCreatePayload() {
    if (!form.courseId) return "Please select a course";
    if (!form.title || form.title.trim().length < 3) return "Title is required (min 3 characters)";
    if (!form.description || form.description.trim().length < 5) return "Description is required (min 5 characters)";
    if (questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question || q.question.trim().length === 0) return `Question ${i + 1}: text is required`;
        if (q.type === "MULTIPLE_CHOICE") {
          if (!q.options || q.options.length < 2) return `Question ${i + 1}: MCQ needs at least 2 options`;
        }
        if (typeof q.points !== "number" || q.points < 0) return `Question ${i + 1}: invalid points`;
      }
    }
    if (typeof form.totalPoints !== "number" || form.totalPoints < 0) return "Total points must be >= 0";
    if (typeof form.passingScore !== "number" || form.passingScore < 0 || form.passingScore > 100) return "Passing score must be between 0 and 100";
    return null;
  }

  // Close all modals helper
  const closeAllModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditing(false);
    setEditingAssignmentId(null);
    setCreateError(null);
    setEditError(null);
    setCreateSuccess(null);
  };

  // Reset form to initial state
  const resetForm = () => {
    setForm({
      courseId: "",
      title: "",
      description: "",
      type: "QUIZ",
      totalPoints: 100,
      passingScore: 60,
      dueDate: "",
      allowLateSubmission: false,
      latePenalty: 0,
      maxAttempts: 1,
      timeLimit: 0,
    });
    setQuestions([]);
    setCreateError(null);
    setEditError(null);
    setCreateSuccess(null);
  };

  async function handleCreateAssignment(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    const validationError = validateCreatePayload();
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    const payload: any = {
      courseId: form.courseId,
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      totalPoints: Number(form.totalPoints),
      passingScore: Number(form.passingScore),
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      allowLateSubmission: Boolean(form.allowLateSubmission),
      latePenalty: form.allowLateSubmission ? Number(form.latePenalty) : undefined,
      maxAttempts: form.maxAttempts ? Number(form.maxAttempts) : undefined,
      timeLimit: form.timeLimit ? Number(form.timeLimit) : undefined,
      questions: questions.length > 0 ? questions.map((q) => ({
        question: q.question,
        type: q.type,
        options: q.options && q.options.length ? q.options : undefined,
        correctAnswer: q.correctAnswer ?? undefined,
        points: Number(q.points),
        order: q.order,
      })) : undefined,
    };

    setCreating(true);
    setSaving(true);
    try {
      const res = await fetch(`/api/assignments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // defensive parsing
      const text = await res.text();
      let json: any = {};
      try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

      if (!res.ok) {
        throw new Error(json?.message || json?.error || json?.raw || `Failed to create assignment (${res.status})`);
      }

      setCreateSuccess("Assignment created successfully");
      resetForm();
      fetchAssignments();
      setTimeout(() => {
        setCreateSuccess(null);
        setIsCreateModalOpen(false);
      }, 2000);
    } catch (err: any) {
      console.error("handleCreateAssignment error", err);
      setCreateError(err?.message ?? "Failed to create assignment");
    } finally {
      setCreating(false);
      setSaving(false);
    }
  }

  // ---------- Publish flow ----------
  async function publishAssignment(assignmentId: string) {
    if (!confirm("Publish this assignment? Once published it will be visible to students.")) return;

    // start loading for this assignment
    setPublishing((s) => ({ ...s, [assignmentId]: true }));
    setPublishError((s) => ({ ...s, [assignmentId]: null }));
    setPublishSuccess((s) => ({ ...s, [assignmentId]: null }));

    try {
      const res = await fetch(`/api/assignments/${assignmentId}/publish`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Failed to publish assignment (${res.status})`);
      }

      // If server returned updated status or object, patch local list
      const returned = json?.data || json || null;
      setAssignments((prev) =>
        prev.map((a) => {
          if (String(a._id) === String(assignmentId)) {
            // prefer returned fields if present
            if (returned && typeof returned === "object") {
              return { ...a, ...(returned as any) };
            }
            return { ...a, status: "PUBLISHED" };
          }
          return a;
        })
      );

      setPublishSuccess((s) => ({ ...s, [assignmentId]: "Published" }));
      setTimeout(() => setPublishSuccess((s) => ({ ...s, [assignmentId]: null })), 3000);
    } catch (err: any) {
      console.error("publishAssignment error", err);
      setPublishError((s) => ({ ...s, [assignmentId]: err?.message ?? "Failed to publish" }));
    } finally {
      setPublishing((s) => ({ ...s, [assignmentId]: false }));
    }
  }

  // ---------- Fetch single assignment details (for editing) ----------
  async function fetchAssignmentById(id: string) {
    setEditError(null);
    setSelectedAssignment(null);
    try {
      const res = await fetch(`/api/assignments/${id}`, { credentials: "include" });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Failed to fetch assignment (${res.status})`);
      }
      const data = json?.data ?? json ?? null;
      setSelectedAssignment(data as Assignment);
      return data as Assignment;
    } catch (err: any) {
      console.error("fetchAssignmentById error", err);
      setEditError(err?.message ?? "Failed to load assignment");
      return null;
    }
  }

  // ---------- open edit modal and prefill form ---------
  async function openEdit(assignmentId: string) {
    setEditingAssignmentId(assignmentId);
    setEditing(true);
    const data = await fetchAssignmentById(assignmentId);
    if (!data) return;

    // Prefill create/edit form with fetched data
    setForm((f) => ({
      ...f,
      courseId: typeof data.courseId === "string" ? data.courseId : (data.courseId as any)?._id ?? "",
      title: data.title ?? "",
      description: data.description ?? "",
      type: data.type ?? "QUIZ",
      totalPoints: data.totalPoints ?? 100,
      passingScore: data.passingScore ?? 60,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString().slice(0, 16) : "",
      allowLateSubmission: Boolean(data.allowLateSubmission),
      latePenalty: data.latePenalty ?? 0,
      maxAttempts: data.maxAttempts ?? 1,
      timeLimit: data.timeLimit ?? 0,
    }));

    setQuestions((data.questions ?? []).map((q: any) => ({
      _localId: Date.now().toString() + Math.random().toString(36).slice(2),
      question: q.question ?? "",
      type: q.type ?? "SHORT_ANSWER",
      options: q.options ?? [],
      correctAnswer: q.correctAnswer ?? null,
      points: q.points ?? 0,
      order: q.order ?? 0,
    })));

    // Open edit modal
    setIsEditModalOpen(true);
  }

  // ---------- Update assignment via PUT /api/assignments/:id ----------
  async function handleUpdateAssignment(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!editingAssignmentId) return;
    setEditError(null);

    // Basic validation reuse
    const validationError = validateCreatePayload();
    if (validationError) {
      setEditError(validationError);
      return;
    }

    const payload: any = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      totalPoints: Number(form.totalPoints),
      passingScore: Number(form.passingScore),
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      allowLateSubmission: Boolean(form.allowLateSubmission),
      latePenalty: form.allowLateSubmission ? Number(form.latePenalty) : undefined,
      maxAttempts: form.maxAttempts ? Number(form.maxAttempts) : undefined,
      timeLimit: form.timeLimit ? Number(form.timeLimit) : undefined,
      questions: questions.length > 0 ? questions.map((q) => ({
        question: q.question,
        type: q.type,
        options: q.options && q.options.length ? q.options : undefined,
        correctAnswer: q.correctAnswer ?? undefined,
        points: Number(q.points),
        order: q.order,
      })) : undefined,
    };

    try {
      setSaving(true);
      setCreating(true);
      const res = await fetch(`/api/assignments/${editingAssignmentId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Failed to update assignment (${res.status})`);
      }

      const updated = json?.data ?? json ?? null;

      // Update local list with returned object when possible
      setAssignments((prev) => prev.map((a) => (String(a._id) === String(editingAssignmentId) ? { ...a, ...(updated as any) } : a)));

      setEditError(null);
      setEditing(false);
      setEditingAssignmentId(null);
      setSelectedAssignment(null);
      setCreateSuccess("Assignment updated");
      setTimeout(() => {
        setCreateSuccess(null);
        setIsEditModalOpen(false);
      }, 2000);
    } catch (err: any) {
      console.error("handleUpdateAssignment error", err);
      setEditError(err?.message ?? "Failed to update assignment");
    } finally {
      setCreating(false);
      setSaving(false);
    }
  }

  // ---------- Delete assignment via DELETE /api/assignments/:id ----------
  async function handleDeleteAssignment(id: string) {
    if (!confirm("the assignment that has submissions count, you cant delete")) return;
    setDeletingId(id);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const json = await res.json().catch(() => null);
      
      if (!res.ok) {
        throw new Error(json?.message || `Failed to delete assignment (${res.status})`);
      }

      // Remove from local list
      setAssignments((prev) => prev.filter((a) => String(a._id) !== String(id)));
      setDeleteError(null);
      setCreateSuccess("Assignment deleted");
      setTimeout(() => setCreateSuccess(null), 3000);
    } catch (err: any) {
      console.error("handleDeleteAssignment error", err);
      setDeleteError(err?.message ?? "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  // UI small helpers
  const totalPages = Math.max(1, Math.ceil(total / limit || 1));

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Assignments</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            className="btn btn-primary waves waves-primary"
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
          >
            <span className="icon-[tabler--plus] size-5 mr-2"></span>
            Create Assignment
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className=" mb-5">
   
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Course</label>
            <select 
              value={filterCourseId} 
              onChange={(e) => { setFilterCourseId(e.target.value); setPage(1); }} 
              className="select w-full"
            >
              <option value="">All courses</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select 
              value={filterType} 
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }} 
              className="select w-full"
            >
              <option value="">All types</option>
              <option value="QUIZ">QUIZ</option>
              <option value="ESSAY">ESSAY</option>
              <option value="PROJECT">PROJECT</option>
              <option value="CODING">CODING</option>
              <option value="FILE_UPLOAD">FILE_UPLOAD</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select 
              value={filterStatus} 
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} 
              className="select w-full"
            >
              <option value="">Any status</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Items per page</label>
                <input 
                  type="number" 
                  min={1} 
                  value={limit} 
                  onChange={(e) => { setLimit(Number(e.target.value || 10)); setPage(1); }} 
                  className="input w-full"
                />
              </div>
              <button 
                onClick={() => { setPage(1); fetchAssignments(); }} 
                className="btn btn-soft btn-primary"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments List */}

        {loadingList ? (
          <div className="card-body">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-500">Loading assignments...</p>
            </div>
          </div>
        ) : listError ? (
          <div className="card-body">
            <div className="alert alert-error">
              <span className="icon-[tabler--alert-circle] size-5"></span>
              {listError}
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="card-body">
            <div className="text-center py-12">
              <span className="icon-[tabler--file-off] size-16 text-gray-300 mb-4 block mx-auto"></span>
              <h4 className="text-lg font-medium text-gray-700 mb-2">No assignments found</h4>
              <p className="text-gray-500 mb-6">Try adjusting your filters or create a new assignment</p>
              <button
                onClick={() => {
                  resetForm();
                  setIsCreateModalOpen(true);
                }}
                className="btn btn-primary"
              >
                <span className="icon-[tabler--plus] size-5 mr-2"></span>
                Create First Assignment
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto border-base-content/25 rounded-lg border">
              <table className="table">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="font-medium text-gray-700">Title & Description</th>
                    <th className="font-medium text-gray-700">Course</th>
                    <th className="font-medium text-gray-700">Type</th>
                    <th className="font-medium text-gray-700">Points</th>
                    <th className="font-medium text-gray-700">Due Date</th>
                    <th className="font-medium text-gray-700">Status</th>
                    <th className="font-medium text-gray-700">Author</th>
                    <th className="font-medium text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                      <td>
                        <div className="font-medium text-gray-800">{a.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-2 mt-1">{a.description}</div>
                      </td>
                      
                      <td>
                        <span className="text-sm text-gray-700">{typeof a.courseId === "string" ? a.courseId : a.courseId?.title ?? "-"}</span>
                      </td>
                      
                      <td>
                        <span className={`badge badge-soft ${a.type === 'QUIZ' ? 'badge-primary' : a.type === 'ESSAY' ? 'badge-success' : a.type === 'PROJECT' ? 'badge-warning' : 'badge-info'} text-xs`}>
                          {a.type}
                        </span>
                      </td>
                      
                      <td>
                        <div className="text-sm font-medium text-gray-800">{a.totalPoints ?? "-"}</div>
                        {a.passingScore && (
                          <div className="text-xs text-gray-500">Pass: {a.passingScore}%</div>
                        )}
                      </td>
                      
                      <td>
                        {a.dueDate ? (
                          <>
                            <div className="text-sm text-gray-700">{new Date(a.dueDate).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{new Date(a.dueDate).toLocaleTimeString()}</div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">No due date</span>
                        )}
                      </td>
                      
                      <td>
                        <span className={`badge ${a.status === 'PUBLISHED' ? 'badge-success' : a.status === 'DRAFT' ? 'badge-warning' : 'badge-error'} text-xs`}>
                          {a.status ?? "N/A"}
                        </span>
                      </td>
                      
                      <td>
                        {a.createdBy ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {(a.createdBy.firstName?.[0] || '') + (a.createdBy.lastName?.[0] || '')}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm text-gray-800">{a.createdBy.firstName ?? ""} {a.createdBy.lastName ?? ""}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => openEdit(a._id)}
                            className="btn btn-circle btn-text btn-sm hover:bg-blue-50 hover:text-blue-600"
                            aria-label="Edit assignment"
                          >
                            <span className="icon-[tabler--pencil] size-4"></span>
                          </button>

                          {/* Publish Button */}
                          {a.status !== "PUBLISHED" ? (
                            <button
                              onClick={() => publishAssignment(a._id)}
                              disabled={publishing[a._id]}
                              className="btn btn-circle btn-text btn-sm hover:bg-amber-50 hover:text-amber-600"
                              aria-label="Publish assignment"
                            >
                              {publishing[a._id] ? (
                                <span className="icon-[tabler--loader] size-4 animate-spin"></span>
                              ) : (
                                <span className="icon-[tabler--send] size-4"></span>
                              )}
                            </button>
                          ) : (
                            <span className="badge badge-success text-xs px-3 py-1">Published</span>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteAssignment(a._id)}
                            disabled={Boolean(deletingId === a._id)}
                            className="btn btn-circle btn-text btn-sm hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete assignment"
                          >
                            {deletingId === a._id ? (
                              <span className="icon-[tabler--loader] size-4 animate-spin"></span>
                            ) : (
                              <span className="icon-[tabler--trash] size-4"></span>
                            )}
                          </button>

                          {/* More Options Button */}
                          <button className="btn btn-circle btn-text btn-sm hover:bg-gray-100">
                            <span className="icon-[tabler--dots-vertical] size-4"></span>
                          </button>
                        </div>

                        {/* Status Messages */}
                        <div className="mt-2 text-right">
                          {publishError[a._id] && (
                            <div className="text-xs text-red-600">{publishError[a._id]}</div>
                          )}
                          {publishSuccess[a._id] && (
                            <div className="text-xs text-green-600">{publishSuccess[a._id]}</div>
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
                    Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> - 
                    <span className="font-medium"> {Math.min(page * limit, total)} </span>
                    of <span className="font-medium">{total}</span> assignments
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
      
      {/* ================= MODAL FOR CREATE ASSIGNMENT ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={closeAllModals}
          />
          
          {/* Modal Content */}
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Create New Assignment</h3>
                <button
                  onClick={closeAllModals}
                  className="btn btn-circle btn-text btn-sm"
                >
                  <span className="icon-[tabler--x] size-5"></span>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Messages */}
                {(createError || editError) && (
                  <div className="alert alert-error mb-4">
                    <span className="icon-[tabler--alert-circle] size-5"></span>
                    {createError || editError}
                  </div>
                )}
                
                {createSuccess && (
                  <div className="alert alert-success mb-4">
                    <span className="icon-[tabler--check] size-5"></span>
                    {createSuccess}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleCreateAssignment} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course <span className="text-red-500">*</span></label>
                      <select 
                        required 
                        value={form.courseId} 
                        onChange={(e) => updateForm("courseId", e.target.value)} 
                        className="select w-full"
                      >
                        <option value="">Select course</option>
                        {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                      <input 
                        required 
                        value={form.title} 
                        onChange={(e) => updateForm("title", e.target.value)} 
                        placeholder="Assignment title" 
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select 
                        value={form.type} 
                        onChange={(e) => updateForm("type", e.target.value)} 
                        className="select w-full"
                      >
                        <option value="QUIZ">QUIZ</option>
                        <option value="ESSAY">ESSAY</option>
                        <option value="PROJECT">PROJECT</option>
                        <option value="CODING">CODING</option>
                        <option value="FILE_UPLOAD">FILE_UPLOAD</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                    <textarea 
                      required 
                      value={form.description} 
                      onChange={(e) => updateForm("description", e.target.value)} 
                      rows={3} 
                      placeholder="Brief description / instructions" 
                      className="textarea w-full"
                    />
                  </div>

                  {/* Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Points</label>
                      <input 
                        type="number" 
                        min={0} 
                        value={form.totalPoints} 
                        onChange={(e) => updateForm("totalPoints", Number(e.target.value || 0))} 
                        className="input w-full" 
                        placeholder="e.g., 100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
                      <input 
                        type="number" 
                        min={0} 
                        max={100} 
                        value={form.passingScore} 
                        onChange={(e) => updateForm("passingScore", Number(e.target.value || 0))} 
                        className="input w-full" 
                        placeholder="e.g., 60"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input 
                        type="datetime-local" 
                        value={form.dueDate} 
                        onChange={(e) => updateForm("dueDate", e.target.value)} 
                        className="input w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (seconds)</label>
                      <input 
                        type="number" 
                        min={0} 
                        value={form.timeLimit} 
                        onChange={(e) => updateForm("timeLimit", Number(e.target.value || 0))} 
                        className="input w-full" 
                        placeholder="e.g., 3600"
                      />
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Advanced Settings</h4>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={form.allowLateSubmission} 
                          onChange={(e) => updateForm("allowLateSubmission", e.target.checked)} 
                          className="checkbox"
                        />
                        <span className="text-sm text-gray-700">Allow late submission</span>
                      </label>

                      {form.allowLateSubmission && (
                        <div className="w-32">
                          <input 
                            type="number" 
                            min={0} 
                            max={100} 
                            value={form.latePenalty} 
                            onChange={(e) => updateForm("latePenalty", Number(e.target.value || 0))} 
                            className="input w-full" 
                            placeholder="Late penalty %"
                          />
                        </div>
                      )}

                      <div className="w-32">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Max Attempts</label>
                        <input 
                          type="number" 
                          min={1} 
                          value={form.maxAttempts} 
                          onChange={(e) => updateForm("maxAttempts", Number(e.target.value || 1))} 
                          className="input w-full" 
                          placeholder="e.g., 3"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Questions Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Questions</h4>
                        <p className="text-sm text-gray-500">Add questions to this assignment (optional)</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={addQuestion} 
                        className="btn btn-soft btn-primary"
                      >
                        <span className="icon-[tabler--plus] size-4 mr-2"></span>
                        Add Question
                      </button>
                    </div>

                    {questions.length === 0 && (
                      <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <span className="icon-[tabler--help] size-12 text-gray-400 mb-3 block mx-auto"></span>
                        <p className="text-gray-500">No questions added yet</p>
                        <p className="text-sm text-gray-400 mt-1">Add questions or save as standalone assignment</p>
                      </div>
                    )}

                    {/* Questions List */}
                    <div className="space-y-4">
                      {questions.map((q, qi) => (
                        <div key={q._localId ?? qi} className="card border border-gray-200">
                          <div className="card-header bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-700">Question {qi + 1}</span>
                              <span className="badge badge-soft badge-primary text-xs">{q.type?.replace('_', ' ') || 'Multiple Choice'}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeQuestion(qi)} 
                              className="btn btn-text btn-sm text-red-600 hover:text-red-700"
                            >
                              <span className="icon-[tabler--trash] size-4"></span>
                            </button>
                          </div>
                          
                          <div className="card-body">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                                <input 
                                  value={q.question} 
                                  onChange={(e) => updateQuestion(qi, { question: e.target.value })} 
                                  placeholder={`Enter question ${qi + 1}`} 
                                  className="input w-full"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                  <select 
                                    value={q.type} 
                                    onChange={(e) => updateQuestion(qi, { type: e.target.value as any })} 
                                    className="select w-full"
                                  >
                                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                    <option value="TRUE_FALSE">True/False</option>
                                    <option value="SHORT_ANSWER">Short Answer</option>
                                    <option value="ESSAY">Essay</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                                  <input 
                                    type="number" 
                                    min={0} 
                                    value={q.points} 
                                    onChange={(e) => updateQuestion(qi, { points: Number(e.target.value || 0) })} 
                                    className="input w-full" 
                                    placeholder="Points"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                  <input 
                                    type="number" 
                                    min={0} 
                                    value={q.order} 
                                    onChange={(e) => updateQuestion(qi, { order: Number(e.target.value || 0) })} 
                                    className="input w-full" 
                                    placeholder="Order"
                                  />
                                </div>
                              </div>

                              {/* Multiple Choice Options */}
                              {q.type === "MULTIPLE_CHOICE" && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-sm font-semibold text-blue-700">Multiple Choice Options</h5>
                                    <button 
                                      type="button" 
                                      onClick={() => addOptionToQuestion(qi)} 
                                      className="btn btn-text btn-sm text-blue-600"
                                    >
                                      <span className="icon-[tabler--plus] size-4 mr-1"></span>
                                      Add Option
                                    </button>
                                  </div>
                                  
                                  {(q.options ?? []).map((opt, oi) => (
                                    <div key={oi} className="flex items-center gap-3 mb-2">
                                      <span className="text-xs text-gray-500 w-6">{oi + 1}.</span>
                                      <input 
                                        value={opt} 
                                        onChange={(e) => updateOption(qi, oi, e.target.value)} 
                                        className="input flex-1" 
                                        placeholder={`Option ${oi + 1}`}
                                      />
                                      <button 
                                        type="button" 
                                        onClick={() => removeOption(qi, oi)} 
                                        className="btn btn-text btn-sm text-red-600"
                                      >
                                        <span className="icon-[tabler--trash] size-4"></span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t">
                    <button 
                      type="button" 
                      onClick={closeAllModals} 
                      className="btn btn-text"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={saving} 
                      className="btn btn-primary min-w-[140px]"
                    >
                      {saving ? (
                        <>
                          <span className="icon-[tabler--loader] size-5 animate-spin mr-2"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <span className="icon-[tabler--check] size-5 mr-2"></span>
                          Create Assignment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL FOR EDIT ASSIGNMENT ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={closeAllModals}
          />
          
          {/* Modal Content */}
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Edit Assignment</h3>
                <button
                  onClick={closeAllModals}
                  className="btn btn-circle btn-text btn-sm"
                >
                  <span className="icon-[tabler--x] size-5"></span>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Messages */}
                {(createError || editError) && (
                  <div className="alert alert-error mb-4">
                    <span className="icon-[tabler--alert-circle] size-5"></span>
                    {createError || editError}
                  </div>
                )}
                
                {createSuccess && (
                  <div className="alert alert-success mb-4">
                    <span className="icon-[tabler--check] size-5"></span>
                    {createSuccess}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleUpdateAssignment} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course <span className="text-red-500">*</span></label>
                      <select 
                        required 
                        value={form.courseId} 
                        onChange={(e) => updateForm("courseId", e.target.value)} 
                        className="select w-full"
                      >
                        <option value="">Select course</option>
                        {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                      <input 
                        required 
                        value={form.title} 
                        onChange={(e) => updateForm("title", e.target.value)} 
                        placeholder="Assignment title" 
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select 
                        value={form.type} 
                        onChange={(e) => updateForm("type", e.target.value)} 
                        className="select w-full"
                      >
                        <option value="QUIZ">QUIZ</option>
                        <option value="ESSAY">ESSAY</option>
                        <option value="PROJECT">PROJECT</option>
                        <option value="CODING">CODING</option>
                        <option value="FILE_UPLOAD">FILE_UPLOAD</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                    <textarea 
                      required 
                      value={form.description} 
                      onChange={(e) => updateForm("description", e.target.value)} 
                      rows={3} 
                      placeholder="Brief description / instructions" 
                      className="textarea w-full"
                    />
                  </div>

                  {/* Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Points</label>
                      <input 
                        type="number" 
                        min={0} 
                        value={form.totalPoints} 
                        onChange={(e) => updateForm("totalPoints", Number(e.target.value || 0))} 
                        className="input w-full" 
                        placeholder="e.g., 100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
                      <input 
                        type="number" 
                        min={0} 
                        max={100} 
                        value={form.passingScore} 
                        onChange={(e) => updateForm("passingScore", Number(e.target.value || 0))} 
                        className="input w-full" 
                        placeholder="e.g., 60"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input 
                        type="datetime-local" 
                        value={form.dueDate} 
                        onChange={(e) => updateForm("dueDate", e.target.value)} 
                        className="input w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (seconds)</label>
                      <input 
                        type="number" 
                        min={0} 
                        value={form.timeLimit} 
                        onChange={(e) => updateForm("timeLimit", Number(e.target.value || 0))} 
                        className="input w-full" 
                        placeholder="e.g., 3600"
                      />
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Advanced Settings</h4>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={form.allowLateSubmission} 
                          onChange={(e) => updateForm("allowLateSubmission", e.target.checked)} 
                          className="checkbox"
                        />
                        <span className="text-sm text-gray-700">Allow late submission</span>
                      </label>

                      {form.allowLateSubmission && (
                        <div className="w-32">
                          <input 
                            type="number" 
                            min={0} 
                            max={100} 
                            value={form.latePenalty} 
                            onChange={(e) => updateForm("latePenalty", Number(e.target.value || 0))} 
                            className="input w-full" 
                            placeholder="Late penalty %"
                          />
                        </div>
                      )}

                      <div className="w-32">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Max Attempts</label>
                        <input 
                          type="number" 
                          min={1} 
                          value={form.maxAttempts} 
                          onChange={(e) => updateForm("maxAttempts", Number(e.target.value || 1))} 
                          className="input w-full" 
                          placeholder="e.g., 3"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Questions Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Questions</h4>
                        <p className="text-sm text-gray-500">Add questions to this assignment (optional)</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={addQuestion} 
                        className="btn btn-soft btn-primary"
                      >
                        <span className="icon-[tabler--plus] size-4 mr-2"></span>
                        Add Question
                      </button>
                    </div>

                    {questions.length === 0 && (
                      <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <span className="icon-[tabler--help] size-12 text-gray-400 mb-3 block mx-auto"></span>
                        <p className="text-gray-500">No questions added yet</p>
                        <p className="text-sm text-gray-400 mt-1">Add questions or save as standalone assignment</p>
                      </div>
                    )}

                    {/* Questions List */}
                    <div className="space-y-4">
                      {questions.map((q, qi) => (
                        <div key={q._localId ?? qi} className="card border border-gray-200">
                          <div className="card-header bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-700">Question {qi + 1}</span>
                              <span className="badge badge-soft badge-primary text-xs">{q.type?.replace('_', ' ') || 'Multiple Choice'}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeQuestion(qi)} 
                              className="btn btn-text btn-sm text-red-600 hover:text-red-700"
                            >
                              <span className="icon-[tabler--trash] size-4"></span>
                            </button>
                          </div>
                          
                          <div className="card-body">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                                <input 
                                  value={q.question} 
                                  onChange={(e) => updateQuestion(qi, { question: e.target.value })} 
                                  placeholder={`Enter question ${qi + 1}`} 
                                  className="input w-full"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                  <select 
                                    value={q.type} 
                                    onChange={(e) => updateQuestion(qi, { type: e.target.value as any })} 
                                    className="select w-full"
                                  >
                                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                    <option value="TRUE_FALSE">True/False</option>
                                    <option value="SHORT_ANSWER">Short Answer</option>
                                    <option value="ESSAY">Essay</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                                  <input 
                                    type="number" 
                                    min={0} 
                                    value={q.points} 
                                    onChange={(e) => updateQuestion(qi, { points: Number(e.target.value || 0) })} 
                                    className="input w-full" 
                                    placeholder="Points"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                  <input 
                                    type="number" 
                                    min={0} 
                                    value={q.order} 
                                    onChange={(e) => updateQuestion(qi, { order: Number(e.target.value || 0) })} 
                                    className="input w-full" 
                                    placeholder="Order"
                                  />
                                </div>
                              </div>

                              {/* Multiple Choice Options */}
                              {q.type === "MULTIPLE_CHOICE" && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-sm font-semibold text-blue-700">Multiple Choice Options</h5>
                                    <button 
                                      type="button" 
                                      onClick={() => addOptionToQuestion(qi)} 
                                      className="btn btn-text btn-sm text-blue-600"
                                    >
                                      <span className="icon-[tabler--plus] size-4 mr-1"></span>
                                      Add Option
                                    </button>
                                  </div>
                                  
                                  {(q.options ?? []).map((opt, oi) => (
                                    <div key={oi} className="flex items-center gap-3 mb-2">
                                      <span className="text-xs text-gray-500 w-6">{oi + 1}.</span>
                                      <input 
                                        value={opt} 
                                        onChange={(e) => updateOption(qi, oi, e.target.value)} 
                                        className="input flex-1" 
                                        placeholder={`Option ${oi + 1}`}
                                      />
                                      <button 
                                        type="button" 
                                        onClick={() => removeOption(qi, oi)} 
                                        className="btn btn-text btn-sm text-red-600"
                                      >
                                        <span className="icon-[tabler--trash] size-4"></span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t">
                    <button 
                      type="button" 
                      onClick={closeAllModals} 
                      className="btn btn-text"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={saving} 
                      className="btn btn-primary min-w-[140px]"
                    >
                      {saving ? (
                        <>
                          <span className="icon-[tabler--loader] size-5 animate-spin mr-2"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <span className="icon-[tabler--check] size-5 mr-2"></span>
                          Update Assignment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}