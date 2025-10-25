import React, { useState } from "react";
import SidebarNavigation from "../features/dashboard/SidebarNavigation";
import DashboardHeader from "../features/dashboard/DashboardHeader";
import DashboardFooter from "../features/dashboard/DashboardFooter";
import VerificationBanner from "@/components/VerificationBanner";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <SidebarNavigation />
            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    <div
                        className="fixed inset-0 bg-black opacity-50"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <SidebarNavigation
                        mobile
                        onClose={() => setSidebarOpen(false)}
                    />
                </div>
            )}

            <div className="flex-1 flex flex-col">
                <DashboardHeader
                    onToggleSidebar={() => setSidebarOpen(prev => !prev)}
                />
                <VerificationBanner />
                <main className="flex-grow container mx-auto px-4 py-6">
                    <Outlet />
                </main>
                <DashboardFooter />
            </div>
        </div>
    );
}
