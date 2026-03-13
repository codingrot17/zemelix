// SidebarNavigation.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { sidebarNavConfig } from "@/config/sidebarNav";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeRole } from "@/lib/authHelpers";
import type { UserRole } from "@/types/auth";

interface SidebarNavigationProps {
    mobile?: boolean;
    onClose?: () => void;
}

export default function SidebarNavigation({
    mobile = false,
    onClose
}: SidebarNavigationProps) {
    const { user } = useAuth();

    // ── Safe role resolution ───────────────────────────────────────────────
    // normalizeRole handles: null user, "vendor"→"seller", unknown strings→"customer"
    // We pass both profile.role and top-level role so it picks the right one.
    const resolvedRole: UserRole = normalizeRole({
        profile: user?.profile ?? null,
        role: user?.role ?? null
    });

    // sidebarNavConfig only has keys for valid UserRole values.
    // If resolvedRole is somehow not a key (shouldn't happen), fall back to [].
    const navItems = sidebarNavConfig[resolvedRole] ?? [];

    return (
        <aside
            className={`${
                mobile
                    ? "fixed inset-y-0 left-0 w-64 bg-sidebar shadow-md z-50"
                    : "hidden lg:block w-64 bg-sidebar border-r border-sidebar-border sticky top-0 h-screen"
            }`}
        >
            <nav className="mt-20 px-4 space-y-2">
                {navItems.length === 0 ? (
                    // Graceful empty state — won't show a blank sidebar
                    <p className="text-xs text-sidebar-foreground/50 px-3 py-2">
                        No navigation available.
                    </p>
                ) : (
                    navItems.map(({ label, to, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                                    isActive
                                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                }`
                            }
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </NavLink>
                    ))
                )}
            </nav>
        </aside>
    );
}
