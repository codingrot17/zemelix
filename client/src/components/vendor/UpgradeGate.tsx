import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canUpgradeToVendor } from "@/contexts/AuthContext";

const UpgradeGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading)
        return <div className="p-6 text-center">Checking account...</div>;

    if (!user) return <Navigate to="/login" replace />;

    // email not verified
    if (!user.emailVerification) {
        // optionally: redirect to a verify email page or show message
        return <Navigate to="/verify" replace />;
    }

    // if already seller or admin, don't allow onboarding
    if (!canUpgradeToVendor(user)) {
        // If user is customer but accountStatus not active, show a message
        if (user.role === "seller")
            return <Navigate to="/dashboard/seller" replace />;
        return (
            <div className="p-6">
                You are not eligible to access this onboarding.
            </div>
        );
    }

    return <>{children}</>;
};

export default UpgradeGate;
