"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import http from "@/lib/http";

export default function DashboardRedirect() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await http.get("/auth/me");
        console.log(res.data.data)
        if (res.data.success && res.data.data) {
          const user = res.data.data;
          console.log("user: ",user)
          router.replace(
            user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/user"
          );
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
    </div>
  );
}
