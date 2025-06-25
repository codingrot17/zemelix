import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import SellerDashboard from "../pages/seller/SellerDashboard";
import CustomerDashboard from "../pages/customer/CustomerDashboard";

const AuthRoutes: React.FC = () => (
  <Routes>
    {/* Admin routes */}
    <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      {/* Add more admin-only routes here */}
    </Route>

    {/* Seller routes */}
    <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>
      <Route path="/seller/dashboard" element={<SellerDashboard />} />
      {/* Add more seller-only routes here */}
    </Route>

    {/* Customer routes */}
    <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
      <Route path="/customer/dashboard" element={<CustomerDashboard />} />
      {/* Add more customer-only routes here */}
    </Route>
  </Routes>
);

export default AuthRoutes;
