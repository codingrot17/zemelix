import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Searching for: ${searchTerm}`);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(prev => !prev);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-y-4">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/">
            <img
              src="/images/brand-light.jpg"
              alt="Zemelix Brand Logo"
              className="h-10 w-10 object-contain rounded-full shadow-md"
            />
          </Link>
        </div>

        {/* Toggle button for mobile */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileSearch}
            className="text-gray-600 hover:text-indigo-600 transition"
            aria-label="Toggle search"
          >
            {showMobileSearch ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
          </button>
        </div>

        {/* Search bar */}
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
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            placeholder="Search products, services, categories..."
          />
        </form>

        {/* Nav links */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/products" className="text-gray-700 hover:text-indigo-600">
            Products
          </Link>
          <Link to="/services" className="text-gray-700 hover:text-indigo-600">
            Services
          </Link>
          <Link to="/sell" className="text-gray-700 hover:text-indigo-600">
            Sell
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-indigo-600">
            About
          </Link>
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center space-x-3">
          <Button size="sm" variant="outline" onClick={() => alert('Navigate to login')}>
            Log In
          </Button>
          <Button size="sm" onClick={() => alert('Navigate to signup')}>
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;