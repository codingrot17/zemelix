// DashboardHeader.tsx
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiChevronDown,
  HiOutlineBell,
  HiOutlineQuestionMarkCircle,
  HiOutlineUser,
} from "react-icons/hi";
import { FaArrowCircleLeft, FaCog } from "react-icons/fa";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

export default function DashboardHeader({
  onToggleSidebar,
}: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const dropdownRef = useRef(null);

  const alerts = [
    "New order placed",
    "Stock running low",
    "New reservation confirmed",
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setShowAlerts(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    // Header background and border:
    // bg-background: Uses the main background color, which adapts to light/dark mode.
    // border-border: Uses the border color, ensuring consistency for outlines.
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex gap-6">
          {/* Sidebar toggle for mobile */}
          <button
            onClick={onToggleSidebar}
            // hover:bg-muted: Provides a subtle hover effect using the muted background.
            // focus:ring-ring: Uses the ring color for focus outlines, enhancing accessibility.
            className="lg:hidden p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Toggle sidebar"
          >
            {/* text-foreground: Ensures the icon color contrasts well with the background. */}
            <Menu className="w-6 h-6 text-foreground" />
          </button>

          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            {/* The background color here is for a placeholder div if the image doesn't load immediately,
                or if you want a solid color behind the logo. Using 'bg-primary' for a brand accent. */}
            <div className="w-8 h-8 dark:bg-primary text-primary-foreground flex items-center justify-center font-bold rounded">
              <Link to="/">
                {/* Image sources remain the same, as they are external assets. */}
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
        <div className="flex items-center gap-4" ref={dropdownRef}>
          {/* text-secondary-foreground: Used for elements that should stand out but are not primary actions,
              often on a dark background in dark mode. */}
          <div className="text-secondary-foreground">
            <ThemeToggle />
          </div>
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              // text-foreground: Default icon color.
              // hover:bg-muted: Subtle background on hover.
              // hover:text-primary: Changes icon color to primary on hover for emphasis.
              className="relative p-1 rounded-sm text-foreground hover:bg-muted hover:text-primary"
            >
              <HiOutlineBell className="w-6 h-6" />
              {alerts.length > 0 && (
                <span
                  // bg-primary: Uses the primary brand color for the notification badge.
                  // text-primary-foreground: Ensures text on the primary background is readable.
                  className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full"
                >
                  {alerts.length}
                </span>
              )}
            </button>
            {showAlerts && (
              // bg-card: Used for dropdowns/modals, providing a distinct background.
              // text-foreground: Ensures text within the dropdown is readable.
              // border-border: Consistent border for UI elements.
              <div className="absolute right-0 mt-2 w-60 bg-card text-foreground border border-border rounded shadow-md z-50">
                <ul className="py-2 text-sm text-foreground max-h-60 overflow-y-auto">
                  {alerts.map((alert, i) => (
                    <li
                      key={i}
                      // text-foreground: Default text color for list items.
                      // hover:bg-muted: Subtle hover background for list items.
                      // hover:text-foreground: Ensures text remains readable on hover.
                      className="px-4 py-2 text-foreground hover:bg-muted hover:text-foreground"
                    >
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Profile dropdown trigger */}
          <button
            // hover:bg-muted: Subtle background on hover.
            // text-foreground: Default text/icon color.
            className="flex items-center gap-2 p-1 rounded hover:bg-muted text-foreground transition"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div
              // bg-primary: Uses the primary brand color for the user's initial circle.
              // text-primary-foreground: Ensures the initials are readable on the primary background.
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm"
            >
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-sm text-left">
              {/* text-foreground: Inherits the main text color. */}
              <span className="font-bold">
                {user.name}
              </span>
            </div>
            {/* text-foreground: Ensures the icon color contrasts well. */}
            <HiChevronDown className="text-foreground" />
          </button>

          {/* Profile Dropdown Content */}
          {dropdownOpen && (
            // bg-card: Used for dropdowns/modals.
            // text-foreground: Ensures text within the dropdown is readable.
            // border-border: Consistent border for UI elements.
            <div className="profile absolute top-12 right-2 mt-2 w-44 bg-card text-foreground border border-border rounded shadow-md z-50">
              <ul className=" pt-4 text-sm text-foreground">
                <li className="text-center mb-2">
                  {/* text-primary: Highlights the user's name with the primary brand color. */}
                  <h2 className="text-xl font-bold text-primary">
                    {user.name}
                  </h2>
                  {/* text-primary-foreground: Used for text that sits on a primary-colored background,
                      or in this case, as a strong accent related to the primary color. */}
                  <span className="capitalize font-bold text-primary-foreground">
                    {user.role}
                  </span>
                </li>
                <li>
                  <hr />
                </li>
                {/* Dropdown menu items */}
                <li>
                  <Link
                    to=""
                    // text-foreground: Default text color for menu items.
                    // hover:bg-muted: Subtle hover background.
                    // hover:text-foreground: Ensures text remains readable on hover.
                    className="text-sm py-2 px-3 flex items-center text-foreground hover:bg-muted hover:text-foreground"
                  >
                    <HiOutlineUser className="mr-2 text-lg" />
                    <span className="">View profile</span>
                  </Link>
                </li>
                <li>
                  <hr />
                </li>
                <li>
                  <Link
                    to=""
                    className="text-sm py-2 px-3 flex items-center text-foreground hover:bg-muted hover:text-foreground"
                  >
                    <FaCog className="mr-2 text-lg" />
                    <span className="">Account Settings</span>
                  </Link>
                </li>
                <li>
                  <hr />
                </li>
                <li>
                  <Link
                    to=""
                    className="text-sm py-2 px-3 flex items-center text-foreground hover:bg-muted hover:text-foreground"
                  >
                    <HiOutlineQuestionMarkCircle className="mr-2 text-lg" />
                    <span>Need Help?</span>
                  </Link>
                </li>
                <li>
                  <hr />
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    // text-foreground: Default text color for the sign-out button.
                    // hover:bg-muted: Subtle hover background.
                    // hover:text-foreground: Ensures text remains readable on hover.
                    className="text-sm py-2 px-3 flex items-center text-foreground hover:bg-muted hover:text-foreground w-full"
                  >
                    <FaArrowCircleLeft className="mr-2 text-lg" />
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
