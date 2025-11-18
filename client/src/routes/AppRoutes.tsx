import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";

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

// Vendor upgrade protection
import UpgradeGate from "@/components/vendor/UpgradeGate";

// Vendor wizard screens
import VendorWizardLayout from "@/pages/vendor/VendorWizardLayout";
import VendorWizardStart from "@/pages/vendor/VendorWizardStart";
import BusinessInfoStep from "@/pages/vendor/BusinessInfoStep";
import BrandingStep from "@/pages/vendor/BrandingStep";
import ReviewStep from "@/pages/vendor/ReviewStep";

import AdminUsers from "@/pages/dashboard/admin/Users";
import SellerProducts from "@/pages/dashboard/seller/Products";
import CustomerOrders from "@/pages/dashboard/customer/Orders";

import RequireRole from "@/components/RequireRole";

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/" element={<PageLayout />}>
                <Route index element={<HomePage />} />
                <Route path="/collections" element={<CollectionsPage />} />
                <Route
                    path="/collections/:slug"
                    element={<SingleCollectionPage />}
                />
            </Route>

            {/* ---------------- Vendor Onboarding Wizard ---------------- */}
            <Route
                path="/vendor/upgrade"
                element={
                    <UpgradeGate>
                        <VendorWizardLayout />
                    </UpgradeGate>
                }
            >
                {/* vendor onboarding steps */}
                <Route index element={<VendorWizardStart />} />
                <Route path="business-info" element={<BusinessInfoStep />} />
                <Route path="branding" element={<BrandingStep />} />
                <Route path="review" element={<ReviewStep />} />
            </Route>

            {/* Dashboard routes with role-based access */}
            <Route path="/dashboard" element={<DashboardLayout />}>
                {/* Smart dashboard home */}
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

                {/* Admin section */}
                <Route
                    path="admin"
                    element={
                        <RequireRole allowedRoles={["admin"]}>
                            <Outlet />
                        </RequireRole>
                    }
                >
                    <Route path="users" element={<AdminUsers />} />
                    {/* add more admin subroutes */}
                </Route>

                {/* Seller section */}
                <Route
                    path="seller"
                    element={
                        <RequireRole allowedRoles={["seller"]}>
                            <Outlet />
                        </RequireRole>
                    }
                >
                    <Route path="products" element={<SellerProducts />} />
                    {/* add more seller subroutes */}
                </Route>

                {/* Customer section */}
                <Route
                    path="user"
                    element={
                        <RequireRole allowedRoles={["customer"]}>
                            <Outlet />
                        </RequireRole>
                    }
                >
                    <Route path="orders" element={<CustomerOrders />} />
                    {/* add more customer subroutes */}
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;
