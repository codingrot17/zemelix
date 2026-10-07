import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { listProviderBookings, type Booking } from "@/services/booking.service";
import { isServiceProvider } from "@/lib/vendorAccess";
import {
    Package,
    ShoppingBag,
    TrendingUp,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    Store,
    Loader2,
    MessageCircle,
    DollarSign,
    XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    listSellerProducts,
    type SellerProduct
} from "@/services/product.service";
import {
    listSellerOrders,
    type Order
} from "@/services/order.service";

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active:
            "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
        draft:
            "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
        archived:
            "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] ?? styles.draft}`}
        >
            {status}
        </span>
    );
}

export default function SellerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<SellerProduct[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const businessName =
        user?.profile?.businessName ?? user?.name ?? "Your Store";
    const vendorStatus = user?.profile?.vendorStatus ?? "active";
    const provider = isServiceProvider(user?.profile?.vendorType);

    useEffect(() => {
        let cancelled = false;

        async function loadDashboard() {
            if (!user?.$id) {
                setProducts([]);
                setOrders([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const sellerProducts = await listSellerProducts(user.$id);
                const sellerOrders = provider ? [] : await listSellerOrders(user.$id);
                const providerBookings = provider ? await listProviderBookings(user.$id) : [];

                if (!cancelled) {
                    setProducts(sellerProducts);
                    setOrders(sellerOrders);
                    setBookings(providerBookings);
                }
            } catch (err) {
                console.error("Failed to load seller dashboard data.", err);
                if (!cancelled) {
                    setProducts([]);
                    setOrders([]);
                    setError("Unable to load your dashboard data right now.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadDashboard();

        return () => {
            cancelled = true;
        };
    }, [user?.$id, provider]);

    const activeProducts = useMemo(
        () => products.filter(product => product.status === "active"),
        [products]
    );
    const draftProducts = useMemo(
        () => products.filter(product => product.status === "draft"),
        [products]
    );
    const inventoryValue = useMemo(
        () =>
            products.reduce(
                (sum, product) =>
                    sum + Number(product.price) * Number(product.stock),
                0
            ),
        [products]
    );
    const lowStockProducts = useMemo(
        () =>
            products
                .filter(product => product.stock <= 5)
                .sort((a, b) => a.stock - b.stock)
                .slice(0, 3),
        [products]
    );
    const recentProducts = products.slice(0, 3);
    const activeLeads = useMemo(
        () => orders.filter(order => order.status === "contacted" && !order.isArchived),
        [orders]
    );
    const purchasedOrders = useMemo(
        () => orders.filter(order => order.status === "purchased"),
        [orders]
    );
    const cancelledOrders = useMemo(
        () => orders.filter(order => order.status === "cancelled"),
        [orders]
    );
    const bookingActive = useMemo(() => bookings.filter(b => !b.isArchived && (b.status === "requested" || b.status === "accepted")), [bookings]);
    const bookingHistory = useMemo(() => bookings.filter(b => !b.isArchived && ["declined","cancelled","completed","no_show","expired"].includes(b.status)), [bookings]);
    const bookingRevenue = useMemo(() => bookings.filter(b => b.status === "completed").reduce((sum,b) => sum + b.priceSnapshot, 0), [bookings]);
    const purchasedRevenue = useMemo(
        () => purchasedOrders.reduce((sum, order) => sum + order.total, 0),
        [purchasedOrders]
    );


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        {provider ? "Provider Dashboard" : "Seller Dashboard"}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        {businessName}
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
                    {provider ? "Add Service" : "Add Product"}
                </Button>
            </div>

            {vendorStatus === "active" && (
                <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                            {provider ? "Provider account active" : "Seller account active"}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">
                            {provider ? "Your service provider account is active. You can create and publish services on Zemelix right away." : "Your seller account is active. You can create and publish products on Zemelix right away."}
                        </p>
                    </div>
                </div>
            )}

            {vendorStatus === "pending" && (
                <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                            Account pending approval
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-0.5">
                            {provider ? "Your provider account is awaiting approval. You can prepare your services while the account is pending." : "Your seller account is awaiting approval. You can prepare your products while the account is pending."}
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Package className="w-6 h-6" />} label={provider ? "Total Services" : "Total Products"} value={loading ? "…" : products.length.toString()} color="indigo" />
                <StatCard icon={<CheckCircle className="w-6 h-6" />} label={provider ? "Active Services" : "Active Listings"} value={loading ? "…" : activeProducts.length.toString()} color="green" />
                <StatCard icon={<Clock className="w-6 h-6" />} label={provider ? "Draft Services" : "Draft Products"} value={loading ? "…" : draftProducts.length.toString()} color="yellow" />
                {!provider && <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Inventory Value" value={loading ? "…" : `₦${inventoryValue.toLocaleString()}`} color="purple" />}
            </div>

            {provider ? (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div><h2 className="text-base font-semibold text-gray-900 dark:text-white">Bookings</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your service request pipeline and completed bookings</p></div>
                        <button onClick={() => navigate("/dashboard/seller/bookings")} className="text-xs text-teal-600 hover:text-teal-700 font-medium">View bookings →</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatCard icon={<Clock className="w-6 h-6" />} label="Active Bookings" value={loading ? "…" : bookingActive.length.toString()} color="indigo" />
                        <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Booking History" value={loading ? "…" : bookingHistory.length.toString()} color="green" />
                        <StatCard icon={<DollarSign className="w-6 h-6" />} label="Completed Revenue" value={loading ? "…" : `₦${bookingRevenue.toLocaleString()}`} color="purple" />
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div><h2 className="text-base font-semibold text-gray-900 dark:text-white">Leads & Revenue</h2><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your current lead pipeline and confirmed sales</p></div>
                        <button onClick={() => navigate("/dashboard/seller/orders")} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View orders →</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard icon={<MessageCircle className="w-6 h-6" />} label="Active Leads" value={loading ? "…" : activeLeads.length.toString()} color="indigo" />
                        <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Purchased Orders" value={loading ? "…" : purchasedOrders.length.toString()} color="green" />
                        <StatCard icon={<DollarSign className="w-6 h-6" />} label="Purchased Revenue" value={loading ? "…" : `₦${purchasedRevenue.toLocaleString()}`} color="purple" />
                        <StatCard icon={<XCircle className="w-6 h-6" />} label="Cancelled Orders" value={loading ? "…" : cancelledOrders.length.toString()} color="yellow" />
                    </div>
                </div>
            )}
            
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border">
                    <div className="flex items-center justify-between p-5 border-b">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                {provider ? "Recent Services" : "Recent Products"}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Your latest listings
                            </p>
                        </div>
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
                        {loading ? (
                            <div className="flex items-center justify-center py-10 text-gray-400">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                {provider ? "Loading services…" : "Loading products…"}
                            </div>
                        ) : recentProducts.length === 0 ? (
                            <div className="p-8 text-center">
                                <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    {provider ? "You have no services yet." : "You have no products yet."}
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        navigate("/dashboard/seller/products")
                                    }
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {provider ? "Add Service" : "Add Product"}
                                </Button>
                            </div>
                        ) : (
                            recentProducts.map(product => (
                                <div
                                    key={product.$id}
                                    className="flex items-center gap-3 p-4"
                                >
                                    <img
                                        src={
                                            product.imageUrl ??
                                            "/images/placeholder.svg"
                                        }
                                        alt={product.title}
                                        className="w-12 h-12 rounded-lg object-cover border flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {product.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            ₦{Number(product.price).toLocaleString()}{!provider && <> · {product.stock} in stock</>}
                                        </p>
                                    </div>
                                    <StatusBadge status={product.status} />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {!provider && (                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border">
                    <div className="flex items-center justify-between p-5 border-b">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                Stock Watch
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Products with 5 or fewer units
                            </p>
                        </div>
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
                        {loading ? (
                            <div className="flex items-center justify-center py-10 text-gray-400">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                {provider ? "Loading services…" : "Loading products…"}
                            </div>
                        ) : lowStockProducts.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                No low-stock products right now.
                            </div>
                        ) : (
                            lowStockProducts.map(product => (
                                <div
                                    key={product.$id}
                                    className="flex items-center gap-3 p-4"
                                >
                                    <div className="w-9 h-9 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 flex items-center justify-center flex-shrink-0">
                                        <Package className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {product.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            ₦{Number(product.price).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold text-red-500">
                                        {product.stock} left
                                    </span>
                                </div>
                            ))
                        )}
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
                </div>)}

            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <QuickAction
                        label={provider ? "My Services" : "My Products"}
                        icon={<Package className="w-5 h-5" />}
                        onClick={() => navigate("/dashboard/seller/products")}
                    />
                    <QuickAction
                        label={provider ? "Bookings" : "Orders"}
                        icon={<ShoppingBag className="w-5 h-5" />}
                        onClick={() => navigate(provider ? "/dashboard/seller/bookings" : "/dashboard/seller/orders")}
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
