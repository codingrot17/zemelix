import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RequireRoleProps {
  allowedRoles: string[];
  children: React.ReactElement;
}

const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireRole;
