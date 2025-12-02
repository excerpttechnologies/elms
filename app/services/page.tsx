"use client";
import Breadcrumb from "../../components/layout/Breadcrumb";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

type Teacher = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
};

type Course = {
  _id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  teacherId?: string | Teacher;
  category?: string;
  tags?: string[];
  level?: string;
  status?: string;
  price?: number;
  thumbnail?: string;
  isEnrolled?: boolean;
};

export default function ServicesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        const items = Array.isArray(data?.data) ? data.data : [];
        setCourses(items);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Failed to load courses");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrollingCourseId(courseId);
      
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enroll");
      }

      // Update the course enrollment status in the UI
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? { ...course, isEnrolled: true }
            : course
        )
      );

      alert("Successfully enrolled in the course!");
    } catch (err: any) {
      alert(err.message || "Failed to enroll in course");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleUnenroll = async (courseId: string) => {
    if (!confirm("Are you sure you want to unenroll from this course?")) {
      return;
    }

    try {
      setEnrollingCourseId(courseId);
      
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to unenroll");
      }

      // Update the course enrollment status in the UI
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? { ...course, isEnrolled: false }
            : course
        )
      );

      alert("Successfully unenrolled from the course!");
    } catch (err: any) {
      alert(err.message || "Failed to unenroll from course");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  return (
    <>
    <Navbar/>
      <div className="flex jz3o6 items-center gap-4 mt-3">
        <h1 className="text-2xl font-bold ">Services</h1>
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "services" }]}
        />
      </div>

      <div className="bg-base-100 i3xre sm:py-16 lg:py-10">
        <div className="wpaot owca9 j2be9 sm:px-6 lg:px-8">
          <div className="flex jz3o6 items-center v3npj md:gap-16 lg:gap-24">
            <div className="haqb6 hqh7v rdi5h">
              <p className="text-primary text-sm font-medium vxiam">About Us</p>
              <h2 className="text-base-content waiii t3mfo md:text-3xl lg:text-4xl">
                Specially Designed For Payments
              </h2>
              <p className="text-base-content/80 bk5oo">
                Our story is a testament to the power of collaboration and
                resilience. Together, we have navigated challenges, celebrated
                milestones, and crafted a narrative of growth and achievement in
                the construction industry.
              </p>
            </div>

          
          </div>

          {/* Courses list (dynamic) */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Courses</h3>

            {loading && <div>Loading courses…</div>}
            {error && <div className="text-error">{error}</div>}

            {!loading && !error && courses.length === 0 && (
              <div>No courses available</div>
            )}

            <div className="dpzny k6gdi md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const teacher =
                  typeof course.teacherId === "string"
                    ? null
                    : (course.teacherId as Teacher);
                const thumbnail =
                  course.thumbnail ||
                  teacher?.avatar ||
                  `https://via.placeholder.com/400x200?text=${encodeURIComponent(
                    course.title || "Course"
                  )}`;

                const isProcessing = enrollingCourseId === course._id;

                return (
                  <div
                    key={course._id}
                    className="zq390 lynk2 m233p nwdq3 md:max-w-sm"
                  >
                    <div className="nqxya njdg2">
                      <img
                        src="https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/about/about-6.png"
                        alt={course.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-lg">
                            <span className="icon-[tabler--circle-check] text-base-content size-2 shrink-"></span>{" "}
                            Course: {course.title}
                          </h4>
                          <span
                            className={`badge ${
                              course.status === "PUBLISHED"
                                ? "badge-success"
                                : "badge-ghost"
                            }`}
                          >
                            {course.status ?? "UNKNOWN"}
                          </span>
                        </div>

                        <p className="text-sm text-muted mt-2">
                          Description:{" "}
                          {course.shortDescription ||
                            course.description ||
                            "—"}
                        </p>

                        <div className="flex items-center justify-between mt-3 text-sm">
                          <div className="text-xs text-muted">
                            <div>
                              <strong>Category:</strong>{" "}
                              {course.category || "General"}
                            </div>
                            <div>
                              <strong>Level:</strong> {course.level || "All"}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-base font-bold">
                              {course.price ? `₹${course.price}` : "Free"}
                            </div>
                            <div className="text-xs text-muted">
                              {teacher
                                ? `${teacher.firstName ?? ""} ${
                                    teacher.lastName ?? ""
                                  }`.trim()
                                : typeof course.teacherId === "string"
                                ? course.teacherId
                                : "Unknown"}
                            </div>
                          </div>
                        </div>

                        {course.tags && course.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {course.tags.map((t, index) => (
  <span
    key={`${t}-${index}`} // ensures uniqueness even if tags repeat
    className="px-2 py-1 text-xs rounded-full bg-base-200"
  >
    {t}
  </span>
))}

                          </div>
                        )}

                        <div className="mt-4 flex gap-2">
                         
                          {course.isEnrolled ? (
                            <button
                              className="btn btn-sm btn-error"
                              onClick={() => handleUnenroll(course._id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? "Processing..." : "Unenroll"}
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => handleEnroll(course._id)}
                              disabled={
                                isProcessing ||
                                course.status !== "PUBLISHED"
                              }
                            >
                              {isProcessing ? "Enrolling..." : "Enroll"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}