"use client";
import React, { useEffect, useState } from "react";

type Course = {
  _id?: string;
  id?: string | number;
  title: string;
  description: string;
  shortDescription?: string;
  category?: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  price?: number;
  capacity?: number;
  tags?: string[]; // keep canonical type as array
  createdAt?: string;
  [key: string]: any;
};

export default function CoursesTable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // Editor state
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorSuccess, setEditorSuccess] = useState<string | null>(null);
  const [editorCourse, setEditorCourse] = useState<Partial<Course> | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = async (signal?: AbortSignal) => {
    setLoadingCourses(true);
    setCoursesError(null);
    try {
      const res = await fetch("/api/courses", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || "Failed to fetch courses");
      }

      // API returns: { success, message, data:[...] }
      setCourses(Array.isArray(json.data) ? json.data : []);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setCoursesError(err.message || "Something went wrong fetching courses");
      }
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    fetchCourses(ac.signal);
    return () => ac.abort();
  }, []);

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  // helper to normalize tags from unknown input
  const normalizeTags = (value: unknown): string[] | undefined => {
    if (Array.isArray(value)) {
      // ensure array elements are strings
      return (value as any[]).map((v) => String(v).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      return value.split(",").map((t) => t.trim()).filter(Boolean);
    }
    return undefined;
  };

  // Fetch single course by id and open editor
  async function openEditor(courseId: string) {
    setEditorError(null);
    setEditorSuccess(null);
    setEditorLoading(true);
    setEditingCourseId(courseId);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || `Failed to fetch course ${courseId}`);
      }
      // server returns course object (see backend GET)
      const course = json.data || json;
      setEditorCourse({
        _id: course._id ?? course.id,
        title: course.title,
        description: course.description,
        shortDescription: course.shortDescription,
        category: course.category,
        level: course.level,
        price: course.price,
        capacity: course.capacity,
        tags: Array.isArray(course.tags) ? course.tags : normalizeTags(course.tags),
      });
    } catch (e: any) {
      console.error("openEditor error", e);
      setEditorError(e.message || "Failed to load course");
      setEditingCourseId(null);
      setEditorCourse(null);
    } finally {
      setEditorLoading(false);
    }
  }

  function closeEditor() {
    setEditingCourseId(null);
    setEditorCourse(null);
    setEditorError(null);
    setEditorSuccess(null);
  }

  // Update course via PUT
  async function handleSaveCourse() {
    if (!editingCourseId || !editorCourse) return;
    setEditorError(null);
    setEditorSuccess(null);
    setEditorLoading(true);
    try {
      // Build payload only with editable fields
      const payload: any = {
        title: editorCourse.title,
        description: editorCourse.description,
        shortDescription: editorCourse.shortDescription,
        category: editorCourse.category,
        level: editorCourse.level,
        price: editorCourse.price,
        capacity: editorCourse.capacity,
        // normalize tags safely from unknown input
        tags: normalizeTags(editorCourse.tags),
      };

      // Remove undefined keys
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      const res = await fetch(`/api/courses/${editingCourseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Failed to update course (${res.status})`);
      }

      // Update local courses list with the updated course if returned
      const updatedCourse = json.data || json;
      if (updatedCourse) {
        setCourses((prev) =>
          prev.map((c) => {
            const id = c._id ?? c.id;
            if (String(id) === String(editingCourseId)) {
              return { ...c, ...updatedCourse };
            }
            return c;
          })
        );
      } else {
        // fallback: refetch entire list
        await fetchCourses();
      }

      setEditorSuccess("Course updated successfully");
      // keep editor open so user can see success; optionally close automatically
      setTimeout(() => setEditorSuccess(null), 3000);
    } catch (e: any) {
      console.error("handleSaveCourse error", e);
      setEditorError(e.message || "Failed to update course");
    } finally {
      setEditorLoading(false);
    }
  }

  // Delete course via DELETE
  async function handleDeleteCourse(courseId: string) {
    const ok = window.confirm("Delete this course? This action cannot be undone.");
    if (!ok) return;

    setDeleting(true);
    setCoursesError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Failed to delete course (${res.status})`);
      }

      // remove from local list
      setCourses((prev) =>
        prev.filter((c) => {
          const id = c._id ?? c.id;
          return String(id) !== String(courseId);
        })
      );

      // if we were editing this course, close editor
      if (editingCourseId === courseId) closeEditor();
    } catch (e: any) {
      console.error("handleDeleteCourse error", e);
      setCoursesError(e.message || "Failed to delete course");
    } finally {
      setDeleting(false);
    }
  }

  // Editor field change helper
  // Accept any value because UI may pass string or array depending on input
  function updateEditorField<K extends keyof Course>(key: K, value: any) {
    setEditorCourse((prev) => (prev ? { ...prev, [key]: value } : { [key]: value } as any));
  }
  return (
    <div className="bg-base-100 flex flex-col items-center justify-start p-6 overflow-auto">
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-base-content text-2xl font-semibold">Courses</h3>
            <p className="text-base-content/80">View all available courses</p>
          </div>
          <div>
            <button className="btn btn-sm" onClick={() => fetchCourses()} disabled={loadingCourses}>
              Refresh
            </button>
          </div>
        </div>

        {/* Courses Table */}
        <div className="mt-4">
          {loadingCourses ? (
            <div className="p-4">Loading courses...</div>
          ) : coursesError ? (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700">
              {coursesError}
            </div>
          ) : courses.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No courses found.
            </div>
          ) : (
            <div className="overflow-x-auto border rounded">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="text-left">Title</th>
                    <th className="text-left">Category</th>
                    <th className="text-left">Level</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Capacity</th>
                    <th className="text-left">Tags</th>
                    <th className="text-left">Created</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c, idx) => {
                    const id = c._id ?? c.id ?? idx;
                    return (
                      <tr key={id}>
                        <td>{c.title}</td>
                        <td>{c.category ?? "-"}</td>
                        <td>{c.level ?? "-"}</td>
                        <td className="text-right">{typeof c.price === "number" ? `₹${c.price}` : "-"}</td>
                        <td className="text-right">{c.capacity ?? "-"}</td>
                        <td>{Array.isArray(c.tags) ? c.tags.join(", ") : (c.tags ?? "-")}</td>
                        <td>{formatDate(c.createdAt)}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-ghost mr-2"
                            onClick={() => openEditor(String(id))}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-ghost text-error"
                            onClick={() => handleDeleteCourse(String(id))}
                            disabled={deleting}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inline Editor */}
        {editingCourseId && (
          <div className="mt-6 p-4 border rounded bg-white shadow">
            <div className="flex items-start justify-between">
              <h4 className="text-lg font-medium">Edit Course</h4>
              <div className="flex items-center gap-2">
                <button className="btn btn-sm" onClick={closeEditor} disabled={editorLoading}>
                  Close
                </button>
              </div>
            </div>

            {editorLoading ? (
              <div className="mt-4">Loading course...</div>
            ) : editorError ? (
              <div className="mt-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">{editorError}</div>
            ) : editorCourse ? (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Title</label>
                  <input
                    value={editorCourse.title || ""}
                    onChange={(e) => updateEditorField("title", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <input
                    value={editorCourse.category || ""}
                    onChange={(e) => updateEditorField("category", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Description</label>
                  <textarea
                    value={editorCourse.description || ""}
                    onChange={(e) => updateEditorField("description", e.target.value)}
                    rows={4}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Short Description</label>
                  <input
                    value={editorCourse.shortDescription || ""}
                    onChange={(e) => updateEditorField("shortDescription", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Level</label>
                  <select
                    value={editorCourse.level || ""}
                    onChange={(e) => updateEditorField("level", e.target.value as any)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">-- Select --</option>
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Price</label>
                  <input
                    type="number"
                    value={editorCourse.price ?? ""}
                    onChange={(e) => updateEditorField("price", e.target.value === "" ? undefined : Number(e.target.value))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Capacity</label>
                  <input
                    type="number"
                    value={editorCourse.capacity ?? ""}
                    onChange={(e) => updateEditorField("capacity", e.target.value === "" ? undefined : Number(e.target.value))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Tags (comma separated)</label>
                  <input
                    value={Array.isArray(editorCourse.tags) ? editorCourse.tags.join(", ") : (editorCourse.tags as any) || ""}
                    onChange={(e) => updateEditorField("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3 mt-2">
                  <button onClick={handleSaveCourse} disabled={editorLoading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                    {editorLoading ? "Saving..." : "Save changes"}
                  </button>

                  <button onClick={() => { if (editorCourse && editorCourse._id) handleDeleteCourse(String(editorCourse._id)); }} disabled={deleting} className="px-4 py-2 border rounded text-red-600">
                    {deleting ? "Deleting..." : "Delete course"}
                  </button>

                  {editorSuccess && <div className="text-sm text-green-600">{editorSuccess}</div>}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
