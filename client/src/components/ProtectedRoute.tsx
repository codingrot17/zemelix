import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  allowedRoles: UserRole[]; // Roles allowed to access this route
}

/**
 * ProtectedRoute guards routes based on authentication and role.
 * - If user is not logged in, redirects to /login.
 * - If user role is not allowed, redirects to /unauthorized.
 * - Otherwise, renders child routes (Outlet).
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  // Not logged in? Redirect to login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but role not allowed? Redirect to unauthorized page.
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized: render the route's children.
  return <Outlet />;
};

export default ProtectedRoute;
