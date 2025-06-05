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
  // ShoppingCart,
  // Bell,
  Sun,
  Moon,
  // Globe,
  LayoutGrid,
  HelpCircle,
} from 'lucide-react';

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

/*
// Uncomment and use when cart is implemented
const cartItems = [
  { id: 1, name: 'Wireless Headphones', price: 199.99, quantity: 1 },
  { id: 2, name: 'Smart Watch', price: 159.99, quantity: 2 },
];

// Uncomment and use when notifications are implemented
const notifications = [
  'Order #1234 shipped',
  'Flash sale: 50% off electronics',
  'New message from seller'
];
*/

const Header = () => {
  // Simulate authentication state
  const isLoggedIn = true; // Change to false to simulate logged-out state
  const userName = "Amina"; // Replace with real user data when available

  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  // const [cartOpen, setCartOpen] = useState(false);
  // const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  // const [selectedLanguage, setSelectedLanguage] = useState('EN');
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
  const getGridCols = (isMobile) => {
    if (isMobile) return 'grid-cols-2';
    return 'grid-cols-3';
  };

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

      {/* Desktop Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-y-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/">
            <img
              src={logoSrc}
              alt="Zemelix Brand Logo"
              className="h-10 w-10 object-contain rounded-full shadow-md"
            />
          </Link>
        </div>

        {/* Horizontal Navigation Menu (Desktop) */}
        <nav className="hidden md:flex space-x-6 ml-6">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium">
            Home
          </Link>
          <Link to="/collections" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium">
            Collections
          </Link>
          <Link to="/sellers" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium">
            Sellers
          </Link>
          <Link to="/blog" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium">
            Blog
          </Link>
          <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium">
            About Us
          </Link>
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
          {/* Example: Search suggestions/autocomplete (future) */}
          {/* 
          <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-900 border rounded shadow-lg z-10">
            <div className="p-2 text-sm text-gray-500">Suggested: Headphones, Web Design, Home Decor</div>
          </div>
          */}
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
        <div className="flex items-center space-x-10">
          {/* Theme Toggle + Mode Indicator */}
          <div className="flex items-center">
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
          </div>

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

          {/* Language Selector (future) */}
          {/*
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {['EN', 'ES', 'FR'].map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onSelect={() => setSelectedLanguage(lang)}
                  className={selectedLanguage === lang ? 'bg-gray-100 dark:bg-gray-800' : ''}
                >
                  {lang}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          */}

          {/* Cart Preview (future) */}
          {/*
          <DropdownMenu onOpenChange={setCartOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 p-4" align="end">
              <h3 className="font-semibold mb-2">Shopping Cart</h3>
              {cartItems.length === 0 ? (
                <p className="text-sm text-gray-500">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × ${item.price}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Link to="/cart">
                    <Button className="w-full">View Cart</Button>
                  </Link>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          */}

          {/* Notifications (future) */}
          {/*
          <DropdownMenu onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              {notifications.map((notification, index) => (
                <DropdownMenuItem
                  key={index}
                  className="text-sm p-2 hover:bg-gray-100"
                >
                  {notification}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          */}

          {/* User Greeting (if logged in) */}
          {isLoggedIn && (
            <span className="hidden lg:inline text-gray-700 dark:text-gray-300 mr-2 font-medium">
              Hi, {userName}!
            </span>
          )}

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
            <DropdownMenuContent align="end" className="w-44">
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

          {/* Sign Up Button (visible if not logged in) */}
          {!isLoggedIn && (
            <Link to="/signup">
              <Button className="ml-2 hidden md:inline-flex" variant="default">
                Sign Up
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Lower Part: Quick Actions + Scrollable Categories */}
           {/*  <div className="md:hidden bg-white dark:bg-black border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex flex-col gap-3 shadow-inner">


        <div className="overflow-x-auto no-scrollbar">
          <div className="flex space-x-4">
            {categories.slice(0, MAX_VISIBLE_CATEGORIES).map((category) => (
              <Link
                key={category.name}
                to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-800 transition"
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

      </div>         */}
    </header>
  );
};

export default Header;
