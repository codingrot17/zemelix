import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    Package,
    ShoppingBag,
    DollarSign,
    TrendingUp,
    Plus,
    Eye,
    Clock,
    CheckCircle,
    AlertCircle,
    Store,
    Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Mock data — replace with real Appwrite queries when ready ─────────────────
const mockStats = {
    totalProducts: 24,
    pendingOrders: 8,
    completedOrders: 143,
    revenue: 328500
};

const mockRecentOrders = [
    {
        id: "ORD-1041",
        customer: "Chidi Okeke",
        product: "Wireless Headphones",
        amount: 12000,
        status: "pending",
        date: "1 hour ago"
    },
    {
        id: "ORD-1038",
        customer: "Amaka Nwosu",
        product: "Laptop Stand",
        amount: 7500,
        status: "completed",
        date: "3 hours ago"
    },
    {
        id: "ORD-1031",
        customer: "Emeka Eze",
        product: "USB-C Hub",
        amount: 15000,
        status: "processing",
        date: "Yesterday"
    }
];

const mockTopProducts = [
    { name: "Wireless Headphones", sales: 42, revenue: 378000 },
    { name: "Laptop Stand", sales: 31, revenue: 232500 },
    { name: "USB-C Hub", sales: 28, revenue: 420000 }
];

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        completed:
            "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
        pending:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
        processing:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
    };
    const icons: Record<string, React.ReactNode> = {
        completed: <CheckCircle className="w-3 h-3" />,
        pending: <Clock className="w-3 h-3" />,
        processing: <AlertCircle className="w-3 h-3" />
    };
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? styles.pending}`}
        >
            {icons[status]}
            {status}
        </span>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SellerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Pull vendor info from profile if available
    const businessName =
        user?.profile?.businessName ?? user?.name ?? "Your Store";
    const vendorStatus = user?.profile?.vendorStatus ?? "pending";
    const storeStatus = user?.profile?.storeStatus ?? "closed";

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Seller Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        {businessName}
                        {/* Vendor status pill */}
                        <span
                            className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                vendorStatus === "active"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                    : vendorStatus === "pending"
                                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                        >
                            {vendorStatus}
                        </span>
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/dashboard/seller/products")}
                    className="flex items-center gap-2 w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </Button>
            </div>

            {/* ── Pending approval banner ── */}
            {vendorStatus === "pending" && (
                <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                            Account under review
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-0.5">
                            Your vendor account is pending approval. You can
                            prepare your products in the meantime — they'll go
                            live once approved (typically 1–2 business days).
                        </p>
                    </div>
                </div>
            )}

            {/* ── Stats grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Package className="w-6 h-6" />}
                    label="Total Products"
                    value={mockStats.totalProducts.toString()}
                    color="indigo"
                />
                <StatCard
                    icon={<Clock className="w-6 h-6" />}
                    label="Pending Orders"
                    value={mockStats.pendingOrders.toString()}
                    color="yellow"
                />
                <StatCard
                    icon={<CheckCircle className="w-6 h-6" />}
                    label="Completed Orders"
                    value={mockStats.completedOrders.toString()}
                    color="green"
                />
                <StatCard
                    icon={<DollarSign className="w-6 h-6" />}
                    label="Total Revenue"
                    value={`₦${(mockStats.revenue / 1000).toFixed(0)}K`}
                    color="purple"
                />
            </div>

            {/* ── Content grid ── */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border">
                    <div className="flex items-center justify-between p-5 border-b">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            Recent Orders
                        </h2>
                        <button
                            onClick={() => navigate("/dashboard/seller/orders")}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            View all →
                        </button>
                    </div>
                    <div className="divide-y">
                        {mockRecentOrders.map(order => (
                            <div
                                key={order.id}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {order.customer}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {order.product} · {order.id}
                                        </p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>
                                <div className="flex items-center justify-between text-xs mt-1">
                                    <span className="text-gray-500">
                                        {order.date}
                                    </span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        ₦{order.amount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border">
                    <div className="flex items-center justify-between p-5 border-b">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            Top Products
                        </h2>
                        <button
                            onClick={() =>
                                navigate("/dashboard/seller/products")
                            }
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Manage →
                        </button>
                    </div>
                    <div className="divide-y">
                        {mockTopProducts.map((product, idx) => (
                            <div
                                key={product.name}
                                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40"
                            >
                                {/* Rank */}
                                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {product.sales} sales
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
                                    ₦{product.revenue.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t text-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                navigate("/dashboard/seller/products")
                            }
                            className="w-full"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Product
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <QuickAction
                        label="My Products"
                        icon={<Package className="w-5 h-5" />}
                        onClick={() => navigate("/dashboard/seller/products")}
                    />
                    <QuickAction
                        label="Orders"
                        icon={<ShoppingBag className="w-5 h-5" />}
                        onClick={() => navigate("/dashboard/seller/orders")}
                    />
                    <QuickAction
                        label="Analytics"
                        icon={<TrendingUp className="w-5 h-5" />}
                        onClick={() => navigate("/dashboard/seller/analytics")}
                    />
                    <QuickAction
                        label="Store Profile"
                        icon={<Store className="w-5 h-5" />}
                        onClick={() => navigate("/dashboard/seller/profile")}
                    />
                </div>
            </div>
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatCard({
    icon,
    label,
    value,
    color
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: "indigo" | "yellow" | "green" | "purple";
}) {
    const bg: Record<string, string> = {
        indigo: "bg-indigo-500",
        yellow: "bg-yellow-500",
        green: "bg-green-500",
        purple: "bg-purple-500"
    };
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-5">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${bg[color]} text-white`}>
                    {icon}
                </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function QuickAction({
    label,
    icon,
    onClick
}: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
        >
            <div className="text-indigo-600 dark:text-indigo-400">{icon}</div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                {label}
            </span>
        </button>
    );
}
