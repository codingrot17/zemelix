import React from "react";

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {/* Add admin-specific widgets, stats, charts, quick links, etc. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded shadow p-4">Total Users: 1234</div>
        <div className="bg-white rounded shadow p-4">Total Orders: 5678</div>
        <div className="bg-white rounded shadow p-4">Revenue: $42,000</div>
      </div>
    </div>
  );
}
