// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/auth";

interface ProtectedRouteProps {
    allowedRoles?: UserRole[]; // optional: if omitted, any authenticated user is allowed
}

/**
 * ProtectedRoute guards routes based on authentication and optional role list.
 *
 * Behavior:
 * - While auth is loading: render a placeholder (prevent premature redirect).
 * - If not authenticated: redirect to /auth/login with `redirect=` query param.
 * - If allowedRoles is provided and the user's role is not included: redirect to /auth/unauthorized.
 * - Otherwise: render nested routes (Outlet).
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user, loading } = useAuth() as any;
    const location = useLocation();

    // Wait until auth finished initializing to avoid false negatives
    if (loading) {
        // return a small loader or null to avoid flashing redirects
        return <div aria-live="polite">Loading...</div>;
    }

    // Not logged in -> redirect to login, preserving intended path
    if (!user) {
        const redirectTo = `/auth/login?redirect=${encodeURIComponent(
            location.pathname
        )}`;
        return <Navigate to={redirectTo} replace />;
    }

    // If allowedRoles is provided, check membership; if not provided, allow all authenticated users
    if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
        const userRole = user?.profile?.role ?? user?.role ?? null;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return <Navigate to="/auth/unauthorized" replace />;
        }
    }

    // Authenticated and authorized → render children / nested routes
    return <Outlet />;
};

export default ProtectedRoute;
