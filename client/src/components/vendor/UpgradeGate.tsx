import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, canUpgradeToVendor } from "@/contexts/AuthContext";

/**
 * UpgradeGate — FINAL REFINED VERSION
 *
 * Rules:
 * 1. Must be logged in
 * 2. Must have verified email
 * 3. Must NOT already be a vendor
 * 4. Must be eligible to upgrade
 *
 * This version relies entirely on AuthContext (the correct source of truth).
 */
const UpgradeGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    // Still checking auth
    if (loading) {
        return (
            <div className="p-6 text-center text-gray-600">
                Checking account…
            </div>
        );
    }

    // Not logged in ⇒ go to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Email not verified ⇒ send to verify
    if (!user.emailVerification) {
        return <Navigate to="/verify" replace />;
    }

    // Already a vendor ⇒ send to vendor dashboard
    if (
        user.role === "vendor" ||
        user.role === "seller" ||
        user.profile?.vendorId
    ) {
        return <Navigate to="/dashboard/seller" replace />;
    }

    // Must be eligible to upgrade
    if (!canUpgradeToVendor(user)) {
        return (
            <div className="p-6 text-center text-red-500 font-medium">
                You are not eligible to access vendor onboarding.
            </div>
        );
    }

    // Allowed → render wizard
    return <>{children}</>;
};

export default UpgradeGate;
