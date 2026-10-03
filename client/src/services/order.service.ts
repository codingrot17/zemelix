import { Permission, Query, Role } from "appwrite";
import { ID, databases, DB_ID } from "@/lib/appwrite/client";
import { getCurrentAccount } from "@/lib/appwrite/account";

const ORDERS_COLLECTION_ID = "orders";
const ORDER_ITEMS_COLLECTION_ID = "order_items";

export type OrderStatus = "contacted" | "purchased" | "cancelled";

export interface CreateOrderItemInput {
    productId: string;
    productTitle: string;
    quantity: number;
    unitPrice: number;
    imageUrl?: string | null;
}

export interface CreateSellerOrderInput {
    checkoutSessionId: string;
    sellerId: string;
    customerName: string;
    customerEmail?: string | null;
    customerPhone: string;
    items: CreateOrderItemInput[];
}

export interface OrderItem {
    $id: string;
    $createdAt: string;
    orderId: string;
    productId: string;
    productTitle: string;
    quantity: number;
    unitPrice: number;
    total: number;
    imageUrl: string | null;
}

export interface Order {
    $id: string;
    $createdAt: string;
    checkoutSessionId: string;
    sellerId: string;
    customerId: string | null;
    status: OrderStatus;
    source: "whatsapp";
    subtotal: number;
    total: number;
    customerName: string;
    customerEmail: string | null;
    customerPhone: string;
    contactedAt: string;
    purchasedAt: string | null;
    cancelledAt: string | null;
}

type OrderDocument = {
    $id: string;
    $createdAt?: string;
    checkoutSessionId?: string;
    sellerId?: string;
    customerId?: string;
    status?: string;
    subtotal?: unknown;
    total?: unknown;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    contactedAt?: string;
    purchasedAt?: string;
    cancelledAt?: string;
};

type OrderItemDocument = {
    $id: string;
    $createdAt?: string;
    orderId?: string;
    productId?: string;
    productTitle?: string;
    quantity?: unknown;
    unitPrice?: unknown;
    total?: unknown;
    imageUrl?: string;
};

function assertOrderConfig() {
    if (!DB_ID) {
        throw new Error("Appwrite database configuration is missing. Set VITE_APPWRITE_DB_ID.");
    }
}

async function requireCurrentUserId(): Promise<string> {
    const account = await getCurrentAccount();
    if (!account?.$id) {
        throw new Error("You must be signed in to manage orders.");
    }
    return account.$id;
}

function toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function toOrderStatus(value: unknown): OrderStatus {
    return value === "purchased" || value === "cancelled" ? value : "contacted";
}

function toOrder(document: OrderDocument): Order {
    return {
        $id: document.$id,
        $createdAt: document.$createdAt ?? "",
        checkoutSessionId: document.checkoutSessionId ?? "",
        sellerId: document.sellerId ?? "",
        customerId: document.customerId ?? null,
        status: toOrderStatus(document.status),
        source: "whatsapp",
        subtotal: toNumber(document.subtotal),
        total: toNumber(document.total),
        customerName: document.customerName ?? "",
        customerEmail: document.customerEmail ?? null,
        customerPhone: document.customerPhone ?? "",
        contactedAt: document.contactedAt ?? "",
        purchasedAt: document.purchasedAt ?? null,
        cancelledAt: document.cancelledAt ?? null
    };
}

function toOrderItem(document: OrderItemDocument): OrderItem {
    return {
        $id: document.$id,
        $createdAt: document.$createdAt ?? "",
        orderId: document.orderId ?? "",
        productId: document.productId ?? "",
        productTitle: document.productTitle ?? "",
        quantity: toNumber(document.quantity),
        unitPrice: toNumber(document.unitPrice),
        total: toNumber(document.total),
        imageUrl: document.imageUrl ?? null
    };
}

function validateItems(items: CreateOrderItemInput[]) {
    if (items.length === 0) {
        throw new Error("At least one order item is required.");
    }

    for (const item of items) {
        if (!item.productId.trim() || !item.productTitle.trim()) {
            throw new Error("Each order item must include a product.");
        }
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
            throw new Error("Order item quantity must be at least 1.");
        }
        if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
            throw new Error("Order item price must be a valid non-negative number.");
        }
    }
}

function orderPermissions(customerId: string, sellerId: string) {
    return [
        Permission.read(Role.user(customerId)),
        Permission.read(Role.user(sellerId)),
        Permission.update(Role.user(sellerId))
    ];
}

function orderItemPermissions(customerId: string, sellerId: string) {
    return [
        Permission.read(Role.user(customerId)),
        Permission.read(Role.user(sellerId))
    ];
}

