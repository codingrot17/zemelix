import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu } from "lucide-react";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

export default function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      <h1 className="text-xl font-semibold text-gray-900">
        {user ? `Welcome, ${user.name}` : "Dashboard"}
      </h1>

      <div className="flex items-center space-x-4">
        {/* Future: Notifications, Profile dropdown, etc. */}

        <button
          onClick={logout}
          className="flex items-center gap-1 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
