import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PageLayout from "@/components/layouts/PageLayout";
import DashboardLayout from "@/components/layouts/DashboardLayout";

// Public Pages
import HomePage from "@/pages/home/Home";
import { CollectionsPage } from "@/pages/collections/CollectionsPage";
import { SingleCollectionPage } from "@/pages/collections/SingleCollectionPage";
import ProductDetailPage from "@/pages/product/ProductDetailPage";

// Auth Pages
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import Unauthorized from "@/pages/auth/Unauthorized";
import Verify from "@/pages/auth/Verify";

// Dashboard Pages
import Dashboard from "@/pages/dashboard/Dashboard";
import AdminDashboard from "@/pages/dashboard/admin/AdminDashboard";
import SellerDashboard from "@/pages/dashboard/seller/SellerDashboard";
import CustomerDashboard from "@/pages/dashboard/customer/CustomerDashboard";

// ── Admin sub-pages ───────────────────────────────────────────────────────────
import AdminUsers from "@/pages/dashboard/admin/Users";
import AdminOrders from "@/pages/dashboard/admin/AdminOrders";
import AdminProducts from "@/pages/dashboard/admin/AdminProducts";
import AdminAnalytics from "@/pages/dashboard/admin/AdminAnalytics";
import AdminReports from "@/pages/dashboard/admin/AdminReports";
import AdminMarketing from "@/pages/dashboard/admin/AdminMarketing";
import AdminNotifications from "@/pages/dashboard/admin/AdminNotifications";
import AdminFinance from "@/pages/dashboard/admin/AdminFinance";
import AdminSettings from "@/pages/dashboard/admin/AdminSettings";

// ── Seller sub-pages ──────────────────────────────────────────────────────────
import SellerProducts from "@/pages/dashboard/seller/Products";
import SellerOrders from "@/pages/dashboard/seller/SellerOrders";
import SellerAnalytics from "@/pages/dashboard/seller/SellerAnalytics";
import SellerProfile from "@/pages/dashboard/seller/SellerProfile";
import SellerNotifications from "@/pages/dashboard/seller/SellerNotifications";
import SellerSettings from "@/pages/dashboard/seller/SellerSettings";

// ── Customer/User sub-pages ───────────────────────────────────────────────────
import UserOrdersPage from "@/pages/dashboard/user/UserOrdersPage";
import UserFavorites from "@/pages/dashboard/user/UserFavorites";
import UserProfile from "@/pages/dashboard/user/UserProfile";
import UserNotifications from "@/pages/dashboard/user/UserNotifications";
import UserWallet from "@/pages/dashboard/user/UserWallet";
import UserSettings from "@/pages/dashboard/user/UserSettings";

// ── Public stub pages ─────────────────────────────────────────────────────────
import SellersPage from "@/pages/public/SellersPage";
import BlogPage from "@/pages/public/BlogPage";
import AboutPage from "@/pages/public/AboutPage";
import FaqPage from "@/pages/public/FaqPage";
import ContactPage from "@/pages/public/ContactPage";
import SupportPage from "@/pages/public/SupportPage";
import TermsPage from "@/pages/public/TermsPage";
import PrivacyPage from "@/pages/public/PrivacyPage";
import CookiesPage from "@/pages/public/CookiesPage";
import AccountPage from "@/pages/public/AccountPage";
import OrdersPage from "@/pages/public/OrdersPage";
import WishlistPage from "@/pages/public/WishlistPage";
import SettingsPage from "@/pages/public/SettingsPage";
import CategoryPage from "@/pages/public/CategoryPage";

// Guards
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Vendor Upgrade
import VendorSetupForm from "@/pages/vendor/VendorSetupForm";
import UpgradeGate from "@/components/vendor/UpgradeGate";

function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm">
            Loading…
        </div>
    );
}
export default function AppRoutes() {
    return (
        <Suspense fallback={<PageLoader />}>
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
                    <Route path="product/:id" element={<ProductDetailPage />} />
                    <Route path="category/:id" element={<CategoryPage />} />
                    <Route path="sellers" element={<SellersPage />} />
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="faq" element={<FaqPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="support" element={<SupportPage />} />
                    <Route path="terms" element={<TermsPage />} />
                    <Route path="privacy" element={<PrivacyPage />} />
                    <Route path="cookies" element={<CookiesPage />} />
                    {/* Shortcut account routes — require auth */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="account" element={<AccountPage />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="wishlist" element={<WishlistPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
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
                    <Route
                        element={<ProtectedRoute allowedRoles={["admin"]} />}
                    >
                        <Route path="admin">
                            <Route index element={<AdminDashboard />} />
                            <Route path="users" element={<AdminUsers />} />
                            <Route path="orders" element={<AdminOrders />} />
                            <Route
                                path="products"
                                element={<AdminProducts />}
                            />
                            <Route
                                path="analytics"
                                element={<AdminAnalytics />}
                            />
                            <Route path="reports" element={<AdminReports />} />
                            <Route
                                path="marketing"
                                element={<AdminMarketing />}
                            />
                            <Route
                                path="notifications"
                                element={<AdminNotifications />}
                            />
                            <Route path="finance" element={<AdminFinance />} />
                            <Route
                                path="settings"
                                element={<AdminSettings />}
                            />
                        </Route>
                    </Route>

                    {/* Seller Routes */}
                    <Route
                        element={<ProtectedRoute allowedRoles={["seller"]} />}
                    >
                        <Route path="seller">
                            <Route index element={<SellerDashboard />} />
                            <Route
                                path="products"
                                element={<SellerProducts />}
                            />
                            <Route path="orders" element={<SellerOrders />} />
                            <Route
                                path="analytics"
                                element={<SellerAnalytics />}
                            />
                            <Route path="profile" element={<SellerProfile />} />
                            <Route
                                path="notifications"
                                element={<SellerNotifications />}
                            />
                            <Route
                                path="settings"
                                element={<SellerSettings />}
                            />
                        </Route>
                    </Route>

                    {/* Customer Routes */}
                    <Route
                        element={<ProtectedRoute allowedRoles={["customer"]} />}
                    >
                        <Route path="user">
                            <Route index element={<CustomerDashboard />} />
                            <Route path="orders" element={<UserOrdersPage />} />
                            <Route
                                path="favorites"
                                element={<UserFavorites />}
                            />
                            <Route path="profile" element={<UserProfile />} />
                            <Route
                                path="notifications"
                                element={<UserNotifications />}
                            />
                            <Route path="wallet" element={<UserWallet />} />
                            <Route path="settings" element={<UserSettings />} />
                        </Route>
                    </Route>
                </Route>

                {/* ========================================
                404 FALLBACK
            ======================================== */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}