export async function createSellerOrder(
    input: CreateSellerOrderInput
): Promise<{ order: Order; items: OrderItem[] }> {
    assertOrderConfig();
    const customerId = await requireCurrentUserId();

    if (!input.sellerId.trim()) throw new Error("sellerId is required.");
    if (!input.checkoutSessionId.trim()) throw new Error("checkoutSessionId is required.");
    if (!input.customerName.trim() || !input.customerPhone.trim()) {
        throw new Error("Customer name and phone are required.");
    }

    validateItems(input.items);

    const subtotal = input.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
    );
    const contactedAt = new Date().toISOString();

    const orderDocument = await databases.createDocument(
        DB_ID,
        ORDERS_COLLECTION_ID,
        ID.unique(),
        {
            checkoutSessionId: input.checkoutSessionId,
            sellerId: input.sellerId,
            customerId,
            status: "contacted",
            source: "whatsapp",
            subtotal,
            total: subtotal,
            customerName: input.customerName.trim(),
            customerEmail: input.customerEmail?.trim() || null,
            customerPhone: input.customerPhone.trim(),
            contactedAt,
            purchasedAt: null,
            cancelledAt: null
        },
        orderPermissions(customerId, input.sellerId)
    );

    const order = toOrder(orderDocument as OrderDocument);
    const createdItems: OrderItem[] = [];

    try {
        for (const item of input.items) {
            const itemDocument = await databases.createDocument(
                DB_ID,
                ORDER_ITEMS_COLLECTION_ID,
                ID.unique(),
                {
                    orderId: order.$id,
                    productId: item.productId,
                    productTitle: item.productTitle.trim(),
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.unitPrice * item.quantity,
                    imageUrl: item.imageUrl?.trim() || null
                },
                orderItemPermissions(customerId, input.sellerId)
            );

            createdItems.push(toOrderItem(itemDocument as OrderItemDocument));
        }
    } catch (error) {
        try {
            await databases.deleteDocument(DB_ID, ORDERS_COLLECTION_ID, order.$id);
        } catch {
            // Preserve the original error if cleanup is not possible.
        }
        throw error;
    }

    return { order, items: createdItems };
}

export async function listSellerOrders(sellerId: string, limit = 100): Promise<Order[]> {
    assertOrderConfig();
    const currentUserId = await requireCurrentUserId();

    if (currentUserId !== sellerId) {
        throw new Error("You can only access your own orders.");
    }

    const response = await databases.listDocuments(DB_ID, ORDERS_COLLECTION_ID, [
        Query.equal("sellerId", sellerId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit)
    ]);

    return response.documents.map(document => toOrder(document as OrderDocument));
}

export async function listCustomerOrders(limit = 100): Promise<Order[]> {
    assertOrderConfig();
    const customerId = await requireCurrentUserId();

    const response = await databases.listDocuments(DB_ID, ORDERS_COLLECTION_ID, [
        Query.equal("customerId", customerId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit)
    ]);

    return response.documents.map(document => toOrder(document as OrderDocument));
}

export async function getOrder(orderId: string): Promise<Order> {
    assertOrderConfig();
    if (!orderId.trim()) throw new Error("orderId is required.");

    await requireCurrentUserId();

    const document = await databases.getDocument(DB_ID, ORDERS_COLLECTION_ID, orderId);
    return toOrder(document as OrderDocument);
}

export async function listOrderItems(orderId: string): Promise<OrderItem[]> {
    assertOrderConfig();
    if (!orderId.trim()) throw new Error("orderId is required.");

    await requireCurrentUserId();

    const response = await databases.listDocuments(DB_ID, ORDER_ITEMS_COLLECTION_ID, [
        Query.equal("orderId", orderId),
        Query.orderAsc("$createdAt"),
        Query.limit(100)
    ]);

    return response.documents.map(document => toOrderItem(document as OrderItemDocument));
}

export async function markOrderPurchased(orderId: string): Promise<Order> {
    assertOrderConfig();
    const sellerId = await requireCurrentUserId();

    if (!orderId.trim()) throw new Error("orderId is required.");

    const existing = await databases.getDocument(
        DB_ID,
        ORDERS_COLLECTION_ID,
        orderId
    ) as OrderDocument;

    if (existing.sellerId !== sellerId) {
        throw new Error("You can only update your own orders.");
    }
    if (existing.status !== "contacted") {
        throw new Error("Only contacted orders can be marked as purchased.");
    }

    const document = await databases.updateDocument(
        DB_ID,
        ORDERS_COLLECTION_ID,
        orderId,
        { status: "purchased", purchasedAt: new Date().toISOString() }
    );

    return toOrder(document as OrderDocument);
}

export async function markOrderCancelled(orderId: string): Promise<Order> {
    assertOrderConfig();
    const sellerId = await requireCurrentUserId();

    if (!orderId.trim()) throw new Error("orderId is required.");

    const existing = await databases.getDocument(
        DB_ID,
        ORDERS_COLLECTION_ID,
        orderId
    ) as OrderDocument;

    if (existing.sellerId !== sellerId) {
        throw new Error("You can only update your own orders.");
    }
    if (existing.status !== "contacted") {
        throw new Error("Only contacted orders can be cancelled.");
    }

    const document = await databases.updateDocument(
        DB_ID,
        ORDERS_COLLECTION_ID,
        orderId,
        { status: "cancelled", cancelledAt: new Date().toISOString() }
    );

    return toOrder(document as OrderDocument);
}
