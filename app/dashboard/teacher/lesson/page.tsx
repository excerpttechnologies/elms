// "use client";

// import React, { useEffect, useState } from "react";

// type Course = {
//   _id: string;
//   title: string;
//   slug?: string;
//   description?: string;
//   modules?: Module[];
//   teacherId?: any;
// };

// type Module = {
//   _id?: string;
//   title: string;
//   description?: string;
//   order: number;
//   lessons?: Lesson[];
// };

// type Lesson = {
//   _id?: string;
//   title: string;
//   description?: string;
//   content?: string;
//   videoUrl?: string;
//   duration?: number;
//   order?: number;
//   resources?: Resource[];
// };

// type Resource = {
//   title: string;
//   url: string;
//   type: string;
// };

// export default function CourseLesson() {
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [loadingCourses, setLoadingCourses] = useState(false);
//   const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
//   const [selectedModuleDisplayIndex, setSelectedModuleDisplayIndex] = useState<number | null>(null);
//   // actual module index inside course.modules (unsorted stored array)
//   const [selectedModuleActualIndex, setSelectedModuleActualIndex] = useState<number | null>(null);

//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     content: "",
//     videoUrl: "",
//     duration: 0,
//     order: 0,
//   });

//   const [resources, setResources] = useState<Resource[]>([]);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);
//   const [loadingCourseDetails, setLoadingCourseDetails] = useState(false);

//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   async function fetchCourses() {
//     setLoadingCourses(true);
//     setError(null);
//     try {
//       const res = await fetch("/api/courses", { credentials: "include" });
//       if (!res.ok) {
//         const text = await res.text().catch(() => res.statusText);
//         throw new Error(text || `HTTP ${res.status}`);
//       }
//       const data = await res.json();
//       // robustly get list from response
//       const allCourses: Course[] = Array.isArray(data) ? data : data?.data || [];

//       // filter to courses for current teacher in localStorage (matches your other component)
//       const sss = localStorage.getItem("user");
//       const dd = sss ? JSON.parse(sss) : null;
//       const filtered = dd
//         ? allCourses.filter((course: Course) => {
//             const tid = course.teacherId
//               ? typeof course.teacherId === "string"
//                 ? course.teacherId
//                 : (course.teacherId as any)._id ?? String((course.teacherId as any))
//               : "";
//             return String(tid) === String(dd._id);
//           })
//         : [];
//       setCourses(filtered);
//     } catch (e: any) {
//       console.error("fetchCourses error", e);
//       setError(e.message || "Failed to load courses");
//     } finally {
//       setLoadingCourses(false);
//     }
//   }

//   async function fetchCourseDetails(courseId: string) {
//     setLoadingCourseDetails(true);
//     setError(null);
//     try {
//       const res = await fetch(`/api/courses/${courseId}`, { credentials: "include" });
//       if (!res.ok) {
//         const text = await res.text().catch(() => res.statusText);
//         throw new Error(text || `HTTP ${res.status}`);
//       }
//       const data = await res.json();
//       setSelectedCourse(data.data || data);
//       // reset module selection and form on course change
//       setSelectedModuleDisplayIndex(null);
//       setSelectedModuleActualIndex(null);
//       resetForm();
//     } catch (e: any) {
//       console.error("fetchCourseDetails error", e);
//       setError(e.message || "Failed to load course details");
//     } finally {
//       setLoadingCourseDetails(false);
//     }
//   }

//   // map displayed (sorted) module index -> actual index in stored array
//   function getActualModuleIndexFromDisplay(displayIdx: number) {
//     if (!selectedCourse?.modules) return -1;
//     const sorted = selectedCourse.modules.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//     const moduleItem = sorted[displayIdx];
//     if (!moduleItem) return -1;
//     if (moduleItem._id) {
//       const found = selectedCourse.modules.findIndex((m) => m._id === moduleItem._id);
//       if (found !== -1) return found;
//     }
//     const byRef = selectedCourse.modules.indexOf(moduleItem as any);
//     if (byRef !== -1) return byRef;
//     const byProps = selectedCourse.modules.findIndex(
//       (m) => m.title === moduleItem.title && (m.order ?? 0) === (moduleItem.order ?? 0)
//     );
//     return byProps !== -1 ? byProps : -1;
//   }

