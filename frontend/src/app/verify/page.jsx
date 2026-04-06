// "use client";

// import { useEffect, useState, Suspense } from "react";
// import { useSearchParams } from "next/navigation";
// import Link from "next/link";
// import http from "@/lib/http";

// function VerifyContent() {
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token");
//   console.log("Token : ", token)
//   const [status, setStatus] = useState("verifying"); // verifying | success | error
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     if (!token) {
//       setStatus("error");
//       setMessage("No verification token found.");
//       console.log("token didnt retrieve")
//       return;
//     }

//     const verify = async () => {
//       try {
//         const res = await http.post("/auth/verify", { token });
//         setStatus("success");
//         setMessage(res.data.message || "Email verified successfully!");
//       } catch (err) {
//         setStatus("error");
//         setMessage(
//           err.response?.data?.message ||
//             "Verification failed. Token may be expired."
//         );
//       }
//     };

//     verify();
//   }, [token]);

//   return (
//     <div className="auth-container">
//       <div className="auth-card" style={{ textAlign: "center" }}>
//         <div className="auth-logo">
//           <h1>MyCourses</h1>
//         </div>

//         {status === "verifying" && (
//           <>
//             <div className="spinner" style={{ margin: "24px auto" }} />
//             <p style={{ color: "var(--text-secondary)" }}>
//               Verifying your email...
//             </p>
//           </>
//         )}

//         {status === "success" && (
//           <>
//             <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
//             <h2
//               style={{
//                 fontSize: "22px",
//                 fontWeight: 700,
//                 marginBottom: "8px",
//               }}
//             >
//               Email Verified!
//             </h2>
//             <p
//               style={{
//                 color: "var(--text-secondary)",
//                 fontSize: "14px",
//                 marginBottom: "24px",
//               }}
//             >
//               {message}
//             </p>
//             <Link href="/login" className="btn btn-primary">
//               Go to Login
//             </Link>
//           </>
//         )}

//         {status === "error" && (
//           <>
//             <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
//             <h2
//               style={{
//                 fontSize: "22px",
//                 fontWeight: 700,
//                 marginBottom: "8px",
//               }}
//             >
//               Verification Failed
//             </h2>
//             <p
//               style={{
//                 color: "var(--text-secondary)",
//                 fontSize: "14px",
//                 marginBottom: "24px",
//               }}
//             >
//               {message}
//             </p>
//             <Link href="/login" className="btn btn-secondary">
//               Back to Login
//             </Link>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function VerifyPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="loading-container">
//           <div className="spinner" />
//         </div>
//       }
//     >
//       <VerifyContent />
//     </Suspense>
//   );
// }
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import http from "@/lib/http";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [resendStatus, setResendStatus] = useState("idle"); // idle | sending | sent | error

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    const verify = async () => {
      try {
        const res = await http.post("/auth/verify", { token });
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification failed. Token may be expired."
        );
      }
    };

    verify();
  }, [token]);

  const handleResend = async () => {
    setResendStatus("sending");
    try {
      await http.post("/auth/resend-verification", { token });
      setResendStatus("sent");
    } catch (err) {
      setResendStatus("error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-logo">
          <h1>MyCourses</h1>
        </div>

        {status === "verifying" && (
          <>
            <div className="spinner" style={{ margin: "24px auto" }} />
            <p style={{ color: "var(--text-secondary)" }}>
              Verifying your email...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              Email Verified!
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                marginBottom: "24px",
              }}
            >
              {message}
            </p>
            <Link href="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              Verification Failed
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                marginBottom: "24px",
              }}
            >
              {message}
            </p>
            <button
              className="btn btn-primary"
              onClick={handleResend}
              disabled={resendStatus === "sending" || resendStatus === "sent"}
              style={{ marginBottom: "10px", width: "100%" }}
            >
              {resendStatus === "sending"
                ? "Sending..."
                : resendStatus === "sent"
                ? "Email Sent!"
                : "Resend Verification Email"}
            </button>
            {resendStatus === "error" && (
              <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
                Failed to resend. Please try again.
              </p>
            )}
            <Link href="/login" className="btn btn-secondary" style={{ display: "block" }}>
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="loading-container">
          <div className="spinner" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
