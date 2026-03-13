import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/auth";
import { normalizeRole } from "@/lib/authHelpers";

interface ProtectedRouteProps {
    /** If provided, only these roles can access the route */
    allowedRoles?: UserRole[];
    /** Optional children — if omitted, renders <Outlet /> instead */
    children?: React.ReactNode;
}

/**
 * Works two ways:
 *   1. As a layout route:  <Route element={<ProtectedRoute />}> ... </Route>
 *   2. Wrapping a layout:  <ProtectedRoute><DashboardLayout /></ProtectedRoute>
 */
export default function ProtectedRoute({
    allowedRoles,
    children
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
                Loading…
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const role = normalizeRole({
            role: user.role,
            profile: user.profile
        });
        if (!allowedRoles.includes(role as UserRole)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <>{children ?? <Outlet />}</>;
}
