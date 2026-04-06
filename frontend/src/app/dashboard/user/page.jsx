"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/components/Toast";
import http from "@/lib/http";

export default function UserDashboard() {
  const { addToast } = useToast();
  const [userEmail, setUserEmail] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const [availableCourses, setAvailableCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("all");

  // Fetch current user email for greeting
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await http.get("/auth/me");
        console.log(res)
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
    setLoading(true);
    try {
      const [availRes, myRes] = await Promise.allSettled([
        http.get("/user/getAllCourses"),
        // http.get("/user/getRegisteredCourses"),
      ]);
       console.log(availRes)
      if (availRes.status === "fulfilled") {
       
        setAvailableCourses(availRes.value.data.data || []);
      }
      if (myRes.status === "fulfilled") {
        setMyCourses(myRes.value.data.data || []);
      }
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

  // Filtered available courses
  const filteredAvailable = useMemo(() => {
    return availableCourses.filter((course) => {
      const matchesSearch =
        !searchQuery ||
        course.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode =
        modeFilter === "all" ||
        course.mode?.toLowerCase() === modeFilter.toLowerCase();
      return matchesSearch && matchesMode;
    });
  }, [availableCourses, searchQuery, modeFilter]);

  // Filtered enrolled courses
  const filteredMy = useMemo(() => {
    return myCourses.filter((course) => {
      const matchesSearch =
        !searchQuery ||
        course.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode =
        modeFilter === "all" ||
        course.mode?.toLowerCase() === modeFilter.toLowerCase();
      return matchesSearch && matchesMode;
    });
  }, [myCourses, searchQuery, modeFilter]);

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      await http.post("/user/registerCourse", { courseId });
      addToast("Successfully enrolled! 🎉", "success");
      fetchCourses();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to enroll",
        "error"
      );
    } finally {
      setEnrollingId(null);
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!confirm("Are you sure you want to unenroll from this course?")) return;
    try {
      await http.post("/user/unenrollCourse", { courseId });
      addToast("Successfully unenrolled", "success");
      fetchCourses();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to unenroll",
        "error"
      );
    }
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

  const currentList =
    activeTab === "available" ? filteredAvailable : filteredMy;

  return (
    <>
      <div className="page-header">
        <h1>My Courses</h1>
        <p>
          Welcome, {userEmail?.split("@")[0] || "Student"}. Browse and enroll in
          courses.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{availableCourses.length}</div>
          <div className="stat-label">Available Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{myCourses.length}</div>
          <div className="stat-label">Enrolled Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-value">
            {myCourses.filter(
              (c) => getTimeStatus(c.starttime, c.endtime) === "ongoing"
            ).length}
          </div>
          <div className="stat-label">Active Now</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "available" ? "active" : ""}`}
          onClick={() => setActiveTab("available")}
        >
          🔍 Available ({availableCourses.length})
        </button>
        <button
          className={`tab ${activeTab === "enrolled" ? "active" : ""}`}
          onClick={() => setActiveTab("enrolled")}
        >
          📋 Enrolled ({myCourses.length})
        </button>
      </div>

      {/* Search & Filter */}
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search courses..."
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
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading courses...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="empty-state">
          <div className="icon">
            {activeTab === "available" ? "🎉" : "📭"}
          </div>
          <h3>
            {activeTab === "available"
              ? searchQuery
                ? "No matches found"
                : "All caught up!"
              : searchQuery
              ? "No matches found"
              : "No enrollments yet"}
          </h3>
          <p>
            {activeTab === "available"
              ? searchQuery
                ? "Try changing your search or filters."
                : "No new courses available, or you've enrolled in all of them."
              : searchQuery
              ? "Try changing your search or filters."
              : 'Switch to "Available" tab to find and enroll in courses.'}
          </p>
        </div>
      ) : (
        <div className="courses-grid">
          {currentList.map((course, i) => {
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
                    style={{
                      display: "flex",
                      gap: "6px",
                      alignItems: "center",
                    }}
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
                  {activeTab === "available" ? (
                    <button
                      className="btn btn-accent btn-sm btn-full"
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingId === course.id}
                    >
                      {enrollingId === course.id ? (
                        <>
                          <span className="spinner spinner-sm" /> Enrolling...
                        </>
                      ) : (
                        "✅ Enroll Now"
                      )}
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger btn-sm btn-full"
                      onClick={() => handleUnenroll(course.id)}
                    >
                      ❌ Unenroll
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
