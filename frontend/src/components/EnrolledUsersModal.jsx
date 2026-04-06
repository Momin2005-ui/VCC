"use client";

import { useState, useEffect } from "react";
import http from "@/lib/http";

export default function EnrolledUsersModal({ course, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await http.get(
          `/user/getRegisteredUsers?courseId=${course.id}`
        );
        // console.log(res.data.users)
        setUsers(res.data.users || res.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load enrolled users"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [course.courseId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Enrolled Students — {course.courseName}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="alert alert-info">
            Course ID: <strong>{course.courseId}</strong> &nbsp;|&nbsp; Mode:{" "}
            <strong>{course.mode}</strong>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "32px" }}>
              <div className="spinner" style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                Loading students...
              </p>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : users.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px" }}>
              <div className="icon">👤</div>
              <h3>No students enrolled</h3>
              <p>No one has enrolled in this course yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User ID</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((enrollment, i) => (
                    <tr key={enrollment.email || i}>
                      <td>{i + 1}</td>
                      <td
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12px",
                        }}
                      >
                        {enrollment.email?.slice(0, 8)}...
                      </td>
                      <td>{enrollment.user?.email || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
            {users.length} student{users.length !== 1 ? "s" : ""} enrolled
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
