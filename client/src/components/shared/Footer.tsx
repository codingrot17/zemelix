import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6 text-center text-sm">
        &copy; {new Date().getFullYear()} Marketplace. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
