import { ID, Permission, Query, Role } from "appwrite";
import { databases, DB_ID, functions } from "@/lib/appwrite/client";
import { getCurrentAccount } from "@/lib/appwrite/account";

const ORDERS_COLLECTION_ID = "orders";
const ORDER_ITEMS_COLLECTION_ID = "order_items";
const PUBLIC_SELLER_PROFILE_FUNCTION_ID = "public-seller-profile";

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
    isArchived: boolean;
}

type OrderDocument = {
    $id: string;
    $createdAt?: string;
    checkoutSessionId?: string;
    sellerId?: string;
    customerId?: string | null;
    status?: string;
    source?: string;
    subtotal?: unknown;
    total?: unknown;
    customerName?: string;
    customerEmail?: string | null;
    customerPhone?: string;
    contactedAt?: string;
    purchasedAt?: string | null;
    cancelledAt?: string | null;
    isArchived?: boolean;
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
    imageUrl?: string | null;
};

function assertOrderConfig() {
    if (!DB_ID) {
        throw new Error(
            "Appwrite database configuration is missing. Set VITE_APPWRITE_DB_ID."
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
    return value === "purchased" || value === "cancelled"
        ? value
        : "contacted";
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
        cancelledAt: document.cancelledAt ?? null,
        isArchived: document.isArchived === true
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
            throw new Error(
                "Order item price must be a valid non-negative number."
            );
        }
    }
}

function buildOrderPermissions(customerId: string, sellerId: string) {
    return [
        Permission.read(Role.user(customerId)),
        Permission.read(Role.user(sellerId)),
        Permission.update(Role.user(sellerId))
    ];
}

function buildOrderItemPermissions(customerId: string, sellerId: string) {
    return [
        Permission.read(Role.user(customerId)),
        Permission.read(Role.user(sellerId))
    ];
}

async function executeSellerOrderOperation(
    operation: "markSellerOrderPurchased" | "undoSellerOrderPurchase" | "archiveSellerOrder" | "unarchiveSellerOrder",
    orderId: string
): Promise<Order> {
    const execution = await functions.createExecution(
        PUBLIC_SELLER_PROFILE_FUNCTION_ID,
        JSON.stringify({ operation, orderId: orderId.trim() })
    );

    if (execution.responseStatusCode < 200 || execution.responseStatusCode >= 300) {
        let message = "Could not update the seller order.";
        try {
            const body = JSON.parse(execution.responseBody || "{}");
            if (typeof body.error === "string" && body.error.trim()) {
                message = body.error;
            }
        } catch {
            // Keep the generic error when the Function response is not JSON.
        }
        throw new Error(message);
    }

    try {
        const body = JSON.parse(execution.responseBody || "{}");
        if (!body.ok || !body.order) {
            throw new Error(
                typeof body.error === "string" && body.error.trim()
                    ? body.error
                    : "Could not update the seller order."
            );
        }
        return toOrder(body.order as OrderDocument);
    } catch (error) {
        if (error instanceof Error && error.message !== "Unexpected end of JSON input") {
            throw error;
        }
        throw new Error("The seller order Function returned an invalid response.");
    }
}

export async function createSellerOrder(
    input: CreateSellerOrderInput
): Promise<{ order: Order; items: OrderItem[] }> {
    assertOrderConfig();

    await requireCurrentUserId();

    if (!input.sellerId.trim()) {
        throw new Error("sellerId is required.");
    }
    if (!input.checkoutSessionId.trim()) {
        throw new Error("checkoutSessionId is required.");
    }
    if (!input.customerName.trim() || !input.customerPhone.trim()) {
        throw new Error("Customer name and phone are required.");
    }

    validateItems(input.items);

    if (input.items.length !== 1 || input.items[0].quantity !== 1) {
        throw new Error("Single-product lead creation requires exactly one item.");
    }

    const item = input.items[0];

    const execution = await functions.createExecution(
        PUBLIC_SELLER_PROFILE_FUNCTION_ID,
        JSON.stringify({
            operation: "createSellerOrder",
            sellerId: input.sellerId.trim(),
            productId: item.productId.trim(),
            checkoutSessionId: input.checkoutSessionId.trim(),
            customerName: input.customerName.trim(),
            customerEmail: input.customerEmail?.trim() || null,
            customerPhone: input.customerPhone.trim()
        })
    );

    if (execution.responseStatusCode < 200 || execution.responseStatusCode >= 300) {
        let message = "Could not create the WhatsApp lead.";
        try {
            const body = JSON.parse(execution.responseBody || "{}");
            if (typeof body.error === "string" && body.error.trim()) {
                message = body.error;
            }
        } catch {
            // Keep the generic error when the Function response is not JSON.
        }
        throw new Error(message);
    }

    let responseBody: {
        ok?: boolean;
        order?: OrderDocument;
        item?: OrderItemDocument;
        error?: string;
    };

    try {
        responseBody = JSON.parse(execution.responseBody || "{}");
    } catch {
        throw new Error("The seller lead Function returned an invalid response.");
    }

    if (!responseBody.ok || !responseBody.order || !responseBody.item) {
        throw new Error(
            typeof responseBody.error === "string" && responseBody.error.trim()
                ? responseBody.error
                : "Could not create the WhatsApp lead."
        );
    }

    return {
        order: toOrder(responseBody.order),
        items: [toOrderItem(responseBody.item)]
    };
}

