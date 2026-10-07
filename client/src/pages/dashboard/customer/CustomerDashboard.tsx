import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, Bell, CalendarCheck, CheckCircle, Clock, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { listCustomerOrders, type Order } from "@/services/order.service";
import { listBuyerBookings, type Booking } from "@/services/booking.service";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const firstName = user?.name?.split(" ")[0] ?? "there";

    useEffect(() => {
        if (!user?.$id) return;
        let active = true;
        setLoading(true);
        setError("");
        Promise.all([listCustomerOrders(), listBuyerBookings(user.$id)])
            .then(([nextOrders, nextBookings]) => {
                if (!active) return;
                setOrders(nextOrders);
                setBookings(nextBookings);
            })
            .catch(err => {
                console.error("Failed to load customer dashboard.", err);
                if (active) setError("Some account activity could not be loaded. Please refresh and try again.");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [user?.$id]);

    const activeOrders = useMemo(() => orders.filter(order => !order.isArchived && order.status === "contacted"), [orders]);
    const activeBookings = useMemo(() => bookings.filter(booking => !booking.isArchived && ["requested", "accepted"].includes(booking.status)), [bookings]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {firstName}!</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Manage your orders, bookings, and account from one place.</p></div>
                <Button onClick={() => navigate("/collections")} className="w-full sm:w-auto"><ShoppingBag className="w-4 h-4 mr-2" />Browse Marketplace</Button>
            </div>
            {!user?.emailVerification && <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"><AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" /><div><p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Verify your email</p><p className="text-sm text-yellow-700 dark:text-yellow-300 mt-0.5">Check your inbox for your verification link.</p></div></div>}
            {error && <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Orders" value={loading ? "…" : String(orders.length)} icon={<ShoppingBag className="w-5 h-5" />} onClick={() => navigate("/dashboard/user/orders")} />
                <StatCard label="Open Orders" value={loading ? "…" : String(activeOrders.length)} icon={<Clock className="w-5 h-5" />} onClick={() => navigate("/dashboard/user/orders")} />
                <StatCard label="Active Bookings" value={loading ? "…" : String(activeBookings.length)} icon={<CalendarCheck className="w-5 h-5" />} onClick={() => navigate("/dashboard/user/bookings")} />
                <StatCard label="Favorites" value="—" icon={<Heart className="w-5 h-5" />} onClick={() => navigate("/dashboard/user/favorites")} />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
                <ActivityCard title="Recent Orders" empty="No orders yet. Start exploring the marketplace." actionLabel="View all" onAction={() => navigate("/dashboard/user/orders")}>
                    {orders.slice(0, 5).map(order => <button key={order.$id} onClick={() => navigate("/dashboard/user/orders")} className="w-full text-left p-4 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-900/40"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-medium text-gray-900 dark:text-white truncate">Order {order.$id.slice(0, 8)}</p><p className="text-xs text-gray-500 mt-1">{new Date(order.$createdAt).toLocaleDateString()} · {order.status}</p></div><span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">₦{order.total.toLocaleString()}</span></div></button>)}
                </ActivityCard>
                <ActivityCard title="Active Bookings" empty="No active bookings." actionLabel="View bookings" onAction={() => navigate("/dashboard/user/bookings")}>
                    {activeBookings.slice(0, 5).map(booking => <button key={booking.$id} onClick={() => navigate("/dashboard/user/bookings")} className="w-full text-left p-4 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-900/40"><p className="text-sm font-medium text-gray-900 dark:text-white truncate">{booking.serviceTitleSnapshot}</p><p className="text-xs text-gray-500 mt-1">{booking.requestedDate} · {booking.requestedTime}</p><span className="inline-flex mt-2 text-xs capitalize text-gray-500">{booking.status}</span></button>)}
                </ActivityCard>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-5"><h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-3"><QuickAction label="My Orders" icon={<ShoppingBag className="w-5 h-5" />} onClick={() => navigate("/dashboard/user/orders")} /><QuickAction label="My Bookings" icon={<CalendarCheck className="w-5 h-5" />} onClick={() => navigate("/dashboard/user/bookings")} /><QuickAction label="Favorites" icon={<Heart className="w-5 h-5" />} onClick={() => navigate("/dashboard/user/favorites")} /><QuickAction label="Notifications" icon={<Bell className="w-5 h-5" />} onClick={() => navigate("/dashboard/user/notifications")} /></div></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div><h3 className="text-base font-bold text-gray-900 dark:text-white">Want to sell or provide a service?</h3><p className="text-sm text-gray-500 mt-1">Set up your vendor profile when you are ready.</p></div><Button variant="outline" onClick={() => navigate("/vendor/upgrade")}>Become a Vendor</Button></div>
        </div>
    );
}

function StatCard({ label, value, icon, onClick }: { label: string; value: string; icon: React.ReactNode; onClick: () => void }) {
    return <button onClick={onClick} className="bg-white dark:bg-gray-800 rounded-lg shadow border p-5 text-left hover:shadow-md transition w-full"><div className="inline-flex p-2.5 rounded-lg bg-indigo-500 text-white mb-3">{icon}</div><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p></button>;
}
function ActivityCard({ title, empty, actionLabel, onAction, children }: { title: string; empty: string; actionLabel: string; onAction: () => void; children?: React.ReactNode }) {
    const hasChildren = !!children && (!Array.isArray(children) || children.length > 0);
    return <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden"><div className="flex items-center justify-between p-5 border-b"><h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2><button onClick={onAction} className="text-xs text-indigo-600 font-medium flex items-center gap-1">{actionLabel}<ArrowRight className="w-3 h-3" /></button></div>{hasChildren ? children : <div className="p-10 text-center text-sm text-gray-500"><CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />{empty}</div>}</div>;
}
function QuickAction({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
    return <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"><div className="text-indigo-600 dark:text-indigo-400">{icon}</div><span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{label}</span></button>;
}
