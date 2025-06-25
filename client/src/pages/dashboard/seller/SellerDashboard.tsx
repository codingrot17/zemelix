import React from "react";

export default function SellerDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Seller Dashboard</h2>
      {/* seller-specific widgets, stats, quick links, etc. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4">My Products: 120</div>
        <div className="bg-white rounded shadow p-4">Pending Orders: 8</div>
      </div>
    </div>
  );
}
