import React from "react";
import { useAuth } from "@/contexts/AuthContext";

import AdminDashboard from "./admin/AdminDashboard";
import SellerDashboard from "./seller/SellerDashboard";
import CustomerDashboard from "./customer/CustomerDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "seller":
      return <SellerDashboard />;
    case "customer":
    default:
      return <CustomerDashboard />;
  }
}