//   function onSelectModule(displayIdx: number) {
//     const actual = getActualModuleIndexFromDisplay(displayIdx);
//     setSelectedModuleDisplayIndex(displayIdx);
//     setSelectedModuleActualIndex(actual === -1 ? null : actual);
//     resetForm();
//     setResources([]);
//     setSuccessMessage(null);
//     setError(null);
//   }

//   function resetForm() {
//     setForm({
//       title: "",
//       description: "",
//       content: "",
//       videoUrl: "",
//       duration: 0,
//       order: 0,
//     });
//     setResources([]);
//   }

//   function updateForm<K extends keyof typeof form>(key: K, value: typeof form[K]) {
//     setForm((p) => ({ ...p, [key]: value }));
//   }

//   function addResource() {
//     setResources((r) => [...r, { title: "", url: "", type: "" }]);
//   }

//   function updateResource(idx: number, key: keyof Resource, value: string) {
//     setResources((r) => {
//       const copy = [...r];
//       copy[idx] = { ...copy[idx], [key]: value };
//       return copy;
//     });
//   }

//   function removeResource(idx: number) {
//     setResources((r) => {
//       const copy = [...r];
//       copy.splice(idx, 1);
//       return copy;
//     });
//   }

//   async function handleAddLesson() {
//     setError(null);
//     setSuccessMessage(null);

//     if (!selectedCourse) {
//       setError("Select a course first");
//       return;
//     }
//     if (selectedModuleActualIndex === null || selectedModuleActualIndex === undefined) {
//       setError("Select a module first");
//       return;
//     }
//     if (!form.title.trim()) {
//       setError("Lesson title is required");
//       return;
//     }
//     if (form.order === undefined || form.order === null) {
//       setError("Lesson order is required");
//       return;
//     }

//     // build payload matching backend schema
//     const payload: any = {
//       title: form.title.trim(),
//       description: form.description?.trim() || undefined,
//       content: form.content?.trim() || undefined,
//       videoUrl: form.videoUrl?.trim() || undefined,
//       duration: Number(form.duration) || undefined,
//       order: Number(form.order),
//       resources: resources.length > 0 ? resources.map((res) => ({
//         title: res.title,
//         url: res.url,
//         type: res.type,
//       })) : undefined,
//     };

//     setSaving(true);
//     try {
//       const res = await fetch(
//         `/api/courses/${selectedCourse._id}/modules/${selectedModuleActualIndex}/lessons`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!res.ok) {
//         const errJson = await res.json().catch(() => null);
//         if (res.status === 401) throw new Error("You must be logged in to add lessons");
//         if (res.status === 403) throw new Error("Access denied. You must be the course teacher or admin.");
//         throw new Error(errJson?.message || `HTTP ${res.status}: ${res.statusText}`);
//       }

//       const data = await res.json();
//       setSuccessMessage("Lesson added successfully");
//       // refresh course details to pick up new lesson
//       await fetchCourseDetails(selectedCourse._id);
//       // maintain selected module if possible: try to recompute actual index based on module _id if returned
//       // but simplest: after refetch, keep display selection if it exists
//       // reset form
//       resetForm();
//       setResources([]);
//     } catch (e: any) {
//       console.error("handleAddLesson error", e);
//       setError(e.message || "Failed to add lesson");
//     } finally {
//       setSaving(false);
//     }
//   }

//   // Helpers to display existing lessons (if any)
//   function renderLessonsForSelectedModule() {
//     if (!selectedCourse || selectedModuleActualIndex === null || selectedModuleActualIndex === undefined) return null;
//     const module = selectedCourse.modules?.[selectedModuleActualIndex];
//     if (!module) return <div className="text-sm text-gray-500">Module not found in current course data.</div>;
//     if (!module.lessons || module.lessons.length === 0) return <div className="text-sm text-gray-500">No lessons yet for this module.</div>;

