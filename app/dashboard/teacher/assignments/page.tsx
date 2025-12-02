


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

  // create form state
  const [showCreate, setShowCreate] = useState<boolean>(false);
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

  // ----- NEW: edit/delete state -----
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // ----------------------------------

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

  // ---------- Create form helpers (same as before) ----------
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
      fetchAssignments();
      setTimeout(() => setCreateSuccess(null), 3000);
      setShowCreate(false);
    } catch (err: any) {
      console.error("handleCreateAssignment error", err);
      setCreateError(err?.message ?? "Failed to create assignment");
    } finally {
      setCreating(false);
      setSaving(false);
    }
  }

  // ---------- Publish flow (NEW) ----------
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

  // ---------- NEW: Fetch single assignment details (for editing) ----------
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

  // ---------- NEW: open edit modal and prefill form ---------
  async function openEdit(assignmentId: string) {
    setEditingAssignmentId(assignmentId);
    setEditing(true);
    setShowCreate(true); // ensure the form panel opens for edit
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
  }

  // ---------- NEW: Update assignment via PUT /api/assignments/:id ----------
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
      setTimeout(() => setCreateSuccess(null), 3000);
    } catch (err: any) {
      console.error("handleUpdateAssignment error", err);
      setEditError(err?.message ?? "Failed to update assignment");
    } finally {
      setCreating(false);
      setSaving(false);
    }
  }

  // ---------- NEW: Delete assignment via DELETE /api/assignments/:id ----------
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Assignments</h2>
        <div className="flex items-center gap-3">
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setShowCreate((s) => !s)}
          >
            {showCreate ? "Close" : "Create Assignment"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <select value={filterCourseId} onChange={(e) => { setFilterCourseId(e.target.value); setPage(1); }} className="border rounded px-3 py-2">
          <option value="">All courses</option>
          {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>

        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="border rounded px-3 py-2">
          <option value="">All types</option>
          <option value="QUIZ">QUIZ</option>
          <option value="ESSAY">ESSAY</option>
          <option value="PROJECT">PROJECT</option>
          <option value="CODING">CODING</option>
          <option value="FILE_UPLOAD">FILE_UPLOAD</option>
        </select>

        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="border rounded px-3 py-2">
          <option value="">Any status</option>
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>

        <div className="flex items-center gap-2">
          <input type="number" min={1} value={limit} onChange={(e) => { setLimit(Number(e.target.value || 10)); setPage(1); }} className="w-24 border rounded px-3 py-2" />
          <button onClick={() => { setPage(1); fetchAssignments(); }} className="px-3 py-2 border rounded">Apply</button>
        </div>
      </div>

      {/* Create / Edit form */}
      {(showCreate || editing) && (
        <div className="mb-6 border rounded p-4 bg-gray-50">
          <h3 className="font-medium mb-3">{editing ? "Edit Assignment" : "New Assignment"}</h3>

          {(createError || editError) && <div className="mb-3 p-2 bg-red-50 text-red-700 border rounded">{createError || editError}</div>}
          {createSuccess && <div className="mb-3 p-2 bg-green-50 text-green-700 border rounded">{createSuccess}</div>}

          <form onSubmit={editing ? handleUpdateAssignment : handleCreateAssignment} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select required value={form.courseId} onChange={(e) => updateForm("courseId", e.target.value)} className="border rounded px-3 py-2">
                <option value="">Select course</option>
                {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>

              <input required value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder="Assignment title" className="border rounded px-3 py-2" />
              <select value={form.type} onChange={(e) => updateForm("type", e.target.value)} className="border rounded px-3 py-2">
                <option value="QUIZ">QUIZ</option>
                <option value="ESSAY">ESSAY</option>
                <option value="PROJECT">PROJECT</option>
                <option value="CODING">CODING</option>
                <option value="FILE_UPLOAD">FILE_UPLOAD</option>
              </select>
            </div>

            <div>
              <textarea required value={form.description} onChange={(e) => updateForm("description", e.target.value)} rows={3} placeholder="Brief description / instructions" className="w-full border rounded px-3 py-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input type="number" min={0} value={form.totalPoints} onChange={(e) => updateForm("totalPoints", Number(e.target.value || 0))} className="border rounded px-3 py-2" placeholder="Total points" />
              <input type="number" min={0} max={100} value={form.passingScore} onChange={(e) => updateForm("passingScore", Number(e.target.value || 0))} className="border rounded px-3 py-2" placeholder="Passing (%)" />
              <input type="datetime-local" value={form.dueDate} onChange={(e) => updateForm("dueDate", e.target.value)} className="border rounded px-3 py-2" />
              <input type="number" min={0} value={form.timeLimit} onChange={(e) => updateForm("timeLimit", Number(e.target.value || 0))} className="border rounded px-3 py-2" placeholder="Time limit (seconds)" />
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={form.allowLateSubmission} onChange={(e) => updateForm("allowLateSubmission", e.target.checked)} />
                <span className="text-sm">Allow late submission</span>
              </label>

              {form.allowLateSubmission && (
                <input type="number" min={0} max={100} value={form.latePenalty} onChange={(e) => updateForm("latePenalty", Number(e.target.value || 0))} className="border rounded px-3 py-2 w-32" placeholder="Late penalty (%)" />
              )}

              <input type="number" min={1} value={form.maxAttempts} onChange={(e) => updateForm("maxAttempts", Number(e.target.value || 1))} className="border rounded px-3 py-2 w-32" placeholder="Max attempts" />
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Questions</h4>
                <button type="button" onClick={addQuestion} className="px-2 py-1 border rounded text-sm">+ Add question</button>
              </div>

              {questions.length === 0 && <div className="text-sm text-gray-500">No questions added (optional).</div>}

              <div className="space-y-3">
                {questions.map((q, qi) => (
                  <div key={q._localId ?? qi} className="p-3 border rounded bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <input value={q.question} onChange={(e) => updateQuestion(qi, { question: e.target.value })} placeholder={`Question ${qi + 1}`} className="w-full border rounded px-2 py-1 mb-2" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <select value={q.type} onChange={(e) => updateQuestion(qi, { type: e.target.value as any })} className="border rounded px-2 py-1">
                            <option value="MULTIPLE_CHOICE">MULTIPLE_CHOICE</option>
                            <option value="TRUE_FALSE">TRUE_FALSE</option>
                            <option value="SHORT_ANSWER">SHORT_ANSWER</option>
                            <option value="ESSAY">ESSAY</option>
                          </select>

                          <input type="number" min={0} value={q.points} onChange={(e) => updateQuestion(qi, { points: Number(e.target.value || 0) })} className="border rounded px-2 py-1" placeholder="Points" />

                          <input type="number" min={0} value={q.order} onChange={(e) => updateQuestion(qi, { order: Number(e.target.value || 0) })} className="border rounded px-2 py-1" placeholder="Order" />
                        </div>

                        {q.type === "MULTIPLE_CHOICE" && (
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium">Options</div>
                              <button type="button" onClick={() => addOptionToQuestion(qi)} className="text-sm underline text-blue-600">Add option</button>
                            </div>
                            {(q.options ?? []).map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <input value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} className="flex-1 border rounded px-2 py-1" />
                                <button type="button" onClick={() => removeOption(qi, oi)} className="text-sm text-red-600">Remove</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-3">
                        <button type="button" onClick={() => removeQuestion(qi)} className="text-sm text-red-600">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded">{saving ? (editing ? "Updating..." : "Creating...") : (editing ? "Update" : "Create")}</button>
              <button type="button" onClick={() => { setShowCreate(false); setEditing(false); setEditingAssignmentId(null); setCreateError(null); setCreateSuccess(null); setEditError(null); }} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments list */}
      <div className="border rounded p-3 bg-white">
        {loadingList ? (
          <div className="text-center py-8">Loading assignments...</div>
        ) : listError ? (
          <div className="text-red-600 py-4">{listError}</div>
        ) : assignments.length === 0 ? (
          <div className="text-sm text-gray-500 py-4">No assignments found.</div>
        ) : (
          <>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="p-2">Title</th>
                  <th className="p-2">Course</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Points</th>
                  <th className="p-2">Due</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Author</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a._id} className="border-t">
                    <td className="p-2 align-top">
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-gray-500">{a.description}</div>
                    </td>
                    <td className="p-2 align-top">{typeof a.courseId === "string" ? a.courseId : a.courseId?.title ?? "-"}</td>
                    <td className="p-2 align-top">{a.type}</td>
                    <td className="p-2 align-top">{a.totalPoints ?? "-"}</td>
                    <td className="p-2 align-top">{a.dueDate ? new Date(a.dueDate).toLocaleString() : "-"}</td>
                    <td className="p-2 align-top">{a.status ?? "N/A"}</td>
                    <td className="p-2 align-top">{a.createdBy ? `${a.createdBy.firstName ?? ""} ${a.createdBy.lastName ?? ""}` : "-"}</td>

                    <td className="p-2 align-top">
                      <div className="flex items-center gap-2">
                        {/* Edit button */}
                        <button
                          onClick={() => openEdit(a._id)}
                          className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                        >
                          Edit
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteAssignment(a._id)}
                          disabled={Boolean(deletingId === a._id)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletingId === a._id ? "Deleting..." : "Delete"}
                        </button>

                        {/* Publish button: only show if not published */}
                        {a.status !== "PUBLISHED" ? (
                          <button
                            onClick={() => publishAssignment(a._id)}
                            disabled={publishing[a._id]}
                            className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 disabled:opacity-50"
                          >
                            {publishing[a._id] ? "Publishing..." : "Publish"}
                          </button>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded bg-green-50 text-green-700">Published</span>
                        )}

                        {/* inline publish feedback */}
                        {publishError[a._id] && <div className="text-xs text-red-600">{publishError[a._id]}</div>}
                        {publishSuccess[a._id] && <div className="text-xs text-green-600">{publishSuccess[a._id]}</div>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">Page {page} / {totalPages} — {total} total</div>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
