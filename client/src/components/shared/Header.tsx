// Header.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  X,
  UserRound,
  ChevronDown,
  ChevronUp,
  Heart,
  Sun,
  Moon,
  LayoutGrid,
  HelpCircle,
  Menu,
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const PLACEHOLDER_ICON = '/images/placeholder.svg';
const MAX_VISIBLE_CATEGORIES = 6;

const categories = [
  { name: 'Electronics', icon: PLACEHOLDER_ICON },
  { name: 'Fashion', icon: PLACEHOLDER_ICON },
  { name: 'Home & Garden', icon: PLACEHOLDER_ICON },
  { name: 'Toys', icon: PLACEHOLDER_ICON },
  { name: 'Sports', icon: PLACEHOLDER_ICON },
  { name: 'Books', icon: PLACEHOLDER_ICON },
  { name: 'Health', icon: PLACEHOLDER_ICON },
  { name: 'Automotive', icon: PLACEHOLDER_ICON },
  { name: 'Music', icon: PLACEHOLDER_ICON },
  { name: 'Groceries', icon: PLACEHOLDER_ICON },
  // Add more if needed
];

const Header = () => {
  // Simulate authentication state
  const isLoggedIn = false; // Change to true to simulate logged-in state
  const userName = "Amina"; // Replace with real user data when available

  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false); // This state should ideally come from ThemeToggle context
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Logo switching based on theme (assuming ThemeToggle manages the actual theme class on body/html)
  // For demonstration, we'll keep this as is, but in a real app, you'd likely
  // use a context to get the current theme.
  const logoSrc = darkTheme
    ? '/images/brand-dark.jpg'
    : '/images/brand-light.jpg';

  // Category logic for show more/less
  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, MAX_VISIBLE_CATEGORIES);

  const showShowMore = categories.length > MAX_VISIBLE_CATEGORIES && !showAllCategories;
  const showShowLess = categories.length > MAX_VISIBLE_CATEGORIES && showAllCategories;

  // Responsive grid columns
  const getGridCols = (isMobile) => (isMobile ? 'grid-cols-2' : 'grid-cols-3');

  // Category dropdown content as a component for reuse
  function CategoryDropdownContent({ isMobile = false }) {
    return (
      <div>
        <div
          className={`grid ${getGridCols(isMobile)} gap-4 overflow-y-auto`}
          style={{ maxHeight: 300, minWidth: isMobile ? 220 : 400 }}
        >
          {visibleCategories.map((category) => (
            <Link
              key={category.name}
              to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              // hover:bg-muted: Subtle hover background for category items.
              className="group flex flex-col items-center p-2 rounded-lg hover:bg-muted transition"
              onClick={() => setMobileMenuOpen(false)} // Close mobile menu if open
            >
              <img
                src={category.icon}
                alt={category.name}
                className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} object-cover rounded mb-2`}
                onError={(e) => { e.currentTarget.src = PLACEHOLDER_ICON; }}
                loading="lazy"
              />
              <span
                // text-foreground: Default text color for category names.
                // group-hover:text-primary: Highlights the category name with the primary color on hover.
                className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground group-hover:text-primary`}
              >
                {category.name}
              </span>
            </Link>
          ))}
        </div>
        {(showShowMore || showShowLess) && (
          <div className="flex justify-center mt-2">
            <button
              // text-primary: Uses the primary color for "Show more/less" links.
              // hover:underline: Standard underline on hover.
              className="text-primary hover:underline text-xs font-semibold"
              onClick={() => setShowAllCategories((prev) => !prev)}
              type="button"
            >
              {showShowMore ? 'Show more' : 'Show less'}
            </button>
          </div>
        )}
      </div>
    );
  }

  const handleSearch = (e) => {
    e.preventDefault();
    // Replaced alert with console.log as per instructions.
    console.log(`Searching for: ${searchTerm}`);
  };

  return (
    // bg-background: Uses the main background color, adapting to light/dark mode.
    <header className="bg-background shadow-md sticky top-0 z-50" role="navigation">
      {/* Promotional Banner */}
      <div
        // bg-primary: Uses the primary brand color for the banner background.
        // text-primary-foreground: Ensures text on the primary background is readable.
        className="bg-primary text-primary-foreground text-lg py-1 px-4 text-center font-semibold"
      >
        🎉 Summer Sale: Up to 30% off select categories! &nbsp;
        <Link
          to="/collections/sale"
          // hover:text-primary-foreground: Ensures the link text stays readable on hover.
          className="underline hover:text-primary-foreground"
        >
          Shop Now
        </Link>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-y-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 ml-6">
          <Link
            to="/"
            // text-foreground: Default text color for navigation links.
            // hover:text-primary: Highlights links with the primary color on hover.
            className="text-foreground hover:text-primary font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/collections"
            className="text-foreground hover:text-primary font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Collections
          </Link>
          <Link
            to="/sellers"
            className="text-foreground hover:text-primary font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sellers
          </Link>
          <Link
            to="/blog"
            className="text-foreground hover:text-primary font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            to="/about"
            className="text-foreground hover:text-primary font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            About Us
          </Link>
        </nav>

        {/* Mobile Search Toggle + Category */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Category Dropdown on Mobile */}
          <DropdownMenu onOpenChange={setCategoriesOpen}>
            <DropdownMenuTrigger asChild>
              {/* Button variant="ghost" should handle its own colors, but ensure it uses foreground/primary for icons. */}
              <Button variant="ghost" className="flex items-center px-2 text-foreground hover:text-primary">
                <LayoutGrid className="w-6 h-6" />
                {categoriesOpen ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              // bg-card: Used for dropdown content backgrounds.
              // border-border: Consistent border for dropdowns.
              className="w-64 p-4 bg-card border border-border"
              align="start"
              sideOffset={10}
            >
              <CategoryDropdownContent isMobile />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            // text-foreground: Default icon color.
            // hover:text-primary: Highlights icon with primary color on hover.
            className="text-foreground hover:text-primary transition"
            aria-label="Toggle search"
          >
            {showMobileSearch ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
          </button>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className={`relative w-full md:w-[400px] ${showMobileSearch ? 'block' : 'hidden'} md:block`}
        >
          {/* text-muted-foreground: For subtle placeholder-like text/icons. */}
          <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // bg-input: Uses the dedicated input field background color.
            // border-border: Consistent border for input fields.
            // focus:ring-ring: Uses the ring color for focus outlines.
            // text-foreground: Ensures input text is readable.
            // placeholder:text-muted-foreground: Uses muted-foreground for placeholder text.
            className="w-full pl-10 pr-4 py-2 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-ring shadow-sm bg-input text-foreground placeholder:text-muted-foreground"
            placeholder="Search products, services, categories..."
            aria-label="Search"
          />
        </form>

        {/* Mega Category Dropdown (Desktop) */}
        <DropdownMenu onOpenChange={setCategoriesOpen}>
          <DropdownMenuTrigger asChild>
            {/* Button variant="ghost" should handle its own colors, but ensure it uses foreground/primary for icons. */}
            <Button variant="ghost" className="hidden md:flex items-center text-foreground hover:text-primary">
              <LayoutGrid className="w-5 h-5 mr-1" />
              Categories
              {categoriesOpen ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            // bg-card: Used for dropdown content backgrounds.
            // border-border: Consistent border for dropdowns.
            className="w-[600px] p-4 bg-card border border-border"
            align="start"
            sideOffset={10}
          >
            <CategoryDropdownContent isMobile={false} />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Action Icons */}
        <div className="flex items-center space-x-4">

          <ThemeToggle />

          {/* Help/FAQ */}
          <Link to="/faq" aria-label="Help / FAQ">
            {/* Button variant="ghost" should handle its own colors, ensuring icon is foreground. */}
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </Link>

          {/* Wishlist Icon */}
          <Link to="/wishlist" aria-label="Wishlist">
            {/* Using text-destructive for a "warning" or "important" feel for wishlist,
                or you could define a specific `--brand-pink` if it's a core brand accent. */}
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>


          {/* Account Dropdown */}
          <DropdownMenu onOpenChange={setAccountOpen}>
            <DropdownMenuTrigger asChild>
              {/* Button variant="ghost" should handle its own colors, ensuring text/icon is foreground. */}
              <Button variant="ghost" className="flex items-center space-x-1 text-foreground hover:text-primary">
                <UserRound className="w-5 h-5" />
                <span className="hidden lg:inline">Account</span>
                {accountOpen ? (
                  <ChevronUp className="w-4 h-4 ml-1 transition-transform" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1 transition-transform" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              // bg-card: Used for dropdown content backgrounds.
              // border-border: Consistent border for dropdowns.
              className="w-40 bg-card border border-border"
              align="end"
            >
              {!isLoggedIn ? (
                <>
                  <DropdownMenuItem asChild>
                    {/* text-foreground: Default text color for menu items.
                        hover:bg-muted: Subtle hover background.
                        hover:text-foreground: Ensures text remains readable on hover. */}
                    <Link to="/login" className="text-foreground hover:bg-muted hover:text-foreground">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/register" className="text-foreground hover:bg-muted hover:text-foreground">Sign Up</Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="text-foreground hover:bg-muted hover:text-foreground">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="text-foreground hover:bg-muted hover:text-foreground">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="text-foreground hover:bg-muted hover:text-foreground">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="text-foreground hover:bg-muted hover:text-foreground">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="text-foreground hover:bg-muted hover:text-foreground">Logout</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

             {/* Mobile Menu Button */}
          <button
            // hover:bg-muted: Subtle hover background.
            // focus:ring-ring: Uses ring color for focus outline.
            // text-foreground: Default icon color.
            className="md:hidden p-2 rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <nav
          // bg-card: Used for dropdown backgrounds.
          // border-border: Consistent border for UI elements.
          className="md:hidden bg-card border-t border-border shadow-md"
        >
          <ul className="flex flex-col px-4 py-3 space-y-2">
            <li>
              <Link
                to="/"
                // hover:bg-primary: Highlights the link with the primary brand color on hover.
                // hover:text-primary-foreground: Ensures text is readable on the primary background.
                className="block py-2 px-3 rounded hover:bg-primary hover:text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/collections"
                className="block py-2 px-3 rounded hover:bg-primary hover:text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Collections
              </Link>
            </li>
            <li>
              <Link
                to="/sellers"
                className="block py-2 px-3 rounded hover:bg-primary hover:text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sellers
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className="block py-2 px-3 rounded hover:bg-primary hover:text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="block py-2 px-3 rounded hover:bg-primary hover:text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
            </li>
          </ul>
        </nav>
      )}

      {/* Mobile Lower Part: Quick Actions + Scrollable Categories */}
      {/* Uncomment and adjust if needed */}
      {/*
      <div
        // bg-card: Uses the card background for this section.
        // border-border: Consistent border.
        className="md:hidden bg-card border-t border-border px-4 py-2 flex flex-col gap-3 shadow-inner"
      >
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex space-x-4">
            {categories.slice(0, MAX_VISIBLE_CATEGORIES).map((category) => (
              <Link
                key={category.name}
                to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                // bg-muted: For subtle background on category tags.
                // text-muted-foreground: Text color that contrasts with muted background.
                // hover:bg-muted-foreground: Darker muted background on hover.
                className="flex-shrink-0 bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-semibold hover:bg-muted-foreground transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            {categories.length > MAX_VISIBLE_CATEGORIES && (
              <button
                onClick={() => setShowAllCategories((prev) => !prev)}
                // bg-muted: For subtle background on button.
                // text-muted-foreground: Text color that contrasts with muted background.
                // hover:bg-muted-foreground: Darker muted background on hover.
                className="flex-shrink-0 bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-semibold hover:bg-muted-foreground transition"
              >
                {showAllCategories ? 'Less' : 'More'}
              </button>
            )}
          </div>
        </div>
      </div>
      */}
    </header>
  );
};

export default Header;
