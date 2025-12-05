// src/components/CourseModulesFrontend.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";

type Course = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  modules?: Module[];
  teacherId?: any;
  category?: string;
};

type Module = {
  _id?: string;
  title: string;
  description?: string;
  order: number;
  lessons?: any[];
};

/* ---------------------------
   Reusable Modal Component
   - Focus trap
   - ESC to close
   - Backdrop click
   - Smooth animation
   - aria-modal, role="dialog"
   --------------------------- */
function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Save previously focused element so we can restore on close
    lastActiveRef.current = document.activeElement as HTMLElement | null;

    // Put focus on the dialog container (or first focusable)
    const el = dialogRef.current!;
    const focusable = el.querySelector<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    (focusable || el).focus();

    // Prevent body scroll while modal open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      // restore focus
      lastActiveRef.current?.focus();
    };
  }, [open]);

  // keyboard handlers (ESC + Tab trap)
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        // focus trap
        const container = dialogRef.current;
        if (!container) return;
        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null); // visible
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      aria-hidden={!open}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onMouseDown={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        tabIndex={-1}
        className={`relative z-10 transform transition-all duration-200 ease-out
          ${size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-3xl" : "max-w-xl"}
          w-full mx-4`}
      >
        <div
          // modal panel with subtle scale/opacity animation
          className="bg-white rounded-2xl shadow-2xl p-5 ring-1 ring-black/5 transform scale-100 opacity-100 transition-transform transition-opacity"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              aria-label="Close dialog"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 rounded px-2 py-1"
            >
              ✕
            </button>
          </div>

          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------
   Main Component
   --------------------------- */
export default function CourseModulesFrontend() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const activeCourse = courses.find((c) => c._id === activeCourseId) ?? courses[0] ?? null;

  // modal + form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCourses() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/courses", { credentials: "include" });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `${res.status}`);
      }
      const data = await res.json();
      const allCourses: Course[] = Array.isArray(data) ? data : data?.data || [];

      // same teacher filtering you used before
      const s = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const user = s ? JSON.parse(s) : null;
      const filtered = user
        ? allCourses.filter((course) => {
            const tid = course.teacherId
              ? typeof course.teacherId === "string"
                ? course.teacherId
                : (course.teacherId as any)._id ?? String((course.teacherId as any))
              : "";
            return String(tid) === String(user._id);
          })
        : allCourses;

      setCourses(filtered);
      if (!activeCourseId && filtered.length > 0) setActiveCourseId(filtered[0]._id);
    } catch (e: any) {
      setError(e.message || "Failed to load courses");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // helper: returns stored modules or []
  const modules = activeCourse?.modules ?? [];

  // utils to find actual index in stored array (robust)
  function getModuleActualIndex(moduleItem: Module, fallbackIndex: number) {
    if (!activeCourse?.modules) return fallbackIndex;
    if (moduleItem._id) {
      const found = activeCourse.modules.findIndex((m) => m._id === moduleItem._id);
      if (found !== -1) return found;
    }
    const idxByRef = activeCourse.modules.indexOf(moduleItem as any);
    if (idxByRef !== -1) return idxByRef;
    const idxByProps = activeCourse.modules.findIndex(
      (m) => m.title === moduleItem.title && (m.order ?? 0) === (moduleItem.order ?? 0)
    );
    return idxByProps !== -1 ? idxByProps : fallbackIndex;
  }

  // open modal for add
  function openAddModal() {
    setEditingModuleIndex(null);
    setTitle("");
    setDescription("");
    setOrder(1);
    setError(null);
    setIsModalOpen(true);
  }

  // open modal for edit (by display index)
  function openEditModalFromIndex(displayIndex: number) {
    if (!activeCourse) return;
    const m = (activeCourse.modules ?? [])[displayIndex];
    if (!m) return;
    const actual = getModuleActualIndex(m, displayIndex);
    const mod = activeCourse.modules?.[actual];
    if (!mod) return;
    setEditingModuleIndex(actual);
    setTitle(mod.title || "");
    setDescription(mod.description || "");
    setOrder(mod.order ?? actual + 1);
    setError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingModuleIndex(null);
    setError(null);
  }

  async function handleSaveModule() {
    if (!activeCourse) return;
    if (!title.trim()) {
      setError("Module title required");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = { title: title.trim(), description: description.trim() || undefined, order: Number(order) };

    try {
      if (editingModuleIndex !== null) {
        const res = await fetch(`/api/courses/${activeCourse._id}/modules/${editingModuleIndex}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: res.statusText }));
          throw new Error(err.message || "Failed to update module");
        }
        const json = await res.json().catch(() => null);
        const newModules = json?.data?.modules || json?.modules;
        if (newModules) {
          setCourses((prev) => prev.map((c) => (c._id === activeCourse._id ? { ...c, modules: newModules } : c)));
        } else {
          await fetchSingleCourse(activeCourse._id);
        }
      } else {
        const res = await fetch(`/api/courses/${activeCourse._id}/modules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: res.statusText }));
          throw new Error(err.message || "Failed to add module");
        }
        const json = await res.json().catch(() => null);
        const newModules = json?.data?.modules || json?.modules;
        if (newModules) {
          setCourses((prev) => prev.map((c) => (c._id === activeCourse._id ? { ...c, modules: newModules } : c)));
        } else {
          await fetchSingleCourse(activeCourse._id);
        }
      }

      closeModal();
    } catch (e: any) {
      setError(e.message || "Save failed");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteModule(displayIndex: number) {
    if (!activeCourse) return;
    const mod = (activeCourse.modules ?? [])[displayIndex];
    const actual = getModuleActualIndex(mod, displayIndex);
    const confirmed = window.confirm("Delete module? This cannot be undone.");
    if (!confirmed) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${activeCourse._id}/modules/${actual}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || "Failed to delete module");
      }
      const json = await res.json().catch(() => null);
      const newModules = json?.data?.modules || json?.modules;
      if (newModules) {
        setCourses((prev) => prev.map((c) => (c._id === activeCourse._id ? { ...c, modules: newModules } : c)));
      } else {
        await fetchSingleCourse(activeCourse._id);
      }
    } catch (e: any) {
      setError(e.message || "Delete failed");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  // fallback fetch for a single course
  async function fetchSingleCourse(courseId: string) {
    try {
      const res = await fetch(`/api/courses/${courseId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch course");
      const data = await res.json();
      const payload = data?.data || data;
      setCourses((prev) => prev.map((c) => (c._id === courseId ? payload : c)));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="w-full mx-auto">
      <div className="bg-white rounded-md shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Course & Module Manager</h2>
            <p className="text-xs text-gray-500">Tabs show courses; add modules using the button</p>
          </div>

          <div>
            <button
              onClick={openAddModal}
              disabled={!activeCourse}
              className="btn btn-soft btn-primary waves waves-primary"
            >
              Add New Module
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : courses.length === 0 ? (
            <div className="text-sm text-gray-500">No courses</div>
          ) : (
            courses.map((c) => (
              <button
                key={c._id}
                onClick={() => setActiveCourseId(c._id)}
                className={`px-3 py-1 text-sm rounded border ${activeCourseId === c._id ? "btn btn-soft btn-primary waves waves-primary" : "btn btn-primary waves waves-primary"}`}
              >
                {c.title}
              </button>
            ))
          )}
        </div>

        {/* Table */}
        <div className="border-base-content/25 w-full rounded-lg border">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr >
                <th >s.no</th>
                <th >TITLE</th>
                <th>Description</th>
                <th >Action</th>
              </tr>
            </thead>
            <tbody>
              {modules.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    No modules for this course.
                  </td>
                </tr>
              ) : (
                modules
                  .slice()
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((m, idx) => (
                    <tr key={m._id ?? idx} className="odd:bg-white even:bg-gray-50">
                      <td >{idx + 1}</td>
                      <td >{m.title}</td>
                      <td >{m.description ?? "-"}</td>
                      <td >
                        <div className="flex gap-2">
                          <button
                           
                            onClick={() => openEditModalFromIndex(idx)}
                            disabled={saving}
                          >
                            <span className="icon-[tabler--pencil] size-5"></span>
                          </button>
                          <button
                           
                            onClick={() => handleDeleteModule(idx)}
                            disabled={saving}
                          >
                            <span className="icon-[tabler--trash] size-5"></span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>

      {/* Modal usage */}
            <Modal open={isModalOpen} onClose={closeModal} 
             title={editingModuleIndex === null ? "Add New Module" : "Edit Module"} 
             size="md">
        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <span className="icon-[tabler--alert-circle] size-5 inline mr-2"></span>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input w-full focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Enter module title"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea w-full focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows={4}
              placeholder="Brief description of what this module covers"
            />
            <p className="text-xs text-gray-500 mt-2">
              This helps students understand what they'll learn
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Position
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="input w-full text-center focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="icon-[tabler--sort-ascending] size-5"></span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Lower numbers appear first
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="btn btn-text"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModule}
                disabled={saving || !title.trim()}
                className="btn btn-primary min-w-[100px]"
              >
                {saving ? (
                  <>
                    <span className="icon-[tabler--loader] size-5 animate-spin mr-2"></span>
                    Saving...
                  </>
                ) : editingModuleIndex === null ? (
                  <>
                    <span className="icon-[tabler--plus] size-5 mr-2"></span>
                    Add Module
                  </>
                ) : (
                  <>
                    <span className="icon-[tabler--check] size-5 mr-2"></span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>


    </div>
  );
}
