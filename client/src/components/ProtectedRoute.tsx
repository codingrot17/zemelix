// client/src/components/ProtectedRoute.tsx
/**
 * Unified route protection component
 * Replaces both ProtectedRoute and RequireRole
 */

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasRole } from "@/lib/authHelpers";
import type { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
    /**
     * Allowed roles for this route
     * If empty/undefined, any authenticated user can access
     */
    allowedRoles?: UserRole[];

    /**
     * Require email verification
     */
    requireVerification?: boolean;

    /**
     * Redirect path for unauthorized users
     */
    unauthorizedRedirect?: string;
}

export default function ProtectedRoute({
    allowedRoles,
    requireVerification = false,
    unauthorizedRedirect = "/unauthorized"
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // --------------------------------------------------
    // LOADING STATE
    // --------------------------------------------------
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // NOT AUTHENTICATED
    // --------------------------------------------------
    if (!user) {
        const redirectPath = `/login?redirect=${encodeURIComponent(
            location.pathname + location.search
        )}`;
        return <Navigate to={redirectPath} replace />;
    }

    // --------------------------------------------------
    // REQUIRE EMAIL VERIFICATION
    // --------------------------------------------------
    if (requireVerification && !user.emailVerification) {
        return <Navigate to="/verify" replace />;
    }

    // --------------------------------------------------
    // ROLE CHECK
    // --------------------------------------------------
    if (allowedRoles && allowedRoles.length > 0) {
        if (!hasRole(user, allowedRoles)) {
            return <Navigate to={unauthorizedRedirect} replace />;
        }
    }

    // --------------------------------------------------
    // AUTHORIZED - RENDER CHILDREN
    // --------------------------------------------------
    return <Outlet />;
}