//     const sorted = module.lessons.slice().sort((a: Lesson, b: Lesson) => (a.order ?? 0) - (b.order ?? 0));
//     return (
//       <ul className="space-y-2">
//         {sorted.map((lsn, i) => (
//           <li key={lsn._id || i} className="p-2 border rounded bg-gray-50">
//             <div className="flex justify-between items-start">
//               <div>
//                 <div className="font-medium">{lsn.title}</div>
//                 {lsn.description && <div className="text-sm text-gray-600">{lsn.description}</div>}
//                 <div className="text-xs text-gray-500">Order: {lsn.order ?? i}</div>
//                 {lsn.duration !== undefined && <div className="text-xs text-gray-500">Duration: {lsn.duration} seconds</div>}
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
//       <h2 className="text-xl font-semibold mb-4">Add Lesson to Module</h2>

//       {/* Select course */}
//       <div className="mb-4">
//         <label className="block text-sm font-medium mb-1">Course</label>
//         <select
//           value={selectedCourse?._id || ""}
//           onChange={(e) => {
//             const id = e.target.value;
//             if (!id) {
//               setSelectedCourse(null);
//               return;
//             }
//             fetchCourseDetails(id);
//           }}
//           className="w-full border rounded px-3 py-2"
//         >
//           <option value="">-- Select course --</option>
//           {courses.map((c) => (
//             <option value={c._id} key={c._id}>
//               {c.title}
//             </option>
//           ))}
//         </select>
//         {loadingCourses && <div className="text-xs text-gray-500 mt-1">Loading courses...</div>}
//       </div>

//       {/* Select module */}
//       <div className="mb-4">
//         <label className="block text-sm font-medium mb-1">Module</label>
//         <select
//           value={selectedModuleDisplayIndex ?? ""}
//           onChange={(e) => {
//             const v = e.target.value;
//             if (v === "") {
//               setSelectedModuleDisplayIndex(null);
//               setSelectedModuleActualIndex(null);
//               return;
//             }
//             const displayIdx = Number(v);
//             setSelectedModuleDisplayIndex(displayIdx);
//             onSelectModule(displayIdx);
//           }}
//           className="w-full border rounded px-3 py-2"
//           disabled={!selectedCourse || loadingCourseDetails}
//         >
//           <option value="">-- Select module --</option>
//           {selectedCourse?.modules &&
//             selectedCourse.modules.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((m, idx) => (
//               <option key={m._id || idx} value={idx}>
//                 #{m.order} — {m.title}
//               </option>
//             ))}
//         </select>
//         {loadingCourseDetails && <div className="text-xs text-gray-500 mt-1">Loading course details...</div>}
//       </div>

//       {/* Existing lessons */}
//       <div className="mb-6">
//         <h4 className="font-medium mb-2">Existing lessons</h4>
//         {renderLessonsForSelectedModule()}
//       </div>

//       {/* Form */}
//       <div className="space-y-4 mb-4">
//         {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>}
//         {successMessage && <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded">{successMessage}</div>}

//         <div>
//           <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
//           <input value={form.title} onChange={(e) => updateForm("title", e.target.value)} className="w-full border rounded px-3 py-2" />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">Description</label>
//           <textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} rows={3} className="w-full border rounded px-3 py-2" />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">Content</label>
//           <textarea value={form.content} onChange={(e) => updateForm("content", e.target.value)} rows={4} className="w-full border rounded px-3 py-2" />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//           <div>
//             <label className="block text-sm font-medium mb-1">Video URL</label>
//             <input value={form.videoUrl} onChange={(e) => updateForm("videoUrl", e.target.value)} className="w-full border rounded px-3 py-2" />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
//             <input type="number" min={0} value={form.duration} onChange={(e) => updateForm("duration", Number(e.target.value))} className="w-full border rounded px-3 py-2" />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Order</label>
//             <input type="number" min={0} value={form.order} onChange={(e) => updateForm("order", Number(e.target.value))} className="w-full border rounded px-3 py-2" />
//           </div>
//         </div>

