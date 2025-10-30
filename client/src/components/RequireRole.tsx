import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RequireRoleProps {
    allowedRoles: string[];
    children: React.ReactElement;
}

const RequireRole: React.FC<RequireRoleProps> = ({
    allowedRoles,
    children
}) => {
    const { user, loading } = useAuth();

    // ⏳ Wait until AuthContext finishes loading
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-600">
                Loading...
            </div>
        );
    }

    // 🔐 Redirect if no session
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 🚫 Redirect if user doesn’t have required role
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // ✅ Authorized
    return children;
};

export default RequireRole;
