// components/Header.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ShoppingCart,
  User,
  Menu,
  LogIn,
  UserPlus,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  cartCount?: number;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ cartCount = 0 }) => {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(`/login`);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-[var(--color-background)] text-[var(--color-foreground)] transition-colors"
      )}
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight"
        >
          <div>
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
          </div>
          <span className="rounded-lg bg-[var(--color-primary)] px-2 py-1 text-[var(--color-primary-foreground)]">
            Zemelix
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/shop"
            className="hover:text-[var(--color-primary)] transition-colors font-medium"
          >
            Shop
          </Link>
          <Link
            to="/shop"
            className="hover:text-[var(--color-primary)] transition-colors font-medium"
          >
            Sellers
          </Link>
          <Link
            to="/shop"
            className="hover:text-[var(--color-primary)] transition-colors font-medium"
          >
            Blog
          </Link>
          <Link
            to="/about"
            className="hover:text-[var(--color-primary)] transition-colors font-medium"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="hover:text-[var(--color-primary)] transition-colors font-medium"
          >
            Contact
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex items-center ml-6">
          <Input
            type="search"
            placeholder="Search products…"
            className="w-64 bg-[var(--color-card)] text-[var(--color-card-foreground)]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Account */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Account">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-40 bg-card border border-border"
              align="end"
            >
              {!user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/login"
                      className="flex items-center gap-2 text-foreground hover:bg-muted hover:text-foreground"
                    >
                      <LogIn className="w-4 h-4" /> Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/register"
                      className="flex items-center gap-2 text-foreground hover:bg-muted hover:text-foreground"
                    >
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/account"
                      className="text-foreground flex items-center gap-2 hover:bg-muted hover:text-foreground"
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/orders"
                      className="text-foreground hover:bg-muted hover:text-foreground"
                    >
                      <ShoppingBag className="w-4 h-4" /> Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/wishlist"
                      className="text-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Heart className="w-4 h-4" /> Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/settings"
                      className="text-foreground flex items-center gap-2 hover:bg-muted hover:text-foreground"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/login"
                      className="text-foreground flex items-center gap-2 hover:bg-muted hover:text-foreground"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs text-[var(--color-primary-foreground)] font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Nav Trigger */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[var(--color-background)]">
              <nav className="flex flex-col mt-8">
                <Link
                  className=" p-2 hover:bg-muted hover:text-primary"
                  to="/shop"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Shop
                </Link>
                <span>
                  <hr />
                </span>

                <Link
                  className="p-2   hover:bg-muted hover:text-primary"
                  to="/shop"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Sellers
                </Link>
                <span>
                  <hr />
                </span>

                <Link
                  className="p-2   hover:bg-muted hover:text-primary"
                  to="/shop"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Blog
                </Link>
                <span>
                  <hr />
                </span>
                <Link
                  className="p-2   hover:bg-muted hover:text-primary"
                  to="/about"
                  onClick={() => setMobileNavOpen(false)}
                >
                  About
                </Link>
                <span>
                  <hr />
                </span>
                <Link
                  className="p-2   hover:bg-muted hover:text-primary"
                  to="/contact"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Contact
                </Link>
                <Input
                  type="search"
                  placeholder="Search products…"
                  className="mt-4 bg-[var(--color-card)] text-[var(--color-card-foreground)]"
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
