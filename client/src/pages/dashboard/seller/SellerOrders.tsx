import { useEffect, useMemo, useState } from "react";
import { Archive, ArchiveRestore, AlertCircle, CheckCircle, ChevronDown, Loader2, MessageCircle, Package, RefreshCw, Undo2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
    listOrderItems,
    listSellerOrders,
    markOrderPurchased,
    markOrderCancelled,
    undoOrderPurchased,
    setOrderArchived,
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
    const [view, setView] = useState<"active" | "history" | "archived">("active");

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

    async function handleCancel(orderId: string) {
        const confirmed = window.confirm(
            "Cancel this lead? It will move to History as Cancelled and cannot be returned to Active."
        );

        if (!confirmed) return;

        setUpdatingOrderId(orderId);
        setError(null);

        try {
            const updatedOrder = await markOrderCancelled(orderId);
            setOrders(current =>
                current.map(order =>
                    order.$id === orderId
                        ? { ...order, ...updatedOrder }
                        : order
                )
            );
        } catch (err) {
            console.error("Failed to cancel order.", err);
            setError("Unable to cancel this lead. Please try again.");
        } finally {
            setUpdatingOrderId(null);
        }
    }

    async function handleUndoPurchased(orderId: string) {
        const confirmed = window.confirm(
            "Undo this purchase? The order will return to Open Leads and the purchased quantity will be added back to stock."
        );

        if (!confirmed) return;

        setUpdatingOrderId(orderId);
        setError(null);

        try {
            const updatedOrder = await undoOrderPurchased(orderId);
            setOrders(current =>
                current.map(order =>
                    order.$id === orderId
                        ? { ...order, ...updatedOrder }
                        : order
                )
            );
        } catch (err) {
            console.error("Failed to undo purchased order.", err);
            setError("Unable to undo this purchase. Please try again.");
        } finally {
            setUpdatingOrderId(null);
        }
    }

    async function handleArchive(orderId: string, archived: boolean) {
        const confirmed = window.confirm(
            archived
                ? "Archive this lead? It will leave Active but remain available in Archived."
                : "Restore this lead to Active?"
        );

        if (!confirmed) return;

        setUpdatingOrderId(orderId);
        setError(null);

        try {
            const updatedOrder = await setOrderArchived(orderId, archived);
            setOrders(current =>
                current.map(order =>
                    order.$id === orderId
                        ? { ...order, ...updatedOrder }
                        : order
                )
            );
        } catch (err) {
            console.error("Failed to update lead archive state.", err);
            setError(
                archived
                    ? "Unable to archive this lead. Please try again."
                    : "Unable to restore this lead. Please try again."
            );
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
    const cancelledCount = orders.filter(order => order.status === "cancelled").length;
    const archivedCount = orders.filter(order => order.isArchived && order.status === "contacted").length;
    const visibleOrders = useMemo(
        () =>
            orders.filter(order => {
                if (view === "active") {
                    return order.status === "contacted" && !order.isArchived;
                }

                if (view === "archived") {
                    return order.status === "contacted" && order.isArchived;
                }

                return order.status === "purchased" || order.status === "cancelled";
            }),
        [orders, view]
    );

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
                <div className="flex flex-wrap items-center gap-2 border-b p-3">
                    <Button
                        variant={view === "active" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setView("active")}
                    >
                        Active ({contactedCount - archivedCount})
                    </Button>
                    <Button
                        variant={view === "history" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setView("history")}
                    >
                        History ({purchasedCount + cancelledCount})
                    </Button>
                    <Button
                        variant={view === "archived" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setView("archived")}
                    >
                        Archived ({archivedCount})
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Loading leads…
                    </div>
                ) : visibleOrders.length === 0 ? (
                    <div className="p-12 text-center">
                        <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            {view === "active"
                                ? "No active leads"
                                : view === "archived"
                                    ? "No archived leads"
                                    : "No order history"}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {view === "active"
                                ? "New WhatsApp leads will appear here until they are purchased or cancelled."
                                : view === "archived"
                                    ? "Archived leads remain here until you restore them."
                                    : "Purchased and cancelled orders will remain here as your history."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {visibleOrders.map(order => {
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
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => void handleArchive(order.$id, !order.isArchived)}
                                                disabled={updatingOrderId !== null}
                                            >
                                                {updatingOrderId === order.$id ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : order.isArchived ? (
                                                    <ArchiveRestore className="w-4 h-4 mr-2" />
                                                ) : (
                                                    <Archive className="w-4 h-4 mr-2" />
                                                )}
                                                {updatingOrderId === order.$id
                                                    ? order.isArchived ? "Restoring…" : "Archiving…"
                                                    : order.isArchived ? "Restore Lead" : "Archive Lead"}
                                            </Button>
                                            {!order.isArchived && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => void handleCancel(order.$id)}
                                                    disabled={updatingOrderId !== null}
                                                >
                                                    {updatingOrderId === order.$id ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                    )}
                                                    {updatingOrderId === order.$id
                                                        ? "Cancelling…"
                                                        : "Cancel Lead"}
                                                </Button>
                                            )}
                                            {!order.isArchived && (
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
                                            )}
                                        </div>
                                    )}

                                    {order.status === "purchased" && (
                                        <div className="flex justify-end">
                                            <Button
                                                variant="outline"
                                                onClick={() => void handleUndoPurchased(order.$id)}
                                                disabled={updatingOrderId !== null}
                                            >
                                                {updatingOrderId === order.$id ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Undo2 className="w-4 h-4 mr-2" />
                                                )}
                                                {updatingOrderId === order.$id
                                                    ? "Undoing Purchase…"
                                                    : "Undo Purchase"}
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