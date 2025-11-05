// src/components/VerificationBanner.tsx
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function VerificationBanner() {
    const auth = useAuth();
    if (!auth) return null;

    const { isVerified, resendVerification, verificationSent } = auth;

    if (isVerified) return null;

    return (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded-md text-sm flex justify-between items-center">
            <span>
                Please verify your email to unlock full access.
                {verificationSent ? " Check your inbox!" : ""}
            </span>
            <button
                onClick={resendVerification}
                className="ml-3 px-3 py-1 bg-yellow-300 hover:bg-yellow-400 text-xs rounded"
            >
                Resend Email
            </button>
        </div>
    );
}
