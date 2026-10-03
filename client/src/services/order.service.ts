import { Query, databases, DB_ID, functions } from "@/lib/appwrite/client";
import { getCurrentAccount } from "@/lib/appwrite/account";

const ORDERS_COLLECTION_ID = "orders";
const ORDER_ITEMS_COLLECTION_ID = "order_items";
const CREATE_SELLER_ORDER_FUNCTION_ID =
    import.meta.env.VITE_APPWRITE_PUBLIC_SELLER_PROFILE_FUNCTION_ID;

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
    if (!CREATE_SELLER_ORDER_FUNCTION_ID) {
        throw new Error(
            "VITE_APPWRITE_PUBLIC_SELLER_PROFILE_FUNCTION_ID is required."
        );
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

export async function createSellerOrder(
    input: CreateSellerOrderInput
): Promise<{ order: Order; items: OrderItem[] }> {
    assertOrderConfig();
    await requireCurrentUserId();

    if (!input.sellerId.trim()) throw new Error("sellerId is required.");
    if (!input.checkoutSessionId.trim()) throw new Error("checkoutSessionId is required.");
    if (!input.customerName.trim() || !input.customerPhone.trim()) {
        throw new Error("Customer name and phone are required.");
    }

    validateItems(input.items);

    if (input.items.length !== 1) {
        throw new Error("Seller order creation currently supports one product at a time.");
    }

    const execution = await functions.createExecution(
        CREATE_SELLER_ORDER_FUNCTION_ID,
        JSON.stringify({
            operation: "createSellerOrder",
            checkoutSessionId: input.checkoutSessionId,
            sellerId: input.sellerId,
            customerName: input.customerName,
            customerEmail: input.customerEmail ?? null,
            customerPhone: input.customerPhone,
            productId: input.items[0].productId
        }),
        false
    );

    if (
        execution.responseStatusCode < 200 ||
        execution.responseStatusCode >= 300
    ) {
        let message = "Could not create the seller lead.";
        try {
            const response = JSON.parse(execution.responseBody || "{}");
            if (typeof response.error === "string" && response.error) {
                message = response.error;
            }
        } catch {
            // Keep the generic message when the function response is not JSON.
        }
        throw new Error(message);
    }

    try {
        const response = JSON.parse(execution.responseBody || "{}");
        if (!response.ok || !response.order || !response.item) {
            throw new Error("Could not create the seller lead.");
        }

        return {
            order: toOrder(response.order as OrderDocument),
            items: [toOrderItem(response.item as OrderItemDocument)]
        };
    } catch (error) {
        if (error instanceof Error && error.message !== "Could not create the seller lead.") {
            throw error;
        }
        throw new Error("Could not create the seller lead.");
    }
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
