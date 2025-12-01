import React from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";

import HomePage from "@/pages/home/Home";
import { CollectionsPage } from "@/pages/collections/CollectionsPage";
import { SingleCollectionPage } from "@/pages/collections/SingleCollectionPage";

import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/register";
import Unauthorized from "@/pages/auth/Unauthorized";
import Verify from "@/pages/auth/Verify";

import PageLayout from "@/components/layouts/PageLayout";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Dashboard from "@/pages/dashboard/Dashboard";

import RequireRole from "@/components/RequireRole";

import AdminUsers from "@/pages/dashboard/admin/Users";
import SellerProducts from "@/pages/dashboard/seller/Products";
import CustomerOrders from "@/pages/dashboard/customer/Orders";

// Vendor wizard routes
import VendorUpgradeRoutes from "@/routes/VendorUpgradeRoutes";

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Public Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/verify" element={<Verify />} />

            {/* Public pages */}
            <Route path="/" element={<PageLayout />}>
                <Route index element={<HomePage />} />
                <Route path="collections" element={<CollectionsPage />} />
                <Route
                    path="collections/:slug"
                    element={<SingleCollectionPage />}
                />
            </Route>

            {/* Vendor Upgrade */}
            {VendorUpgradeRoutes}

            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardLayout />}>
                {/* Visible to all authenticated roles */}
                <Route
                    index
                    element={
                        <RequireRole
                            allowedRoles={["admin", "seller", "customer"]}
                        >
                            <Dashboard />
                        </RequireRole>
                    }
                />

                {/* Admin */}
                <Route
                    path="admin"
                    element={
                        <RequireRole allowedRoles={["admin"]}>
                            <Outlet />
                        </RequireRole>
                    }
                >
                    <Route path="users" element={<AdminUsers />} />
                </Route>

                {/* Seller */}
                <Route
                    path="seller"
                    element={
                        <RequireRole allowedRoles={["seller"]}>
                            <Outlet />
                        </RequireRole>
                    }
                >
                    <Route path="products" element={<SellerProducts />} />
                </Route>

                {/* Customer */}
                <Route
                    path="user"
                    element={
                        <RequireRole allowedRoles={["customer"]}>
                            <Outlet />
                        </RequireRole>
                    }
                >
                    <Route path="orders" element={<CustomerOrders />} />
                </Route>
            </Route>

            {/* 404 → Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
