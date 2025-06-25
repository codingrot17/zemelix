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
  const [darkTheme, setDarkTheme] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Logo switching based on theme
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
              className="group flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => setMobileMenuOpen(false)} // Close mobile menu if open
            >
              <img
                src={category.icon}
                alt={category.name}
                className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} object-cover rounded mb-2`}
                onError={(e) => { e.currentTarget.src = PLACEHOLDER_ICON; }}
                loading="lazy"
              />
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600`}>
                {category.name}
              </span>
            </Link>
          ))}
        </div>
        {(showShowMore || showShowLess) && (
          <div className="flex justify-center mt-2">
            <button
              className="text-indigo-600 hover:underline text-xs font-semibold"
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
    alert(`Searching for: ${searchTerm}`);
  };

  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-white dark:bg-black shadow-md sticky top-0 z-50" role="navigation">
      {/* Promotional Banner */}
      <div className="bg-indigo-600 text-white text-xs py-1 px-4 text-center font-semibold">
        🎉 Summer Sale: Up to 30% off select categories! &nbsp;
        <Link to="/collections/sale" className="underline hover:text-yellow-200">Shop Now</Link>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-y-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <img
              src={logoSrc}
              alt="Zemelix Brand Logo"
              className="h-10 w-10 object-contain rounded-full shadow-md"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 ml-6">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/collections" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Collections</Link>
          <Link to="/sellers" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Sellers</Link>
          <Link to="/blog" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
          <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
        </nav>

        {/* Mobile Search Toggle + Category */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Category Dropdown on Mobile */}
          <DropdownMenu onOpenChange={setCategoriesOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center px-2">
                <LayoutGrid className="w-6 h-6" />
                {categoriesOpen ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64 p-4"
              align="start"
              sideOffset={10}
            >
              <CategoryDropdownContent isMobile />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="text-gray-600 hover:text-indigo-600 transition"
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
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white dark:bg-gray-800"
            placeholder="Search products, services, categories..."
            aria-label="Search"
          />
        </form>

        {/* Mega Category Dropdown (Desktop) */}
        <DropdownMenu onOpenChange={setCategoriesOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="hidden md:flex items-center">
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
            className="w-[600px] p-4"
            align="start"
            sideOffset={10}
          >
            <CategoryDropdownContent isMobile={false} />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Action Icons */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle + Mode Indicator */}
          {/* <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {darkTheme ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <span className="ml-1 text-xs text-gray-500">
              {darkTheme ? 'Dark' : 'Light'}
            </span>
          </div> */}
          <ThemeToggle />

          {/* Help/FAQ */}
          <Link to="/faq" aria-label="Help / FAQ">
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </Link>

          {/* Wishlist Icon */}
          <Link to="/wishlist" aria-label="Wishlist">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5 text-pink-500" />
            </Button>
          </Link>

       
          {/* Account Dropdown */}
          <DropdownMenu onOpenChange={setAccountOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1">
                <UserRound className="w-5 h-5" />
                <span className="hidden lg:inline">Account</span>
                {accountOpen ? (
                  <ChevronUp className="w-4 h-4 ml-1 transition-transform" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1 transition-transform" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {!isLoggedIn ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/signup">Sign Up</Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/account">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/login">Logout</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
             {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-md">
          <ul className="flex flex-col px-4 py-3 space-y-2">
            <li>
              <Link
                to="/"
                className="block py-2 px-3 rounded hover:bg-indigo-600 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/collections"
                className="block py-2 px-3 rounded hover:bg-indigo-600 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Collections
              </Link>
            </li>
            <li>
              <Link
                to="/sellers"
                className="block py-2 px-3 rounded hover:bg-indigo-600 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sellers
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className="block py-2 px-3 rounded hover:bg-indigo-600 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="block py-2 px-3 rounded hover:bg-indigo-600 hover:text-white"
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
      <div className="md:hidden bg-white dark:bg-black border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex flex-col gap-3 shadow-inner">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex space-x-4">
            {categories.slice(0, MAX_VISIBLE_CATEGORIES).map((category) => (
              <Link
                key={category.name}
                to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-800 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            {categories.length > MAX_VISIBLE_CATEGORIES && (
              <button
                onClick={() => setShowAllCategories((prev) => !prev)}
                className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
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