//         {/* Resources list */}
//         <div>
//           <div className="flex items-center justify-between mb-2">
//             <label className="block text-sm font-medium">Resources</label>
//             <button type="button" onClick={addResource} className="text-sm text-blue-600 underline">Add resource</button>
//           </div>

//           {resources.length === 0 && <div className="text-xs text-gray-500">No resources added.</div>}

//           <div className="space-y-2">
//             {resources.map((res, idx) => (
//               <div key={idx} className="p-2 border rounded bg-gray-50 grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
//                 <div className="md:col-span-2">
//                   <label className="text-xs">Title</label>
//                   <input value={res.title} onChange={(e) => updateResource(idx, "title", e.target.value)} className="w-full border rounded px-2 py-1" />
//                 </div>
//                 <div className="md:col-span-2">
//                   <label className="text-xs">URL</label>
//                   <input value={res.url} onChange={(e) => updateResource(idx, "url", e.target.value)} className="w-full border rounded px-2 py-1" />
//                 </div>
//                 <div>
//                   <label className="text-xs">Type</label>
//                   <input value={res.type} onChange={(e) => updateResource(idx, "type", e.target.value)} className="w-full border rounded px-2 py-1" />
//                 </div>

//                 <div className="md:col-span-5 flex justify-end">
//                   <button type="button" onClick={() => removeResource(idx)} className="text-xs text-red-600 underline">Remove</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           <button onClick={handleAddLesson} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
//             {saving ? "Saving..." : "Add Lesson"}
//           </button>

//           <button onClick={() => { resetForm(); setResources([]); setError(null); setSuccessMessage(null); }} disabled={saving} className="px-4 py-2 border rounded">
//             Reset
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useEffect, useState } from "react";

type Course = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  modules?: Module[];
  teacherId?: any;
};

type Module = {
  _id?: string;
  title: string;
  description?: string;
  order: number;
  lessons?: Lesson[];
};

type Lesson = {
  _id?: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
  resources?: Resource[];
};

type Resource = {
  title: string;
  url: string;
  type: string;
};

