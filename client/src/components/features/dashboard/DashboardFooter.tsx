import React from "react";

export default function DashboardFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
      &copy; {new Date().getFullYear()} Zemelix E-commerce. All rights reserved.
    </footer>
  );
}
