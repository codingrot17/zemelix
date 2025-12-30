import { useState, useEffect } from "react";
import {
    Users,
    Package,
    DollarSign,
    TrendingUp,
    ShoppingBag,
    AlertCircle,
    CheckCircle,
    Clock
} from "lucide-react";

// Mock data - replace with real API
const mockStats = {
    totalUsers: 1234,
    totalOrders: 5678,
    revenue: 420000,
    activeVendors: 156
};

const mockRecentOrders = [
    {
        id: "ORD-001",
        customer: "John Doe",
        amount: 45000,
        status: "completed",
        date: "2 hours ago"
    },
    {
        id: "ORD-002",
        customer: "Jane Smith",
        amount: 12500,
        status: "pending",
        date: "5 hours ago"
    },
    {
        id: "ORD-003",
        customer: "Mike Johnson",
        amount: 89000,
        status: "processing",
        date: "1 day ago"
    }
];

const mockRecentUsers = [
    {
        id: "USR-001",
        name: "Alice Williams",
        email: "alice@example.com",
        role: "customer",
        joined: "Today"
    },
    {
        id: "USR-002",
        name: "Bob Brown",
        email: "bob@example.com",
        role: "vendor",
        joined: "Yesterday"
    }
];

export default function AdminDashboard() {
    const [stats, setStats] = useState(mockStats);
    const [recentOrders, setRecentOrders] = useState(mockRecentOrders);
    const [recentUsers, setRecentUsers] = useState(mockRecentUsers);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Welcome back! Here's what's happening today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Users className="w-6 h-6" />}
                    label="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    trend="+12%"
                    trendUp={true}
                    color="blue"
                />
                <StatCard
                    icon={<ShoppingBag className="w-6 h-6" />}
                    label="Total Orders"
                    value={stats.totalOrders.toLocaleString()}
                    trend="+8%"
                    trendUp={true}
                    color="green"
                />
                <StatCard
                    icon={<DollarSign className="w-6 h-6" />}
                    label="Revenue"
                    value={`₦${(stats.revenue / 1000).toFixed(0)}K`}
                    trend="+23%"
                    trendUp={true}
                    color="yellow"
                />
                <StatCard
                    icon={<Package className="w-6 h-6" />}
                    label="Active Vendors"
                    value={stats.activeVendors.toLocaleString()}
                    trend="+5"
                    trendUp={true}
                    color="purple"
                />
            </div>

            {/* Recent Activity Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Recent Orders
                        </h2>
                    </div>
                    <div className="divide-y">
                        {recentOrders.map(order => (
                            <div
                                key={order.id}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {order.customer}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {order.id}
                                        </p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {order.date}
                                    </span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        ₦{order.amount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t">
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            View all orders →
                        </button>
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Recent Users
                        </h2>
                    </div>
                    <div className="divide-y">
                        {recentUsers.map(user => (
                            <div
                                key={user.id}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold">
                                            {user.name
                                                .split(" ")
                                                .map(n => n[0])
                                                .join("")}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                                user.role === "vendor"
                                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                                    : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {user.joined}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t">
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            View all users →
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ActionButton
                        label="Manage Users"
                        icon={<Users className="w-5 h-5" />}
                    />
                    <ActionButton
                        label="View Orders"
                        icon={<ShoppingBag className="w-5 h-5" />}
                    />
                    <ActionButton
                        label="Analytics"
                        icon={<TrendingUp className="w-5 h-5" />}
                    />
                    <ActionButton
                        label="Settings"
                        icon={<Package className="w-5 h-5" />}
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, trend, trendUp, color }) {
    const colorClasses = {
        blue: "bg-blue-500",
        green: "bg-green-500",
        yellow: "bg-yellow-500",
        purple: "bg-purple-500"
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-4">
                <div
                    className={`p-3 rounded-lg ${colorClasses[color]} text-white`}
                >
                    {icon}
                </div>
                {trend && (
                    <span
                        className={`flex items-center gap-1 text-sm font-medium ${
                            trendUp ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        completed:
            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        pending:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        processing:
            "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
    };

    const icons = {
        completed: <CheckCircle className="w-3 h-3" />,
        pending: <Clock className="w-3 h-3" />,
        processing: <AlertCircle className="w-3 h-3" />,
        cancelled: <AlertCircle className="w-3 h-3" />
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
        >
            {icons[status]}
            {status}
        </span>
    );
}

function ActionButton({ label, icon }) {
    return (
        <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
            <div className="text-indigo-600 dark:text-indigo-400">{icon}</div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </span>
        </button>
    );
}
