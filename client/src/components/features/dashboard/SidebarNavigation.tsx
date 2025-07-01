// SidebarNavigation.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { sidebarNavConfig } from "@/config/sidebarNav";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarNavigationProps {
  mobile?: boolean;
  onClose?: () => void; // <-- make optional
}

export default function SidebarNavigation({
  mobile = false,
  onClose,
}: SidebarNavigationProps) {
  const { user } = useAuth();
  const navItems = sidebarNavConfig[user?.role] || [];

  return (
    <aside
      // bg-sidebar: Uses the dedicated sidebar background color, which can be distinct.
      // border-sidebar-border: Uses the sidebar-specific border color.
      className={`${
        mobile
          ? "fixed inset-y-0 left-0 w-64 bg-sidebar shadow-md z-50"
          : "hidden lg:block w-64 bg-sidebar border-r border-sidebar-border sticky top-0 h-screen"
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
                  ? // Active state:
                    // bg-sidebar-primary: Uses a specific primary color for the sidebar's active item background.
                    // text-sidebar-primary-foreground: Ensures text on the sidebar primary background is readable.
                    "bg-sidebar-primary text-sidebar-primary-foreground"
                  : // Inactive state:
                    // text-sidebar-foreground: Default text color for inactive sidebar items.
                    // hover:bg-sidebar-accent: Subtle hover background for sidebar items.
                    // hover:text-sidebar-accent-foreground: Ensures text remains readable on hover.
                    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`
            }
          >
            {/* Icon color inherits from the parent NavLink's text color */}
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
