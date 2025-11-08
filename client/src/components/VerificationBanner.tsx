// src/components/VerificationBanner.tsx
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function VerificationBanner() {
  const auth = useAuth();
  if (!auth) return null;

  const { isVerified, resendVerification, verificationSent } = auth;
  const [cooldown, setCooldown] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (isVerified) return null;

  const handleResend = async () => {
    if (cooldown) return;
    setCooldown(true);
    setMessage(null);

    try {
      await resendVerification();
      setMessage("✅ Verification email sent! Check your inbox.");
    } catch (error: any) {
      setMessage("❌ Failed to resend. Please log in again or try later.");
      console.error("Resend verification error:", error?.message || error);
    } finally {
      // 30-second cooldown
      setTimeout(() => setCooldown(false), 30000);
    }
  };

  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded-md text-sm flex flex-col sm:flex-row justify-between items-center gap-2">
      <span>
        Please verify your email to unlock full access.
        {verificationSent ? " Check your inbox!" : ""}
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={handleResend}
          disabled={cooldown}
          className={`px-3 py-1 text-xs rounded transition ${
            cooldown
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-yellow-300 hover:bg-yellow-400"
          }`}
        >
          {cooldown ? "Wait..." : "Resend Email"}
        </button>

        {message && (
          <span className="text-xs text-gray-700 font-medium">{message}</span>
        )}
      </div>
    </div>
  );
}
