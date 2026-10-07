import { useEffect, useState } from "react";
import { AlertCircle, ChevronDown, Loader2, RefreshCw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { listCustomerOrders, listOrderItems, type Order, type OrderItem } from "@/services/order.service";

type OrderWithItems = Order & { items: OrderItem[] };
function statusClass(status: Order["status"]) {
    if (status === "purchased") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
}
export default function UserOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    async function load() {
        if (!user?.$id) return;
        setLoading(true); setError("");
        try {
            const next = await listCustomerOrders();
            setOrders(await Promise.all(next.map(async order => ({ ...order, items: await listOrderItems(order.$id) }))));
        } catch (err) {
            console.error("Failed to load customer orders.", err);
            setError("Unable to load your orders right now. Please try again.");
        } finally { setLoading(false); }
    }
    useEffect(() => { void load(); }, [user?.$id]);
    return <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Track your marketplace orders and their current status.</p></div>
            <Button variant="outline" onClick={() => void load()} disabled={loading} className="w-full sm:w-auto"><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
        </div>
        {error && <div className="flex items-center gap-2 p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700"><AlertCircle className="w-4 h-4" />{error}</div>}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden">
            {loading ? <div className="py-16 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading orders…</div> :
                orders.length === 0 ? <div className="p-12 text-center"><ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" /><h2 className="font-semibold text-gray-900 dark:text-white">No orders yet</h2><p className="text-sm text-gray-500 mt-1">Orders created from your marketplace activity will appear here.</p></div> :
                <div className="divide-y">{orders.map(order => {
                    const open = expanded.has(order.$id);
                    return <div key={order.$id} className="p-5 space-y-3"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-gray-900 dark:text-white">Order {order.$id.slice(0, 8)}</h2><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusClass(order.status)}`}>{order.status}</span></div><p className="text-xs text-gray-500 mt-1">{new Date(order.$createdAt).toLocaleString()} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</p></div><div className="flex items-center justify-between sm:justify-end gap-3"><span className="font-semibold text-gray-900 dark:text-white">₦{order.total.toLocaleString()}</span><Button variant="ghost" size="sm" onClick={() => setExpanded(current => { const next = new Set(current); open ? next.delete(order.$id) : next.add(order.$id); return next; })}>{open ? "Hide" : "Details"}<ChevronDown className={`w-4 h-4 ml-2 transition-transform ${open ? "rotate-180" : ""}`} /></Button></div></div>{open && <div className="rounded-lg border p-4 space-y-3">{order.items.map(item => <div key={item.$id} className="flex items-center justify-between gap-4 text-sm"><div><p className="font-medium text-gray-900 dark:text-white">{item.productTitle}</p><p className="text-gray-500">{item.quantity} × ₦{item.unitPrice.toLocaleString()}</p></div><span className="font-medium">₦{item.total.toLocaleString()}</span></div>)}</div>}</div>;
                })}</div>}
        </div>
    </div>;
}
