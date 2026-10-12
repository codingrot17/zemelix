import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const categories = [
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Toys",
  "Sports",
  "Books",
];

const Footer = () => (
  <footer className="bg-gray-900 dark:bg-black text-gray-200 dark:text-gray-300 pt-12 pb-6 px-4">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
      {/* Branding & Newsletter */}
      <div>
        <Link to="/" className="flex items-center mb-3">
          <img
            src="/images/brand-dark.jpg"
            alt="Zemelix Marketplace Logo"
            className="h-10 w-10 rounded-full mr-2 shadow"
          />
          <span className="font-bold text-xl text-white">Zemelix</span>
        </Link>
        <p className="text-gray-400 mb-4">
          Discover products, connect with independent sellers and request services from professionals on one marketplace.
        </p>
        <div className="rounded-xl border border-gray-700 bg-gray-800/60 p-4">
          <p className="mb-3 text-sm text-gray-300">Have a question or need help getting started?</p>
          <Link to="/support" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Visit support <Mail className="h-4 w-4" /></Link>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="font-semibold text-white mb-3">Quick Links</h3>
        <ul className="space-y-2 text-gray-400">
          <li>
            <Link to="/" className="hover:text-indigo-400">Home</Link>
          </li>
          <li>
            <Link to="/collections" className="hover:text-indigo-400">Collections</Link>
          </li>
          <li>
            <Link to="/sellers" className="hover:text-indigo-400">Sellers</Link>
          </li>
          <li>
            <Link to="/blog" className="hover:text-indigo-400">Blog</Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-indigo-400">About Us</Link>
          </li>
          <li>
            <Link to="/faq" className="hover:text-indigo-400">FAQ</Link>
          </li>
        </ul>
      </div>

      {/* Popular Categories */}
      <div>
        <h3 className="font-semibold text-white mb-3">Popular Categories</h3>
        <ul className="space-y-2 text-gray-400">
          {categories.map((cat) => (
            <li key={cat}>
              <Link
                to={`/category/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:text-indigo-400"
              >
                {cat}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Account & Support */}
      <div>
        <h3 className="font-semibold text-white mb-3">Account & Support</h3>
        <ul className="space-y-2 text-gray-400">
          <li>
            <Link to="/account" className="hover:text-indigo-400">My Account</Link>
          </li>
          <li>
            <Link to="/orders" className="hover:text-indigo-400">Orders</Link>
          </li>
          <li>
            <Link to="/wishlist" className="hover:text-indigo-400">Wishlist</Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-indigo-400">Contact Us</Link>
          </li>
          <li>
            <Link to="/support" className="hover:text-indigo-400">Support</Link>
          </li>
          <li>
            <a href="mailto:support@zemelix.com" className="hover:text-indigo-400 flex items-center gap-1">
              <Mail className="w-4 h-4" /> Email Support
            </a>
          </li>
        </ul>
      </div>
    </div>

    {/* Divider */}
    <div className="border-t border-gray-800 mt-10 mb-4"></div>

    {/* Copyright */}
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
      <div className="text-center sm:text-left">
        &copy; {new Date().getFullYear()} Zemelix. All rights reserved.
      </div>
      <div className="space-x-4 text-center sm:text-right">
        <Link to="/terms" className="hover:text-indigo-400">Terms</Link>
        <Link to="/privacy" className="hover:text-indigo-400">Privacy</Link>
        <Link to="/cookies" className="hover:text-indigo-400">Cookies</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