export default function CourseLesson() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModuleDisplayIndex, setSelectedModuleDisplayIndex] = useState<number | null>(null);
  const [selectedModuleActualIndex, setSelectedModuleActualIndex] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    duration: 0,
    order: 0,
  });

  const [resources, setResources] = useState<Resource[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingCourseDetails, setLoadingCourseDetails] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setLoadingCourses(true);
    setError(null);
    try {
      const res = await fetch("/api/courses", { credentials: "include" });
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const allCourses: Course[] = Array.isArray(data) ? data : data?.data || [];

      const sss = localStorage.getItem("user");
      const dd = sss ? JSON.parse(sss) : null;
      const filtered = dd
        ? allCourses.filter((course: Course) => {
            const tid = course.teacherId
              ? typeof course.teacherId === "string"
                ? course.teacherId
                : (course.teacherId as any)._id ?? String((course.teacherId as any))
              : "";
            return String(tid) === String(dd._id);
          })
        : [];
      setCourses(filtered);
    } catch (e: any) {
      console.error("fetchCourses error", e);
      setError(e.message || "Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  }

  async function fetchCourseDetails(courseId: string) {
    setLoadingCourseDetails(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}`, { credentials: "include" });
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSelectedCourse(data.data || data);
      setSelectedModuleDisplayIndex(null);
      setSelectedModuleActualIndex(null);
      resetForm();
    } catch (e: any) {
      console.error("fetchCourseDetails error", e);
      setError(e.message || "Failed to load course details");
    } finally {
      setLoadingCourseDetails(false);
    }
  }

  function getActualModuleIndexFromDisplay(displayIdx: number) {
    if (!selectedCourse?.modules) return -1;
    const sorted = selectedCourse.modules.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const moduleItem = sorted[displayIdx];
    if (!moduleItem) return -1;
    if (moduleItem._id) {
      const found = selectedCourse.modules.findIndex((m) => m._id === moduleItem._id);
      if (found !== -1) return found;
    }
    const byRef = selectedCourse.modules.indexOf(moduleItem as any);
    if (byRef !== -1) return byRef;
    const byProps = selectedCourse.modules.findIndex(
      (m) => m.title === moduleItem.title && (m.order ?? 0) === (moduleItem.order ?? 0)
    );
    return byProps !== -1 ? byProps : -1;
  }

  function onSelectModule(displayIdx: number) {
    const actual = getActualModuleIndexFromDisplay(displayIdx);
    setSelectedModuleDisplayIndex(displayIdx);
    setSelectedModuleActualIndex(actual === -1 ? null : actual);
    resetForm();
    setResources([]);
    setSuccessMessage(null);
    setError(null);
  }

  function resetForm() {
    setForm({
      title: "",
      description: "",
      content: "",
      videoUrl: "",
      duration: 0,
      order: 0,
    });
    setResources([]);
  }

  function updateForm<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function addResource() {
    setResources((r) => [...r, { title: "", url: "", type: "" }]);
  }

  function updateResource(idx: number, key: keyof Resource, value: string) {
    setResources((r) => {
      const copy = [...r];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  }

  function removeResource(idx: number) {
    setResources((r) => {
      const copy = [...r];
      copy.splice(idx, 1);
      return copy;
    });
  }

  async function handleAddLesson() {
    setError(null);
    setSuccessMessage(null);

    if (!selectedCourse) {
      setError("Select a course first");
      return;
    }
    if (selectedModuleActualIndex === null || selectedModuleActualIndex === undefined) {
      setError("Select a module first");
      return;
    }
    if (!form.title.trim()) {
      setError("Lesson title is required");
      return;
    }
    if (form.order === undefined || form.order === null) {
      setError("Lesson order is required");
      return;
    }

    const payload: any = {
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      content: form.content?.trim() || undefined,
      videoUrl: form.videoUrl?.trim() || undefined,
      duration: Number(form.duration) || undefined,
      order: Number(form.order),
      resources: resources.length > 0 ? resources.map((res) => ({
        title: res.title,
        url: res.url,
        type: res.type,
      })) : undefined,
    };

    setSaving(true);
    try {
      const res = await fetch(
        `/api/courses/${selectedCourse._id}/modules/${selectedModuleActualIndex}/lessons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        if (res.status === 401) throw new Error("You must be logged in to add lessons");
        if (res.status === 403) throw new Error("Access denied. You must be the course teacher or admin.");
        throw new Error(errJson?.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setSuccessMessage("Lesson added successfully");
      await fetchCourseDetails(selectedCourse._id);
      resetForm();
      setResources([]);
    } catch (e: any) {
      console.error("handleAddLesson error", e);
      setError(e.message || "Failed to add lesson");
    } finally {
      setSaving(false);
    }
  }

  function renderLessonsForSelectedModule() {
    if (!selectedCourse || selectedModuleActualIndex === null || selectedModuleActualIndex === undefined) return null;
    const module = selectedCourse.modules?.[selectedModuleActualIndex];
    if (!module) return <div className="text-sm text-gray-500">Module not found in current course data.</div>;
    if (!module.lessons || module.lessons.length === 0) return <div className="text-sm text-gray-500">No lessons yet for this module.</div>;

    const sorted = module.lessons.slice().sort((a: Lesson, b: Lesson) => (a.order ?? 0) - (b.order ?? 0));
    return (
      <div className="space-y-2">
        {sorted.map((lsn, i) => (
          <div key={lsn._id || i} className="p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800">{lsn.title}</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Order: {lsn.order ?? i}</span>
                  {lsn.duration !== undefined && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      <span className="icon-[tabler--clock] size-3 inline mr-1"></span>
                      {lsn.duration}s
                    </span>
                  )}
                </div>
                {lsn.description && <div className="text-sm text-gray-600 mb-2">{lsn.description}</div>}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {lsn.videoUrl && (
                    <span className="inline-flex items-center gap-1">
                      <span className="icon-[tabler--video] size-3"></span>
                      Video
                    </span>
                  )}
                  {lsn.resources && lsn.resources.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <span className="icon-[tabler--paperclip] size-3"></span>
                      {lsn.resources.length} resources
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-9xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-800">Add Lesson to Module</h2>
          <p className="text-sm text-gray-500 mt-1">Create and manage lessons for your course modules</p>
        </div>

        <div className="card-body">
          {/* Course and Module Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="icon-[tabler--book] size-4 inline mr-2"></span>
                Select Course
              </label>
              <select
                value={selectedCourse?._id || ""}
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) {
                    setSelectedCourse(null);
                    return;
                  }
                  fetchCourseDetails(id);
                }}
                className="select w-full"
                disabled={loadingCourses}
              >
                <option value="">Choose a course...</option>
                {courses.map((c) => (
                  <option value={c._id} key={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
              {loadingCourses && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span className="icon-[tabler--loader] size-4 animate-spin"></span>
                  Loading courses...
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="icon-[tabler--stack] size-4 inline mr-2"></span>
                Select Module
              </label>
              <select
                value={selectedModuleDisplayIndex ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") {
                    setSelectedModuleDisplayIndex(null);
                    setSelectedModuleActualIndex(null);
                    return;
                  }
                  const displayIdx = Number(v);
                  setSelectedModuleDisplayIndex(displayIdx);
                  onSelectModule(displayIdx);
                }}
                className="select w-full"
                disabled={!selectedCourse || loadingCourseDetails}
              >
                <option value="">Choose a module...</option>
                {selectedCourse?.modules &&
                  selectedCourse.modules
                    .slice()
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((m, idx) => (
                      <option key={m._id || idx} value={idx}>
                        #{m.order} — {m.title}
                      </option>
                    ))}
              </select>
              {loadingCourseDetails && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span className="icon-[tabler--loader] size-4 animate-spin"></span>
                  Loading modules...
                </div>
              )}
            </div>
          </div>

          {/* Selected Course/Module Info */}
          {selectedCourse && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-blue-800">{selectedCourse.title}</h3>
                  {selectedCourse.description && (
                    <p className="text-sm text-blue-600 mt-1">{selectedCourse.description}</p>
                  )}
                  {selectedModuleActualIndex !== null && selectedCourse.modules?.[selectedModuleActualIndex] && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        Module: {selectedCourse.modules[selectedModuleActualIndex].title}
                      </span>
                      <span className="text-xs text-blue-600">
                        {selectedCourse.modules[selectedModuleActualIndex].lessons?.length || 0} existing lessons
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedCourse(null);
                    setSelectedModuleDisplayIndex(null);
                    setSelectedModuleActualIndex(null);
                    resetForm();
                  }}
                  className="btn btn-text btn-sm text-blue-600"
                >
                  <span className="icon-[tabler--x] size-4"></span>
                </button>
              </div>
            </div>
          )}

          {/* Existing Lessons Section */}
          {selectedModuleActualIndex !== null && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  <span className="icon-[tabler--list] size-4 inline mr-2"></span>
                  Existing Lessons
                </h4>
                <span className="text-xs text-gray-500">
                  {selectedCourse?.modules?.[selectedModuleActualIndex]?.lessons?.length || 0} lessons
                </span>
              </div>
              {renderLessonsForSelectedModule()}
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="alert alert-error mb-4">
              <span className="icon-[tabler--alert-circle] size-5"></span>
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="alert alert-success mb-4">
              <span className="icon-[tabler--check] size-5"></span>
              {successMessage}
            </div>
          )}

          {/* New Lesson Form */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              {selectedModuleActualIndex !== null ? "Add New Lesson" : "Lesson Details"}
            </h3>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input 
                  value={form.title} 
                  onChange={(e) => updateForm("title", e.target.value)} 
                  className="input w-full" 
                  placeholder="Enter lesson title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input 
                  type="number" 
                  min={0} 
                  value={form.order} 
                  onChange={(e) => updateForm("order", Number(e.target.value))} 
                  className="input w-full" 
                  placeholder="Lesson sequence"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                value={form.description} 
                onChange={(e) => updateForm("description", e.target.value)} 
                rows={2} 
                className="textarea w-full" 
                placeholder="Brief description of the lesson"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea 
                value={form.content} 
                onChange={(e) => updateForm("content", e.target.value)} 
                rows={4} 
                className="textarea w-full" 
                placeholder="Detailed lesson content or instructions"
              />
              <p className="text-xs text-gray-500 mt-2">You can use Markdown formatting here</p>
            </div>

            {/* Media & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                <div className="relative">
                  <input 
                    value={form.videoUrl} 
                    onChange={(e) => updateForm("videoUrl", e.target.value)} 
                    className="input w-full" 
                    placeholder="https://example.com/video"
                  />
                  {form.videoUrl && (
                    <button
                      type="button"
                      onClick={() => updateForm("videoUrl", "")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="icon-[tabler--x] size-4"></span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">YouTube, Vimeo, or direct video link</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (seconds)</label>
                <input 
                  type="number" 
                  min={0} 
                  value={form.duration} 
                  onChange={(e) => updateForm("duration", Number(e.target.value))} 
                  className="input w-full" 
                  placeholder="e.g., 600 (10 minutes)"
                />
                {form.duration > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {Math.floor(form.duration / 60)} min {form.duration % 60} sec
                  </p>
                )}
              </div>
            </div>

            {/* Resources Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700">
                    <span className="icon-[tabler--paperclip] size-4 inline mr-2"></span>
                    Resources
                  </h4>
                  <p className="text-xs text-gray-500">Add supporting files, links, or documents</p>
                </div>
                <button 
                  type="button" 
                  onClick={addResource} 
                  className="btn btn-soft btn-primary btn-sm"
                >
                  <span className="icon-[tabler--plus] size-3 mr-1"></span>
                  Add Resource
                </button>
              </div>

              {resources.length === 0 && (
                <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <span className="icon-[tabler--file-off] size-8 text-gray-400 mb-2 block mx-auto"></span>
                  <p className="text-gray-500">No resources added</p>
                  <p className="text-xs text-gray-400 mt-1">Add PDFs, documents, or links</p>
                </div>
              )}

              {/* Resources List */}
              <div className="space-y-3">
                {resources.map((res, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Resource {idx + 1}</span>
                        {res.type && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {res.type}
                          </span>
                        )}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeResource(idx)} 
                        className="btn btn-text btn-sm text-red-600 hover:text-red-700"
                      >
                        <span className="icon-[tabler--trash] size-4"></span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                        <input 
                          value={res.title} 
                          onChange={(e) => updateResource(idx, "title", e.target.value)} 
                          className="input input-sm w-full" 
                          placeholder="Resource title"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">URL/Link</label>
                        <input 
                          value={res.url} 
                          onChange={(e) => updateResource(idx, "url", e.target.value)} 
                          className="input input-sm w-full" 
                          placeholder="https://example.com/file.pdf"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                        <select 
                          value={res.type} 
                          onChange={(e) => updateResource(idx, "type", e.target.value)} 
                          className="select select-sm w-full"
                        >
                          <option value="">Select type</option>
                          <option value="PDF">PDF</option>
                          <option value="Document">Document</option>
                          <option value="Link">Link</option>
                          <option value="Video">Video</option>
                          <option value="Image">Image</option>
                          <option value="Code">Code</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <button 
                onClick={() => { 
                  resetForm(); 
                  setResources([]); 
                  setError(null); 
                  setSuccessMessage(null); 
                }} 
                disabled={saving} 
                className="btn btn-text"
              >
                <span className="icon-[tabler--refresh] size-4 mr-2"></span>
                Reset Form
              </button>
              <button 
                onClick={handleAddLesson} 
                disabled={saving || !selectedCourse || selectedModuleActualIndex === null} 
                className="btn btn-primary min-w-[140px]"
              >
                {saving ? (
                  <>
                    <span className="icon-[tabler--loader] size-5 animate-spin mr-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="icon-[tabler--plus] size-5 mr-2"></span>
                    Add Lesson
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="card-footer">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="icon-[tabler--info-circle] size-4"></span>
              <span>Select a course and module to add lessons</span>
            </div>
            <div>
              {courses.length} courses available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}