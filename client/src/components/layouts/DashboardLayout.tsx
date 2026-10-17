import React, { useState } from "react";
import SidebarNavigation from "../features/dashboard/SidebarNavigation";
import DashboardHeader from "../features/dashboard/DashboardHeader";
import DashboardFooter from "../features/dashboard/DashboardFooter";
import VerificationBanner from "@/components/VerificationBanner";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen min-w-0 bg-background text-foreground">
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

            <div className="flex min-w-0 flex-1 flex-col">
                <DashboardHeader
                    onToggleSidebar={() => setSidebarOpen(prev => !prev)}
                />
                <VerificationBanner />
                <main className="container mx-auto min-w-0 flex-grow px-3 py-4 sm:px-4 sm:py-6">
                    <Outlet />
                </main>
                <DashboardFooter />
            </div>
        </div>
    );
}
