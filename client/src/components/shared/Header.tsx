// components/Header.tsx
import * as React from "react";
import type { FormEvent } from "react";
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
import { CartPreview } from "@/components/shared/CartPreview";
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
  Search as SearchIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { CartBadge } from "@/components/ui/CartBadge";

interface HeaderProps {
  cartCount?: number;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ cartCount = 0 }) => {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { count } = useCart();

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/collections?search=${encodeURIComponent(query)}&view=products` : "/collections");
    setMobileNavOpen(false);
  };

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
            to="/collections"
            className="hover:text-[var(--color-primary)] transition-colors font-medium"
          >
            Shop
          </Link>
          <Link
            to="/sellers"
            className="hover:text-[var(--color-primary)] transition-colors font-medium"
          >
            Sellers
          </Link>
          <Link
            to="/blog"
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
        <form onSubmit={submitSearch} className="hidden md:flex items-center ml-6 gap-2">
          <Input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search listings…"
            aria-label="Search marketplace listings"
            className="w-52 lg:w-64 bg-[var(--color-card)] text-[var(--color-card-foreground)]"
          />
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Account Menu */}
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
                      <UserPlus className="w-4 h-4" /> Sign Up
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
                  <DropdownMenuItem onSelect={handleLogout}>
                    <div className="text-foreground flex items-center gap-2 hover:bg-muted hover:text-foreground cursor-pointer">
                      <LogOut className="w-4 h-4" /> Logout
                    </div>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart Drawer Trigger with Live Badge */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="relative p-2" aria-label="Open cart">
                <ShoppingCart className="h-5 w-5" />
                <CartBadge count={count} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[420px]">
              <CartPreview onClose={() => { /* auto-close handled by Sheet */ }} />
            </SheetContent>
          </Sheet>

          {/* Mobile Navigation */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[var(--color-background)]">
              <nav className="flex flex-col mt-8">
                <Link className="p-2 hover:bg-muted hover:text-primary" to="/collections" onClick={() => setMobileNavOpen(false)}>Shop</Link>
                <hr />
                <Link className="p-2 hover:bg-muted hover:text-primary" to="/sellers" onClick={() => setMobileNavOpen(false)}>Sellers</Link>
                <hr />
                <Link className="p-2 hover:bg-muted hover:text-primary" to="/blog" onClick={() => setMobileNavOpen(false)}>Blog</Link>
                <hr />
                <Link className="p-2 hover:bg-muted hover:text-primary" to="/about" onClick={() => setMobileNavOpen(false)}>About</Link>
                <hr />
                <Link className="p-2 hover:bg-muted hover:text-primary" to="/contact" onClick={() => setMobileNavOpen(false)}>Contact</Link>
                <form onSubmit={submitSearch} className="mt-4 flex gap-2"><Input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings…" aria-label="Search marketplace" className="bg-[var(--color-card)] text-[var(--color-card-foreground)]" /><Button type="submit">Search</Button></form>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