export async function listSellerOrders(
    sellerId: string,
    limit = 100
): Promise<Order[]> {
    assertOrderConfig();

    const currentUserId = await requireCurrentUserId();

    if (currentUserId !== sellerId) {
        throw new Error("You can only access your own orders.");
    }

    const response = await databases.listDocuments(
        DB_ID,
        ORDERS_COLLECTION_ID,
        [
            Query.equal("sellerId", sellerId),
            Query.orderDesc("$createdAt"),
            Query.limit(limit)
        ]
    );

    return response.documents.map(document =>
        toOrder(document as OrderDocument)
    );
}

export async function listCustomerOrders(limit = 100): Promise<Order[]> {
    assertOrderConfig();

    const customerId = await requireCurrentUserId();

    const response = await databases.listDocuments(
        DB_ID,
        ORDERS_COLLECTION_ID,
        [
            Query.equal("customerId", customerId),
            Query.orderDesc("$createdAt"),
            Query.limit(limit)
        ]
    );

    return response.documents.map(document =>
        toOrder(document as OrderDocument)
    );
}

export async function getOrder(orderId: string): Promise<Order> {
    assertOrderConfig();

    if (!orderId.trim()) {
        throw new Error("orderId is required.");
    }

    const currentUserId = await requireCurrentUserId();
    const document = await databases.getDocument(
        DB_ID,
        ORDERS_COLLECTION_ID,
        orderId
    ) as OrderDocument;

    if (
        document.customerId !== currentUserId &&
        document.sellerId !== currentUserId
    ) {
        throw new Error("You do not have access to this order.");
    }

    return toOrder(document);
}

export async function listOrderItems(orderId: string): Promise<OrderItem[]> {
    assertOrderConfig();

    if (!orderId.trim()) {
        throw new Error("orderId is required.");
    }

    await getOrder(orderId);

    const response = await databases.listDocuments(
        DB_ID,
        ORDER_ITEMS_COLLECTION_ID,
        [
            Query.equal("orderId", orderId),
            Query.orderAsc("$createdAt"),
            Query.limit(100)
        ]
    );

    return response.documents.map(document =>
        toOrderItem(document as OrderItemDocument)
    );
}

export async function markOrderPurchased(orderId: string): Promise<Order> {
    assertOrderConfig();

    await requireCurrentUserId();

    if (!orderId.trim()) {
        throw new Error("orderId is required.");
    }

    return executeSellerOrderOperation("markSellerOrderPurchased", orderId);
}

export async function markOrderCancelled(orderId: string): Promise<Order> {
    assertOrderConfig();

    const sellerId = await requireCurrentUserId();

    if (!orderId.trim()) {
        throw new Error("orderId is required.");
    }

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
        {
            status: "cancelled",
            cancelledAt: new Date().toISOString()
        }
    );

    return toOrder(document as OrderDocument);
}

export async function setOrderArchived(
    orderId: string,
    archived: boolean
): Promise<Order> {
    assertOrderConfig();

    await requireCurrentUserId();

    if (!orderId.trim()) {
        throw new Error("orderId is required.");
    }

    return executeSellerOrderOperation(
        archived ? "archiveSellerOrder" : "unarchiveSellerOrder",
        orderId
    );
}

export async function undoOrderPurchased(orderId: string): Promise<Order> {
    assertOrderConfig();

    await requireCurrentUserId();

    if (!orderId.trim()) {
        throw new Error("orderId is required.");
    }

    return executeSellerOrderOperation("undoSellerOrderPurchase", orderId);
}
