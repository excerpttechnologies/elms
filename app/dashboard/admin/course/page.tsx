// 

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
  tags?: string[];
  createdAt?: string;
  [key: string]: any;
};

export default function CoursesTable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"title" | "price" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Editor state
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorSuccess, setEditorSuccess] = useState<string | null>(null);
  const [editorCourse, setEditorCourse] = useState<Partial<Course> | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  const normalizeTags = (value: unknown): string[] | undefined => {
    if (Array.isArray(value)) {
      return (value as any[]).map((v) => String(v).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      return value.split(",").map((t) => t.trim()).filter(Boolean);
    }
    return undefined;
  };

  // Filter and sort courses
  const filteredAndSortedCourses = React.useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = searchTerm === "" || 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = filterCategory === "all" || course.category === filterCategory;
      const matchesLevel = filterLevel === "all" || course.level === filterLevel;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === "title") {
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
      } else if (sortBy === "price") {
        aValue = a.price || 0;
        bValue = b.price || 0;
      } else {
        aValue = a.createdAt || "";
        bValue = b.createdAt || "";
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [courses, searchTerm, filterCategory, filterLevel, sortBy, sortOrder]);

  const categories = React.useMemo(() => {
    const cats = new Set(courses.map(c => c.category).filter(Boolean));
    return Array.from(cats);
  }, [courses]);

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

  async function handleSaveCourse() {
    if (!editingCourseId || !editorCourse) return;
    setEditorError(null);
    setEditorSuccess(null);
    setEditorLoading(true);
    try {
      const payload: any = {
        title: editorCourse.title,
        description: editorCourse.description,
        shortDescription: editorCourse.shortDescription,
        category: editorCourse.category,
        level: editorCourse.level,
        price: editorCourse.price,
        capacity: editorCourse.capacity,
        tags: normalizeTags(editorCourse.tags),
      };

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
        await fetchCourses();
      }

      setEditorSuccess("Course updated successfully");
      setTimeout(() => setEditorSuccess(null), 3000);
    } catch (e: any) {
      console.error("handleSaveCourse error", e);
      setEditorError(e.message || "Failed to update course");
    } finally {
      setEditorLoading(false);
    }
  }

  async function handleDeleteCourse(courseId: string) {
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

      setCourses((prev) =>
        prev.filter((c) => {
          const id = c._id ?? c.id;
          return String(id) !== String(courseId);
        })
      );

      if (editingCourseId === courseId) closeEditor();
      setShowDeleteConfirm(null);
    } catch (e: any) {
      console.error("handleDeleteCourse error", e);
      setCoursesError(e.message || "Failed to delete course");
    } finally {
      setDeleting(false);
    }
  }

  function updateEditorField<K extends keyof Course>(key: K, value: any) {
    setEditorCourse((prev) => (prev ? { ...prev, [key]: value } : { [key]: value } as any));
  }

  const getLevelColor = (level?: string) => {
    switch (level) {
      case "BEGINNER": return "bg-green-100 text-green-800";
      case "INTERMEDIATE": return "bg-yellow-100 text-yellow-800";
      case "ADVANCED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Course Management</h1>
              <p className="text-gray-600">Manage and organize your course catalog</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchCourses()}
                disabled={loadingCourses}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                <span className="icon-[tabler--refresh] size-4"></span>
                Refresh
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all inline-flex items-center gap-2 shadow-md hover:shadow-lg">
                <span className="icon-[tabler--plus] size-4"></span>
                New Course
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <span className="icon-[tabler--book] size-6 text-blue-600"></span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Beginner Courses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.filter(c => c.level === "BEGINNER").length}
                  </p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <span className="icon-[tabler--chart-line] size-6 text-green-600"></span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{Math.round(courses.reduce((acc, c) => acc + (c.price || 0), 0) / Math.max(courses.length, 1))}
                  </p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <span className="icon-[tabler--currency-rupee] size-6 text-purple-600"></span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.reduce((acc, c) => acc + (c.capacity || 0), 0)}
                  </p>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <span className="icon-[tabler--users] size-6 text-amber-600"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="icon-[tabler--search] size-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"></span>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="price">Sort by Price</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses List */}
          <div className="lg:col-span-2">
            {loadingCourses ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : coursesError ? (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-6 rounded-r-xl">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <span className="icon-[tabler--alert-circle] size-6 text-red-600"></span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Courses</h3>
                    <p className="text-gray-600">{coursesError}</p>
                  </div>
                </div>
              </div>
            ) : filteredAndSortedCourses.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="icon-[tabler--book] size-10 text-gray-400"></span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => { setSearchTerm(""); setFilterCategory("all"); setFilterLevel("all"); }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <span className="icon-[tabler--filter-off] size-4"></span>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedCourses.map((c, idx) => {
                  const id = c._id ?? c.id ?? idx;
                  return (
                    <div key={id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{c.title}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2">{c.shortDescription || c.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(c.level)}`}>
                              {c.level || "Unknown"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="icon-[tabler--tag] size-4 text-gray-400"></span>
                            <span className="text-sm text-gray-600">{c.category || "No Category"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="icon-[tabler--currency-rupee] size-4 text-gray-400"></span>
                            <span className="text-sm font-medium text-gray-900">
                              {typeof c.price === "number" ? `₹${c.price}` : "Free"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="icon-[tabler--users] size-4 text-gray-400"></span>
                            <span className="text-sm text-gray-600">Capacity: {c.capacity || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="icon-[tabler--calendar] size-4 text-gray-400"></span>
                            <span className="text-sm text-gray-600">{formatDate(c.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {c.tags?.slice(0, 3).map((tag, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                                {tag}
                              </span>
                            ))}
                            {c.tags && c.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
                                +{c.tags.length - 3} more
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditor(String(id))}
                              className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-2"
                            >
                              <span className="icon-[tabler--edit] size-4"></span>
                              Edit
                            </button>
                            {showDeleteConfirm === String(id) ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Are you sure?</span>
                                <button
                                  onClick={() => handleDeleteCourse(String(id))}
                                  disabled={deleting}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                                >
                                  {deleting ? "Deleting..." : "Yes"}
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowDeleteConfirm(String(id))}
                                className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-2"
                              >
                                <span className="icon-[tabler--trash] size-4"></span>
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Editor Sidebar */}
          {editingCourseId && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-6 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Edit Course</h3>
                    <button
                      onClick={closeEditor}
                      disabled={editorLoading}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <span className="icon-[tabler--x] size-5"></span>
                    </button>
                  </div>
                  <p className="text-blue-100 text-sm">Make changes to your course details</p>
                </div>

                <div className="p-6">
                  {editorLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : editorError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="icon-[tabler--alert-circle] size-5 text-red-600 mt-0.5"></span>
                        <span className="text-sm text-red-700">{editorError}</span>
                      </div>
                    </div>
                  ) : editorCourse ? (
                    <div className="space-y-6">
                      {editorSuccess && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="icon-[tabler--check] size-5 text-green-600"></span>
                            <span className="text-sm text-green-700">{editorSuccess}</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                        <input
                          value={editorCourse.title || ""}
                          onChange={(e) => updateEditorField("title", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter course title"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                          <select
                            value={editorCourse.level || ""}
                            onChange={(e) => updateEditorField("level", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          >
                            <option value="">Select Level</option>
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <input
                            value={editorCourse.category || ""}
                            onChange={(e) => updateEditorField("category", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="e.g., Technology"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                        <input
                          type="number"
                          value={editorCourse.price ?? ""}
                          onChange={(e) => updateEditorField("price", e.target.value === "" ? undefined : Number(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="0 for free"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                        <input
                          type="number"
                          value={editorCourse.capacity ?? ""}
                          onChange={(e) => updateEditorField("capacity", e.target.value === "" ? undefined : Number(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Maximum students"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                        <input
                          value={Array.isArray(editorCourse.tags) ? editorCourse.tags.join(", ") : (editorCourse.tags as any) || ""}
                          onChange={(e) => updateEditorField("tags", e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter tags separated by commas"
                        />
                        <p className="text-xs text-gray-500 mt-2">Separate tags with commas</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                        <textarea
                          value={editorCourse.shortDescription || ""}
                          onChange={(e) => updateEditorField("shortDescription", e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Brief description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
                        <textarea
                          value={editorCourse.description || ""}
                          onChange={(e) => updateEditorField("description", e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Detailed description"
                        />
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={handleSaveCourse}
                          disabled={editorLoading}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all font-semibold inline-flex items-center justify-center gap-2"
                        >
                          {editorLoading ? (
                            <>
                              <span className="icon-[tabler--loader] size-5 animate-spin"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <span className="icon-[tabler--check] size-5"></span>
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}