import { Client, Databases, ID, Permission, Role } from "node-appwrite";

const ORDERS_COLLECTION_ID = "orders";
const ORDER_ITEMS_COLLECTION_ID = "order_items";
const PRODUCTS_COLLECTION_ID = "products";

function isNonEmptyString(value, maxLength = 500) {
    return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

function isValidSellerId(value) {
    return isNonEmptyString(value, 128) && !/\s/.test(value);
}

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function jsonError(res, message, status) {
    return res.json({ ok: false, error: message }, status);
}

export default async ({ req, res, error }) => {
    if (req.method !== "POST") {
        return jsonError(res, "Method not allowed.", 405);
    }

    const customerId = req.headers["x-appwrite-user-id"];
    const apiKey = req.headers["x-appwrite-key"];
    const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
    const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
    const databaseId = process.env.APPWRITE_DATABASE_ID;

    if (!customerId) {
        return jsonError(res, "You must be signed in to create an order.", 401);
    }

    if (!endpoint || !projectId || !apiKey || !databaseId) {
        error("Create seller order function is missing Appwrite configuration.");
        return jsonError(res, "Function configuration is incomplete.", 500);
    }

    const body = req.bodyJson ?? {};
    const sellerId = body.sellerId;
    const productId = body.productId;
    const checkoutSessionId = body.checkoutSessionId;
    const customerName = body.customerName;
    const customerEmail = body.customerEmail ?? null;
    const customerPhone = body.customerPhone;

    if (!isValidSellerId(sellerId) || !isNonEmptyString(productId, 128)) {
        return jsonError(res, "A valid sellerId and productId are required.", 400);
    }

    if (!isNonEmptyString(checkoutSessionId, 128)) {
        return jsonError(res, "A valid checkoutSessionId is required.", 400);
    }

    if (!isNonEmptyString(customerName, 200) || !isNonEmptyString(customerPhone, 50)) {
        return jsonError(res, "Customer name and phone are required.", 400);
    }

    if (customerEmail !== null && !isNonEmptyString(customerEmail, 320)) {
        return jsonError(res, "Customer email is invalid.", 400);
    }

    const client = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setKey(apiKey);

    const databases = new Databases(client);

    try {
        const product = await databases.getDocument(
            databaseId,
            PRODUCTS_COLLECTION_ID,
            productId
        );

        if (
            product.sellerId !== sellerId ||
            product.status !== "active"
        ) {
            return jsonError(res, "Product is not available from this seller.", 400);
        }

        const unitPrice = toNumber(product.price);
        const productTitle = typeof product.title === "string" ? product.title.trim() : "";

        if (!productTitle || unitPrice < 0) {
            return jsonError(res, "Product data is invalid.", 400);
        }

        const contactedAt = new Date().toISOString();
        const orderId = ID.unique();

        const orderDocument = await databases.createDocument(
            databaseId,
            ORDERS_COLLECTION_ID,
            orderId,
            {
                checkoutSessionId: checkoutSessionId.trim(),
                sellerId,
                customerId,
                status: "contacted",
                source: "whatsapp",
                subtotal: unitPrice,
                total: unitPrice,
                customerName: customerName.trim(),
                customerEmail: customerEmail?.trim() || null,
                customerPhone: customerPhone.trim(),
                contactedAt,
                purchasedAt: null,
                cancelledAt: null
            },
            [
                Permission.read(Role.user(customerId)),
                Permission.read(Role.user(sellerId)),
                Permission.update(Role.user(sellerId))
            ]
        );

        try {
            const itemDocument = await databases.createDocument(
                databaseId,
                ORDER_ITEMS_COLLECTION_ID,
                ID.unique(),
                {
                    orderId: orderDocument.$id,
                    productId,
                    productTitle,
                    quantity: 1,
                    unitPrice,
                    total: unitPrice,
                    imageUrl: typeof product.imageUrl === "string" ? product.imageUrl : null
                },
                [
                    Permission.read(Role.user(customerId)),
                    Permission.read(Role.user(sellerId))
                ]
            );

            return res.json({
                ok: true,
                order: orderDocument,
                item: itemDocument
            });
        } catch (itemError) {
            try {
                await databases.deleteDocument(
                    databaseId,
                    ORDERS_COLLECTION_ID,
                    orderDocument.$id
                );
            } catch {
                // Preserve the original item creation error.
            }
            throw itemError;
        }
    } catch (err) {
        if (err?.code === 404) {
            return jsonError(res, "Product not found.", 404);
        }

        error(err?.message ?? "Seller order creation failed.");
        return jsonError(res, "Seller order creation failed.", 500);
    }
};
