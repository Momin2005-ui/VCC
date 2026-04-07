"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/components/Toast";
import CreateCourseModal from "@/components/CreateCourseModal";
import EditCourseModal from "@/components/EditCourseModal";
import EnrolledUsersModal from "@/components/EnrolledUsersModal";
import http from "@/lib/http";

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [userEmail, setUserEmail] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showUsersModal, setShowUsersModal] = useState(false);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch current user email for greeting
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await http.get("/auth/me");
        if (res.data.success && res.data.data) {
          setUserEmail(res.data.data.email.email || "");
        }
      } catch {
        // Layout handles auth redirect
      }
    };
    getUser();
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await http.get("/user/getAllCreatedCourses");
      // console.log("dataaaaa",res.data.data)
      setCourses(res.data.data || []);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to load courses",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const getTimeStatus = (start, end) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (now < startDate) return "upcoming";
    if (now >= startDate && now <= endDate) return "ongoing";
    return "ended";
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        !searchQuery ||
        course.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseId?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMode =
        modeFilter === "all" ||
        course.mode?.toLowerCase() === modeFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        getTimeStatus(course.starttime, course.endtime) === statusFilter;

      return matchesSearch && matchesMode && matchesStatus;
    });
  }, [courses, searchQuery, modeFilter, statusFilter]);

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await http.delete("/user/deleteCourse", {
  data: {
    courseId: courseId
  }
});
      addToast("Course deleted successfully", "success");
      fetchCourses();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to delete course",
        "error"
      );
    }
  };

  const handleViewUsers = (course) => {
    setSelectedCourse(course);
    setShowUsersModal(true);
  };

  const handleCourseCreated = () => {
    setShowCreateModal(false);
    addToast("Course created successfully!", "success");
    fetchCourses();
  };

  const handleCourseUpdated = () => {
    setEditCourse(null);
    addToast("Course updated successfully!", "success");
    fetchCourses();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const upcomingCount = courses.filter(
    (c) => getTimeStatus(c.starttime, c.endtime) === "upcoming"
  ).length;
  const ongoingCount = courses.filter(
    (c) => getTimeStatus(c.starttime, c.endtime) === "ongoing"
  ).length;

  return (
    <>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>
          Welcome back, {userEmail?.split("@")[0] || "Admin"}. Manage courses
          and enrollments.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{courses.length}</div>
          <div className="stat-label">Total Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-value">{ongoingCount}</div>
          <div className="stat-label">Ongoing Now</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{upcomingCount}</div>
          <div className="stat-label">Upcoming</div>
        </div>
      </div>

      {/* Section Header */}
      <div className="section-header">
        <h2>All Courses ({filteredCourses.length})</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Course
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by course name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
        >
          <option value="all">All Modes</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="ended">Ended</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>{courses.length === 0 ? "No courses yet" : "No matches"}</h3>
          <p>
            {courses.length === 0
              ? "Create your first course to get started."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course, i) => {
            const status = getTimeStatus(course.starttime, course.endtime);
            return (
              <div
                key={course.id || i}
                className="course-card"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="course-card-header">
                  <span className="course-id-badge">{course.courseId}</span>
                  <div
                    style={{ display: "flex", gap: "6px", alignItems: "center" }}
                  >
                    <span className={`time-status ${status}`}>
                      <span className="dot" />
                      {status}
                    </span>
                    <span
                      className={`mode-badge ${
                        course.mode?.toLowerCase() === "online"
                          ? "online"
                          : "offline"
                      }`}
                    >
                      {course.mode?.toLowerCase() === "online" ? "🌐" : "🏫"}{" "}
                      {course.mode}
                    </span>
                  </div>
                </div>

                <h3>{course.courseName}</h3>

                <div className="course-meta">
                  <div className="course-meta-item">
                    <span className="icon">📅</span>
                    {formatDate(course.starttime)}
                  </div>
                  <div className="course-meta-item">
                    <span className="icon">🏁</span>
                    {formatDate(course.endtime)}
                  </div>
                </div>

                <div className="course-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleViewUsers(course)}
                  >
                    👥 Students
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditCourse(course)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCourseCreated}
        />
      )}

      {editCourse && (
        <EditCourseModal
          course={editCourse}
          onClose={() => setEditCourse(null)}
          onUpdated={handleCourseUpdated}
        />
      )}

      {showUsersModal && selectedCourse && (
        <EnrolledUsersModal
          course={selectedCourse}
          onClose={() => {
            setShowUsersModal(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </>
  );
}
