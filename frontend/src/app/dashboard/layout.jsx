"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import http from "@/lib/http";

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await http.get("/auth/me");
        if (res.data.success && res.data.data) {
          setUser(res.data.data);
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
     
    fetchUser();
    setLoading(false);
    // const user={
    //   email : "23bds036@iiitdwd.ac.in",
    //   role  : "ADMIN"
    // }
    // setUser(user)
    
  }, [router]);

  const handleLogout = async () => {
    try {
      await http.post("/auth/logout");
    } catch {
      // Even if logout API fails, clear cookie and redirect
    }
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  const navItems = isAdmin
    ? [
        {
          href: "/dashboard/admin",
          icon: "📊",
          label: "Dashboard",
        },
      ]
    : [
        {
          href: "/dashboard/user",
          icon: "📚",
          label: "My Courses",
        },
      ];

  return (
    <div className="dashboard-layout">
      {/* Mobile toggle */}
      <button
        className="mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>MyCourses</h2>
          <span>{isAdmin ? "Admin Portal" : "Student Portal"}</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${
                pathname === item.href ? "active" : ""
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user.email.email?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-email">{user.email.email}</div>
              <div className="sidebar-user-role">{user.role}</div>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-full"
            style={{ marginTop: "12px", color: "var(--danger-400)" }}
            onClick={handleLogout}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">{children}</main>
    </div>
  );
}
