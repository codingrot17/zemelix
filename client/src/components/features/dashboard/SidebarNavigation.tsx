import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { sidebarNavConfig } from "@/config/sidebarNav";
import { useAuth } from "@/contexts/AuthContext";


export default function SidebarNavigation({ mobile = false, onClose }) {
  const { user } = useAuth();
  const navItems = sidebarNavConfig[user?.role] || [];

  return (
    <aside
      className={`${
        mobile
          ? "fixed inset-y-0 left-0 w-64 bg-white shadow-md z-50"
          : "hidden lg:block w-64 bg-white border-r border-gray-200 sticky top-0 h-screen"
      }`}
    >
      <nav className="mt-20 px-4 space-y-2">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
