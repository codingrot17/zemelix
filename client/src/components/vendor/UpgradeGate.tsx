import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canUpgradeToVendor } from "@/contexts/AuthContext";

const UpgradeGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    // Temporary debug logs (remove when satisfied)
    console.log("USER ROLE:", user?.role);
    console.log("EMAIL VERIFIED:", user?.emailVerification);
    console.log("ACCOUNT STATUS:", user?.profile?.accountStatus);
    console.log("ELIGIBLE:", canUpgradeToVendor(user));

    // Still checking session
    if (loading) {
        return (
            <div className="p-6 text-center text-gray-600">
                Checking account...
            </div>
        );
    }

    // Not logged in → go to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Must verify email first
    if (!user.emailVerification) {
        return <Navigate to="/verify" replace />;
    }

    // Already seller → redirect to seller dashboard
    if (user.role === "seller") {
        return <Navigate to="/vendor/dashboard" replace />;
    }

    // Customer but *not* eligible (should be rare now)
    if (!canUpgradeToVendor(user)) {
        return (
            <div className="p-6 text-center text-red-500 font-medium">
                You are not eligible to access vendor onboarding.
            </div>
        );
    }

    // All green → allow access
    return <>{children}</>;
};

export default UpgradeGate;
