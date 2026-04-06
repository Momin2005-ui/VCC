"use client";

import { useState } from "react";
import http from "@/lib/http";

export default function CreateCourseModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    courseId: "",
    courseName: "",
    starttime: "",
    endtime: "",
    mode: "Online",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.courseId ||
      !form.courseName ||
      !form.starttime ||
      !form.endtime ||
      !form.mode
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (new Date(form.starttime) >= new Date(form.endtime)) {
      setError("End time must be after start time");
      return;
    }

    setIsLoading(true);
    try {
      await http.post("/user/createCourse", {
        courseId: form.courseId,
        courseName: form.courseName,
        starttime: new Date(form.starttime).toISOString(),
        endtime: new Date(form.endtime).toISOString(),
        mode: form.mode,
      });
      onCreated();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create course"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Course</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="courseId">Course ID</label>
              <input
                id="courseId"
                name="courseId"
                type="text"
                className="form-input"
                placeholder="e.g., CS301"
                value={form.courseId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="courseName">Course Name</label>
              <input
                id="courseName"
                name="courseName"
                type="text"
                className="form-input"
                placeholder="e.g., Cloud Computing"
                value={form.courseName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="starttime">Start Time</label>
              <input
                id="starttime"
                name="starttime"
                type="datetime-local"
                className="form-input"
                value={form.starttime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endtime">End Time</label>
              <input
                id="endtime"
                name="endtime"
                type="datetime-local"
                className="form-input"
                value={form.endtime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mode">Mode</label>
              <select
                id="mode"
                name="mode"
                className="form-select"
                value={form.mode}
                onChange={handleChange}
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner spinner-sm" /> Creating...
                </>
              ) : (
                "Create Course"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
