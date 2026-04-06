"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import http from "@/lib/http";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("started.......")
    const checkUser = async () => {
      try {
        const res = await http.get("/auth/me");
        if (res.data.success && res.data.data) {
          const user = res.data.data;
          router.replace(
            user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/user"
          );
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (!loading) return null;

  return (
    <div className="loading-container">
      <div className="spinner" />
      <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
        Loading...
      </p>
    </div>
  );
}
