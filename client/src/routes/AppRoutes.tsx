import React from "react";
import { Routes, Route } from "react-router-dom";

// Public Page Imports
import HomePage from "@/pages/home/Home";
import { CollectionsPage } from "@/pages/collections/CollectionsPage";
import { SingleCollectionPage } from "@/pages/collections/SingleCollectionPage";
import PageLayout from "@/components/layouts/PageLayout";
import LoginPage from "@/pages/auth/login";
import Unauthorized from "@/pages/auth/Unauthorized";

// Protected Route Imports
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import SellerDashboard from "@/pages/seller/SellerDashboard";
import CustomerDashboard from "@/pages/customer/CustomerDashboard";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route element={<PageLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:slug" element={<SingleCollectionPage />} />
      </Route>
      
        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        </Route>
    </Routes>
  );
};

export default AppRoutes;
