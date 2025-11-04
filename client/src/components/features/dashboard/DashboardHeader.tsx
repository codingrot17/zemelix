import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
    HiChevronDown,
    HiOutlineBell,
    HiOutlineQuestionMarkCircle,
    HiOutlineUser
} from "react-icons/hi";
import { FaCog } from "react-icons/fa";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
    onToggleSidebar: () => void;
}

export default function DashboardHeader({
    onToggleSidebar
}: DashboardHeaderProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const alerts = [
        "New order placed",
        "Stock running low",
        "New reservation confirmed"
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    // ✅ Safe fallback for initials and user data
    const initials = user?.name
        ? user.name
              .split(" ")
              .map(n => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : "U";

    // ✅ Early return for loading or null user
    if (!user) {
        return (
            <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
                <div className="mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex gap-6 items-center">
                        <button
                            onClick={onToggleSidebar}
                            className="lg:hidden p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                            aria-label="Toggle sidebar"
                        >
                            <Menu className="w-6 h-6 text-foreground" />
                        </button>
                        <Link to="/" className="flex items-center gap-2">
                            <img
                                src="/images/brand-light.jpg"
                                alt="Zemelix"
                                className="h-10 w-10 object-contain rounded-full shadow-md block dark:hidden"
                            />
                            <img
                                src="/images/brand-dark.jpg"
                                alt="Zemelix"
                                className="h-10 w-10 object-contain rounded-full hidden dark:block shadow-md"
                            />
                            
                              <span className="font-semibold text-foreground">
                                Zemelix
                            </span>
                          
                        </Link>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Loading user...
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
            <div className="mx-auto px-4 py-3 flex items-center justify-between">
                {/* Left section */}
                <div className="flex gap-2 items-center">
                    {/* Sidebar toggle for mobile */}
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="w-6 h-6 text-foreground" />
                    </button>

                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src="/images/brand-light.jpg"
                            alt="Zemelix"
                            className="h-10 w-10 object-contain rounded-full shadow-md block dark:hidden"
                        />
                        <img
                            src="/images/brand-dark.jpg"
                            alt="Zemelix"
                            className="h-10 w-10 object-contain rounded-full hidden dark:block shadow-md"
                        />
                        <span className="font-semibold text-foreground">
                            Zemelix
                        </span>
                    </Link>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="relative p-1 rounded-sm text-foreground hover:bg-muted hover:text-primary"
                                aria-label="Notifications"
                            >
                                <HiOutlineBell className="w-5 h-5" />
                                {alerts.length > 0 && (
                                    <span className="absolute -top-1 -right-1 text-primary-foreground bg-primary text-xs flex items-center justify-center rounded-full w-4 h-4">
                                        {alerts.length}
                                    </span>
                                )}
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="center"
                            className="w-60 bg-card border border-border"
                        >
                            {alerts.map((alert, i) => (
                                <DropdownMenuItem
                                    key={i}
                                    className="text-sm py-2 px-3 flex items-center text-foreground hover:bg-muted hover:text-primary"
                                >
                                    {alert}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="text-foreground hover:text-primary flex items-center gap-2"
                                aria-label="Account"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                                    {initials}
                                </div>
                                <div className="hidden sm:flex flex-col text-sm text-left">
                                    <span className="font-bold">
                                        {user.name}
                                    </span>
                                </div>
                                <HiChevronDown />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="profile bg-card border border-border rounded-lg"
                            align="end"
                        >
                            <DropdownMenuItem className="pt-4 text-sm" asChild>
                                <div className="text-center mb-2">
                                    <h2 className="text-xl font-bold text-primary">
                                        {user.name}
                                    </h2>
                                    <span className="capitalize font-bold text-secondary-foreground">
                                        {user.profile?.role ?? "User"}
                                    </span>
                                </div>
                            </DropdownMenuItem>
                            <hr />

                            <DropdownMenuItem asChild>
                                <Link
                                    to="/account"
                                    className="text-sm py-2 px-3 flex items-center text-foreground hover:bg-muted hover:text-primary"
                                >
                                    <HiOutlineUser className="mr-2 text-lg" />
                                    <span>View profile</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Link
                                    to="/settings"
                                    className="text-sm py-2 px-3 flex items-center text-foreground hover:bg-muted hover:text-primary"
                                >
                                    <FaCog className="mr-2 text-lg" />
                                    <span>Account Settings</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Link
                                    to="/help"
                                    className="text-sm py-2 px-3 flex items-center text-foreground hover:bg-muted hover:text-primary"
                                >
                                    <HiOutlineQuestionMarkCircle className="mr-2 text-lg" />
                                    <span>Need Help?</span>
                                </Link>
                            </DropdownMenuItem>

                            <hr />

                            <DropdownMenuItem>
                                <Button
                                    variant="destructive"
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    <LogOut />
                                    <span>Sign Out</span>
                                </Button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
