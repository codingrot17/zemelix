import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "@/services/auth.service";

export default function Verify() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const userId = params.get("userId");
    const secret = params.get("secret");

    if (userId && secret) {
      verifyEmail(userId, secret)
        .then(() => {
          setStatus("✅ Email verified successfully!");
          setTimeout(() => navigate("/dashboard"), 2000);
        })
        .catch(() => setStatus("❌ Verification failed. Please try again."));
    } else {
      setStatus("Invalid verification link.");
    }
  }, []);

  return (
    <div className="p-4 text-center text-gray-800">
      <h2 className="text-xl font-semibold mb-2">{status}</h2>
      <p className="text-sm text-gray-600">Redirecting if successful...</p>
    </div>
  );
}
