import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, ChevronDown, Loader2, MessageCircle, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
    listOrderItems,
    listSellerOrders,
    markOrderPurchased,
    type Order,
    type OrderItem
} from "@/services/order.service";

type OrderWithItems = Order & {
    items: OrderItem[];
};

function statusStyles(status: Order["status"]) {
    if (status === "purchased") {
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
    }
    if (status === "cancelled") {
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
    }
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
}

function formatDate(value: string) {
    if (!value) return "Unknown date";
    return new Date(value).toLocaleString();
}

export default function SellerOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    async function loadOrders() {
        if (!user?.$id) {
            setOrders([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const sellerOrders = await listSellerOrders(user.$id);
            const ordersWithItems = await Promise.all(
                sellerOrders.map(async order => ({
                    ...order,
                    items: await listOrderItems(order.$id)
                }))
            );
            setOrders(ordersWithItems);
        } catch (err) {
            console.error("Failed to load seller orders.", err);
            setOrders([]);
            setError("Unable to load your leads right now.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadOrders();
    }, [user?.$id]);

    async function handleMarkPurchased(orderId: string) {
        setUpdatingOrderId(orderId);
        setError(null);

        try {
            const updatedOrder = await markOrderPurchased(orderId);
            setOrders(current =>
                current.map(order =>
                    order.$id === orderId
                        ? { ...order, ...updatedOrder }
                        : order
                )
            );
        } catch (err) {
            console.error("Failed to mark order as purchased.", err);
            setError("Unable to mark this lead as purchased. Please try again.");
        } finally {
            setUpdatingOrderId(null);
        }
    }

    function toggleOrderDetails(orderId: string) {
        setExpandedOrderIds(current => {
            const next = new Set(current);
            if (next.has(orderId)) {
                next.delete(orderId);
            } else {
                next.add(orderId);
            }
            return next;
        });
    }

    const contactedCount = orders.filter(order => order.status === "contacted").length;
    const purchasedCount = orders.filter(order => order.status === "purchased").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Leads & Orders
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Customer WhatsApp leads and order activity for your store.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => void loadOrders()}
                    disabled={loading || updatingOrderId !== null}
                    className="w-full sm:w-auto"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Leads / Orders</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {loading ? "…" : orders.length}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Open Leads</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {loading ? "…" : contactedCount}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Purchased</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {loading ? "…" : purchasedCount}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Loading leads…
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            No leads yet
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            When a customer starts a WhatsApp conversation from one of your products,
                            the lead will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {orders.map(order => {
                            const isExpanded = expandedOrderIds.has(order.$id);
                            const primaryItem = order.items[0];

                            return (
                                <div key={order.$id} className="p-5 space-y-4">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-semibold text-gray-900 dark:text-white">
                                                    {order.customerName}
                                                </h2>
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 truncate">
                                                {primaryItem?.productTitle ?? "Product details unavailable"}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {order.source} · {formatDate(order.contactedAt)}
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:shrink-0">
                                            <div className="text-left sm:text-right">
                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    ₦{order.total.toLocaleString()}
                                                </p>
                                                {order.purchasedAt && (
                                                    <p className="text-xs text-green-600 dark:text-green-400">
                                                        Purchased {formatDate(order.purchasedAt)}
                                                    </p>
                                                )}
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleOrderDetails(order.$id)}
                                                aria-expanded={isExpanded}
                                                className="justify-between sm:justify-center"
                                            >
                                                {isExpanded ? "Hide details" : "View details"}
                                                <ChevronDown
                                                    className={`w-4 h-4 ml-2 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                                />
                                            </Button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="rounded-lg border p-4">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                    <Package className="w-4 h-4" />
                                                    Product
                                                </div>
                                                {order.items.length === 0 ? (
                                                    <p className="text-sm text-gray-500">No item details found.</p>
                                                ) : (
                                                    order.items.map(item => (
                                                        <div key={item.$id} className="text-sm">
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {item.productTitle}
                                                            </p>
                                                            <p className="text-gray-500 dark:text-gray-400">
                                                                {item.quantity} × ₦{item.unitPrice.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            <div className="rounded-lg border p-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                    Customer contact
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {order.customerPhone}
                                                </p>
                                                {order.customerEmail && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">
                                                        {order.customerEmail}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                                    Lead created {formatDate(order.contactedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {order.status === "contacted" && (
                                        <div className="flex justify-end">
                                            <Button
                                                onClick={() => void handleMarkPurchased(order.$id)}
                                                disabled={updatingOrderId !== null}
                                            >
                                                {updatingOrderId === order.$id ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                )}
                                                {updatingOrderId === order.$id
                                                    ? "Marking Purchased…"
                                                    : "Mark as Purchased"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
