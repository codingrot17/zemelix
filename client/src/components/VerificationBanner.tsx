// src/components/VerificationBanner.tsx
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function VerificationBanner() {
    const auth = useAuth();
    if (!auth) return null;
    const { isVerified, resendVerification, verificationSent } = auth;

    if (isVerified) return null;

    return (
        <div className="bg-yellow-100 border border-yellow-400 text-...w-800 p-3 rounded-md text-sm flex justify-between items-center">
            <span>
                Please verify your email to unlock full access.
                {verificationSent ? " Check your inbox." : ""}
            </span>
            {!verificationSent && (
                <button
                    onClick={resendVerification}
                    className="ml-3 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                    Resend
                </button>
            )}
        </div>
    );
}
