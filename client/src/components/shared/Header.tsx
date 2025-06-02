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
  ShoppingCart,
  Bell,
  Sun,
  Moon,
  Globe,
  LayoutGrid,
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

const cartItems = [
  { id: 1, name: 'Wireless Headphones', price: 199.99, quantity: 1 },
  { id: 2, name: 'Smart Watch', price: 159.99, quantity: 2 },
];

const notifications = [
  'Order #1234 shipped',
  'Flash sale: 50% off electronics',
  'New message from seller'
];

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
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
    <header className="bg-white dark:bg-black shadow-md sticky top-0 z-50">
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
        <div className="flex items-center space-x-7">
          {/* Theme Toggle */}
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

          {/* Language Selector */}
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

          {/* Cart Preview */}
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

          {/* Notifications */}
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
