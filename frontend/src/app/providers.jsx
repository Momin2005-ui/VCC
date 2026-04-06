"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastProvider } from "@/components/Toast";

export default function Providers({ children }) {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <ToastProvider>{children}</ToastProvider>
    </GoogleOAuthProvider>
  );
}
