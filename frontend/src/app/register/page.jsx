"use client";

import { useState } from "react";
import Link from "next/link";
import http from "@/lib/http";
import { GoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.endsWith("@iiitdwd.ac.in")) {
      setError("Please use your college email (@iiitdwd.ac.in)");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await http.post("/auth/register", { email, password });
      setSuccess(res.data.message || "Registration successful");
      setShowVerify(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setIsLoading(true);
    try {
      const res = await http.post("/auth/google", {
        token: credentialResponse.credential,
      });

      if (res.data.success) {
        window.location.href = "/";
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Google login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setSendingEmail(true);
    setError("");
    try {
      const res = await http.post("/auth/sendEmail", { email });
      setSuccess(res.data.message || "Verification email sent! Check your inbox.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send verification email."
      );
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>MyCourses</h1>
          <p>Create your account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {!showVerify ? (
          <>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="reg-email">College Email</label>
                <input
                  id="reg-email"
                  type="email"
                  className="form-input"
                  placeholder="you@iiitdwd.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  className="form-input"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner spinner-sm" /> Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div style={{ marginTop: "24px" }}>
              <div className="divider">or continue with</div>
              <div
                className="google-btn-wrapper"
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google sign-up failed")}
                  theme="filled_black"
                  size="large"
                  width="360"
                  text="signup_with"
                />
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✉️</div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
              Verify Your Email
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                marginBottom: "24px",
              }}
            >
              We need to verify <strong>{email}</strong> before you can log in.
              Click below to receive a verification link.
            </p>
            <button
              className="btn btn-accent btn-full"
              onClick={handleSendVerification}
              disabled={sendingEmail}
            >
              {sendingEmail ? (
                <>
                  <span className="spinner spinner-sm" /> Sending...
                </>
              ) : (
                "Send Verification Email"
              )}
            </button>
          </div>
        )}

        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}