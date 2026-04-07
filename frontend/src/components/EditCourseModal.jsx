"use client";

import { useState } from "react";
import http from "@/lib/http";

export default function EditCourseModal({ course, onClose, onUpdated }) {
  const [form, setForm] = useState({
    courseName: course.courseName || "",
    starttime: course.starttime
      ? new Date(course.starttime).toISOString().slice(0, 16)
      : "",
    endtime: course.endtime
      ? new Date(course.endtime).toISOString().slice(0, 16)
      : "",
    mode: course.mode || "Online",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.courseName || !form.starttime || !form.endtime || !form.mode) {
      setError("Please fill in all fields");
      return;
    }

    if (new Date(form.starttime) >= new Date(form.endtime)) {
      setError("End time must be after start time");
      return;
    }

    setIsLoading(true);
    try {
      await http.put(`/user/updateCourse`, {
        courseId : course.id,
        courseName: form.courseName,
        starttime: new Date(form.starttime).toISOString(),
        endtime: new Date(form.endtime).toISOString(),
        mode: form.mode,
      });
      onUpdated();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update course"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Course — {course.courseId}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="edit-courseName">Course Name</label>
              <input
                id="edit-courseName"
                name="courseName"
                type="text"
                className="form-input"
                value={form.courseName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-starttime">Start Time</label>
              <input
                id="edit-starttime"
                name="starttime"
                type="datetime-local"
                className="form-input"
                value={form.starttime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-endtime">End Time</label>
              <input
                id="edit-endtime"
                name="endtime"
                type="datetime-local"
                className="form-input"
                value={form.endtime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-mode">Mode</label>
              <select
                id="edit-mode"
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
                  <span className="spinner spinner-sm" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
