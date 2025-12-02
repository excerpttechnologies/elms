// src/components/CreateCourseForm.tsx
"use client";
import React, { useEffect, useState } from "react";

type FormState = {
  title: string;
  description: string;
  shortDescription?: string;
  category?: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  price?: number | "";
  capacity?: number | "";
  tags?: string; // comma separated
};

type Course = {
  id?: string | number;
  title: string;
  description: string;
  shortDescription?: string;
  category?: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  price?: number;
  capacity?: number;
  tags?: string[];
  createdAt?: string;
  [key: string]: any;
};

export default function CreateCourseForm() {
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    shortDescription: "",
    category: "",
    level: "BEGINNER",
    status: "PUBLISHED",
    price: "",
    capacity: "",
    tags: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // courses list state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchCourses = async (signal?: AbortSignal) => {
    setLoadingCourses(true);
    setCoursesError(null);
    try {
      const res = await fetch("/api/courses", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
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

  const openModal = () => {
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      shortDescription: "",
      category: "",
      level: "BEGINNER",
      status: "PUBLISHED",
      price: "",
      capacity: "",
      tags: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        shortDescription: form.shortDescription,
        category: form.category,
        level: form.level,
        status: form.status,
        price: form.price === "" ? undefined : Number(form.price),
        capacity: form.capacity === "" ? undefined : Number(form.capacity),
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      };

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create course");
      }

      setSuccess("Course created successfully");
      alert("Course created successfully");

      // reset form
      resetForm();

      // refresh courses list
      fetchCourses();

      // close modal after success
      setTimeout(() => {
        setIsModalOpen(false);
      }, 300);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="lg:grid lg:grid-cols-1 h-screen">
      <div className="bg-white rounded-md shadow-sm p-6">
      {/* TOP BAR: Courses header + Create button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base-content text-2xl font-semibold">Courses</h3>
          <p className="text-base-content/80 text-sm">
            Manage your courses list
          </p>
        </div>

        <div>
          <button
            onClick={openModal}
            className="btn btn-soft btn-primary waves waves-primary"
            aria-haspopup="dialog"
            aria-expanded={isModalOpen}
          >
            Create Course
          </button>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="max-full mx- bg-base-100 rounded">
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
          <div className="w-full overflow-x-auto border-base-content/25 rounded-lg border">
            <table className="table">
              <thead>
                <tr>
                  <th >Title</th>
                  <th >Category</th>
                  <th >Level</th>
                  <th >status</th>
                  <th >Price</th>
                  <th >Capacity</th>
                  <th >Tags</th>
                  <th >Created</th>
                  
                </tr>
              </thead>
              <tbody>
                {courses.map((c, idx) => (
                  <tr key={c.id ?? idx} className="row-hover">
                    <td>{c.title}</td>
                    <td>{c.category ?? "-"}</td>
                    <td>{c.level ?? "-"}</td>
                    <td>
                      <span className="badge badge-soft badge-success text-xs">{c.status ?? "-"}</span>
                    </td>
                    <td className="text-right">
                      {typeof c.price === "number" ? c.price : "-"}
                    </td>
                    <td className="text-right">{c.capacity ?? "-"}</td>
                    <td>
                      {Array.isArray(c.tags)
                        ? c.tags.join(", ")
                        : (c.tags ?? "-")}
                    </td>
                    <td>{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* modal panel */}
          <div className="relative w-full max-w-3xl mx-4 bg-base-100 rounded-lg shadow-lg z-10 overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="text-lg font-semibold">Create Course</h4>
              <button
                className="btn btn-ghost"
                onClick={closeModal}
                aria-label="Close create course modal"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                {/* Alerts */}
                {error && (
                  <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 rounded bg-green-50 border border-green-200 text-green-700">
                    {success}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label htmlFor="title" className="font-medium">
                    Title*
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Enter course title"
                    required
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label htmlFor="shortDescription" className="font-medium">
                    Short description
                  </label>
                  <input
                    id="shortDescription"
                    name="shortDescription"
                    value={form.shortDescription}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="One-line summary (optional)"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="font-medium">
                    Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="textarea textarea-bordered w-full"
                    placeholder="Describe the course"
                    required
                  />
                </div>

                {/* Category & Level & Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-medium" htmlFor="category">
                      Category
                    </label>
                    <input
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="e.g. Design, Programming"
                    />
                  </div>

                  <div>
                    <label className="font-medium" htmlFor="level">
                      Level
                    </label>
                    <select
                      id="level"
                      name="level"
                      value={form.level}
                      onChange={handleChange}
                      className="select select-bordered w-full"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium" htmlFor="status">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="select select-bordered w-full"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                {/* Price & Capacity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium" htmlFor="price">
                      Price
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      value={form.price as any}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="0 for free"
                    />
                  </div>

                  <div>
                    <label className="font-medium" htmlFor="capacity">
                      Capacity
                    </label>
                    <input
                      id="capacity"
                      name="capacity"
                      type="number"
                      value={form.capacity as any}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="Max students"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="font-medium" htmlFor="tags">
                    Tags (comma separated)
                  </label>
                  <input
                    id="tags"
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="ui, react, node"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Course"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      resetForm();
                      closeModal();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
