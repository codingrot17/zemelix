import React from "react";

export default function CustomerDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h2>
      {/* Add customer widgets: recent orders, favorites, wallet, etc. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4">Recent Orders: 5</div>
        <div className="bg-white rounded shadow p-4">Wallet Balance: $200</div>
      </div>
    </div>
  );
}
