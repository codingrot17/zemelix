// client/src/routes/AppRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PageLayout from "@/components/layouts/PageLayout";
import DashboardLayout from "@/components/layouts/DashboardLayout";

// Public Pages
import HomePage from "@/pages/home/Home";
import { CollectionsPage } from "@/pages/collections/CollectionsPage";
import { SingleCollectionPage } from "@/pages/collections/SingleCollectionPage";

// Auth Pages
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import Unauthorized from "@/pages/auth/Unauthorized";
import Verify from "@/pages/auth/Verify";

// Dashboard Pages
import Dashboard from "@/pages/dashboard/Dashboard";
import AdminUsers from "@/pages/dashboard/admin/Users";
import SellerProducts from "@/pages/dashboard/seller/Products";
import CustomerOrders from "@/pages/dashboard/customer/Orders";

// Guards
import ProtectedRoute from "@/components/ProtectedRoute";

// Vendor Upgrade
import VendorSetupForm from "@/pages/vendor/VendorSetupForm";
import UpgradeGate from "@/components/vendor/UpgradeGate";

export default function AppRoutes() {
    return (
        <Routes>
            {/* ========================================
                PUBLIC ROUTES
            ======================================== */}
            <Route path="/" element={<PageLayout />}>
                <Route index element={<HomePage />} />
                <Route path="collections" element={<CollectionsPage />} />
                <Route
                    path="collections/:slug"
                    element={<SingleCollectionPage />}
                />
            </Route>

            {/* ========================================
                AUTH ROUTES (NO GUARD)
            ======================================== */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/verify" element={<Verify />} />

            {/* ========================================
                VENDOR UPGRADE (SPECIAL GUARD)
            ======================================== */}
            <Route
                path="/vendor/upgrade"
                element={
                    <UpgradeGate>
                        <VendorSetupForm />
                    </UpgradeGate>
                }
            />

            {/* ========================================
                DASHBOARD (PROTECTED)
            ======================================== */}
            <Route path="/dashboard" element={<DashboardLayout />}>
                {/* Main Dashboard - All authenticated users */}
                <Route element={<ProtectedRoute />}>
                    <Route index element={<Dashboard />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                    <Route path="admin/users" element={<AdminUsers />} />
                    {/* Add more admin routes here */}
                </Route>

                {/* Seller Routes */}
                <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>
                    <Route
                        path="seller/products"
                        element={<SellerProducts />}
                    />
                    {/* Add more seller routes here */}
                </Route>

                {/* Customer Routes */}
                <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
                    <Route path="user/orders" element={<CustomerOrders />} />
                    {/* Add more customer routes here */}
                </Route>
            </Route>

            {/* ========================================
                404 FALLBACK
            ======================================== */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
