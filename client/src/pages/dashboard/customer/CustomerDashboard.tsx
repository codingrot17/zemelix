import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    ShoppingBag,
    Heart,
    Wallet,
    Bell,
    Clock,
    CheckCircle,
    AlertCircle,
    Package,
    ArrowRight,
    Star,
    Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Mock data — replace with real Appwrite queries when ready ─────────────────
const mockStats = {
    totalOrders: 12,
    activeOrders: 2,
    wishlistItems: 7,
    walletBalance: 15000
};

const mockRecentOrders = [
    {
        id: "ORD-1041",
        product: "Wireless Headphones",
        vendor: "AudioFlow",
        amount: 12000,
        status: "processing",
        date: "Today"
    },
    {
        id: "ORD-1028",
        product: "Organic Skincare Set",
        vendor: "Glow Haven",
        amount: 8500,
        status: "completed",
        date: "3 days ago"
    },
    {
        id: "ORD-1015",
        product: "Minimalist Desk Lamp",
        vendor: "CraftHaus",
        amount: 6000,
        status: "completed",
        date: "1 week ago"
    }
];

const mockRecommended = [
    {
        id: "r1",
        title: "Full-Stack App Development",
        vendor: "DevCrafters",
        price: "₦89,900",
        rating: 4.7,
        badge: "Trending"
    },
    {
        id: "r2",
        title: "Urban Portrait Photography",
        vendor: "LensPro Studio",
        price: "₦120,000",
        rating: 4.9,
        badge: "Hot"
    }
];

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        completed:
            "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
        pending:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
        processing:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
        cancelled:
            "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
    };
    const icons: Record<string, React.ReactNode> = {
        completed: <CheckCircle className="w-3 h-3" />,
        pending: <Clock className="w-3 h-3" />,
        processing: <AlertCircle className="w-3 h-3" />,
        cancelled: <AlertCircle className="w-3 h-3" />
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

// ── Main component ─────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const firstName = user?.name?.split(" ")[0] ?? "there";

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {firstName}!
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Here's what's happening with your account.
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/collections")}
                    className="flex items-center gap-2 w-full sm:w-auto"
                >
                    <ShoppingBag className="w-4 h-4" />
                    Browse Products
                </Button>
            </div>

            {/* ── Email verification prompt ── */}
            {!user?.emailVerification && (
                <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                            Verify your email
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-0.5">
                            Check your inbox for a verification link to unlock
                            full account access.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Stats grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<ShoppingBag className="w-5 h-5" />}
                    label="Total Orders"
                    value={mockStats.totalOrders.toString()}
                    color="indigo"
                    onClick={() => navigate("/dashboard/user/orders")}
                />
                <StatCard
                    icon={<Clock className="w-5 h-5" />}
                    label="Active Orders"
                    value={mockStats.activeOrders.toString()}
                    color="blue"
                    onClick={() => navigate("/dashboard/user/orders")}
                />
                <StatCard
                    icon={<Heart className="w-5 h-5" />}
                    label="Wishlist"
                    value={mockStats.wishlistItems.toString()}
                    color="pink"
                    onClick={() => navigate("/dashboard/user/favorites")}
                />
                <StatCard
                    icon={<Wallet className="w-5 h-5" />}
                    label="Wallet"
                    value={`₦${(mockStats.walletBalance / 1000).toFixed(0)}K`}
                    color="green"
                    onClick={() => navigate("/dashboard/user/wallet")}
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
                            onClick={() => navigate("/dashboard/user/orders")}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                        >
                            View all <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    {mockRecentOrders.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">
                            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No orders yet</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => navigate("/collections")}
                            >
                                Start Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {mockRecentOrders.map(order => (
                                <div
                                    key={order.id}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40"
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {order.product}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {order.vendor} · {order.id}
                                            </p>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <div className="flex items-center justify-between mt-1 text-xs">
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
                    )}
                </div>

                {/* Recommended for you */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border">
                    <div className="flex items-center justify-between p-5 border-b">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            Recommended for You
                        </h2>
                        <button
                            onClick={() => navigate("/collections")}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                        >
                            Browse all <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="divide-y">
                        {mockRecommended.map(item => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer"
                                onClick={() => navigate("/collections")}
                            >
                                {/* Placeholder thumb */}
                                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                                    <Tag className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.vendor}
                                    </p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs text-gray-500">
                                            {item.rating}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-300">
                                        {item.price}
                                    </p>
                                    <span className="text-xs text-orange-600 font-medium">
                                        {item.badge}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => navigate("/collections")}
                        >
                            See More Recommendations
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
                        label="My Orders"
                        icon={<ShoppingBag className="w-5 h-5" />}
                        onClick={() => navigate("/dashboard/user/orders")}
                    />
                    <QuickAction
                        label="Wishlist"
                        icon={<Heart className="w-5 h-5" />}
                        onClick={() => navigate("/dashboard/user/favorites")}
                    />
                    <QuickAction
                        label="Wallet"
                        icon={<Wallet className="w-5 h-5" />}
                        onClick={() => navigate("/dashboard/user/wallet")}
                    />
                    <QuickAction
                        label="Notifications"
                        icon={<Bell className="w-5 h-5" />}
                        onClick={() =>
                            navigate("/dashboard/user/notifications")
                        }
                    />
                </div>
            </div>

            {/* ── Become a seller CTA ── */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold mb-1">
                        Ready to start selling?
                    </h3>
                    <p className="text-indigo-100 text-sm">
                        Turn your products or skills into income on Zemelix.
                    </p>
                </div>
                <Button
                    variant="secondary"
                    className="flex-shrink-0 w-full sm:w-auto"
                    onClick={() => navigate("/vendor/upgrade")}
                >
                    Become a Seller
                </Button>
            </div>
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatCard({
    icon,
    label,
    value,
    color,
    onClick
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: "indigo" | "blue" | "pink" | "green";
    onClick?: () => void;
}) {
    const bg: Record<string, string> = {
        indigo: "bg-indigo-500",
        blue: "bg-blue-500",
        pink: "bg-pink-500",
        green: "bg-green-500"
    };
    return (
        <button
            onClick={onClick}
            className="bg-white dark:bg-gray-800 rounded-lg shadow border p-5 text-left hover:shadow-md transition w-full"
        >
            <div
                className={`inline-flex p-2.5 rounded-lg ${bg[color]} text-white mb-3`}
            >
                {icon}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
            </p>
        </button>
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
