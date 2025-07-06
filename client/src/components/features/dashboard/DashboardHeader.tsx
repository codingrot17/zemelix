import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiChevronDown,
  HiOutlineBell,
  HiOutlineQuestionMarkCircle,
  HiOutlineUser,
} from "react-icons/hi";
import { FaCog } from "react-icons/fa";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

export default function DashboardHeader({
  onToggleSidebar,
}: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const alerts = [
    "New order placed",
    "Stock running low",
    "New reservation confirmed",
  ];

  const handleLogout = () => {
    logout();
    navigate(`/login`);
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex gap-6">
          {/* Sidebar toggle for mobile */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>

          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-bold rounded">
              <Link to="/">
                <img
                  src="/images/brand-dark.jpg"
                  alt="Zemelix Brand Logo"
                  className="h-10 w-10 object-contain rounded-full hidden dark:block shadow-md"
                />
                <img
                  src="/images/brand-light.jpg"
                  alt="Zemelix Brand Logo"
                  className="h-10 w-10 object-contain rounded-full shadow-md block dark:hidden"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <div className="text-secondary-foreground">
            <ThemeToggle />
          </div>
          {/* Notification Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative p-1 rounded-sm text-foreground hover:bg-muted hover:text-primary"
                aria-label="Notification"
              >
                <HiOutlineBell className="w-5 h-5" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-primary-foreground bg-primary text-xs flex items-center justify-center rounded-full w-4 h-4">
                    {alerts.length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="center" className=" w-60 bg-card border border-border">
              {alerts.map((alert, i) => (
                <DropdownMenuItem key={i}  className="text-sm py-2 px-3 flex items-center text-foreground hover:bg-muted hover:text-primary">{alert}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
            {/* {showAlerts && (
              <div className="absolute right-0 mt-2 w-60 bg-card text-foreground border border-border rounded shadow-md z-50">
                <ul className="py-2 text-sm text-foreground max-h-60 overflow-y-auto">
                  {alerts.map((alert, i) => (
                    <li
                      key={i}
                      className="px-4 py-2 text-foreground hover:bg-muted hover:text-foreground"
                    >
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )} */}
          </DropdownMenu>

          {/* Profile dropdown trigger */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary"
                aria-label="Account"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col text-sm text-left">
                  <span className="font-bold">{user.name}</span>
                </div>
                <HiChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="profile bg-card border border-border rounded-lg"
              align="end"
            >
              <DropdownMenuItem className=" pt-4 text-sm" asChild>
                <div className="text-center mb-2">
                  <h2 className="text-xl font-bold text-primary">
                    {user.name}
                  </h2>
                  <span className="capitalize font-bold text-secondary-foreground">
                    {user.role}
                  </span>
                </div>
              </DropdownMenuItem>
              <hr />
              <DropdownMenuItem>
                <Link
                  to=""
                  className="text-sm py-2 px-3 flex items-center text-foreground hover:bg-muted hover:text-primary"
                >
                  <HiOutlineUser className="mr-2 text-lg" />
                  <span className="">View profile</span>
                </Link>
              </DropdownMenuItem>
              <hr />
              <DropdownMenuItem>
                <Link
                  to=""
                  className="text-sm py-2 px-3 flex items-center text-foreground hover:bg-muted hover:text-primary"
                >
                  <FaCog className="mr-2 text-lg" />
                  <span className="">Account Settings</span>
                </Link>
              </DropdownMenuItem>
              <hr />
              <DropdownMenuItem>
                <Link
                  to=""
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
                  className="w-full"
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
