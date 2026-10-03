import { Client, Databases, ID, Permission, Role } from "node-appwrite";

const ORDERS_COLLECTION_ID = "orders";
const ORDER_ITEMS_COLLECTION_ID = "order_items";
const PRODUCTS_COLLECTION_ID = "products";
const PUBLIC_FIELDS = [
    "businessName",
    "fullName",
    "logo",
    "coverImage",
    "primaryColor",
    "slogan",
    "businessDescription",
    "vendorType",
    "businessCategory",
    "socialLinks",
];

function isNonEmptyString(value, maxLength = 500) {
    return typeof value === "string" &&
        value.trim().length > 0 &&
        value.length <= maxLength;
}

function isValidSellerId(value) {
    return isNonEmptyString(value, 128) && !/\s/.test(value);
}

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function toPublicSellerProfile(document) {
    return {
        id: document.$id,
        ...Object.fromEntries(
            PUBLIC_FIELDS.map(field => [field, document[field] ?? null])
        ),
    };
}

function jsonError(res, message, status) {
    return res.json({ ok: false, error: message }, status);
}

function getServerClient() {
    const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
    const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
    const apiKey = process.env.APPWRITE_FUNCTION_API_KEY;

    if (!endpoint || !projectId || !apiKey) {
        return null;
    }

    return new Client()
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setKey(apiKey);
}

async function createSellerOrder({ req, res, error, databases, databaseId, userCollectionId }) {
    const customerId = req.headers["x-appwrite-user-id"];

    if (!customerId) {
        return jsonError(res, "You must be signed in to create an order.", 401);
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

    try {
        const seller = await databases.getDocument(
            databaseId,
            userCollectionId,
            sellerId
        );

        if (
            seller.role !== "seller" ||
            seller.accountStatus !== "active" ||
            seller.vendorStatus !== "active"
        ) {
            return jsonError(res, "Seller is not available.", 404);
        }

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
        const productTitle = typeof product.title === "string"
            ? product.title.trim()
            : "";

        if (!productTitle || unitPrice < 0) {
            return jsonError(res, "Product data is invalid.", 400);
        }

        const contactedAt = new Date().toISOString();
        const orderDocument = await databases.createDocument(
            databaseId,
            ORDERS_COLLECTION_ID,
            ID.unique(),
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
                cancelledAt: null,
            },
            [
                Permission.read(Role.user(customerId)),
                Permission.read(Role.user(sellerId)),
                Permission.update(Role.user(sellerId)),
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
                    imageUrl: typeof product.imageUrl === "string"
                        ? product.imageUrl
                        : null,
                },
                [
                    Permission.read(Role.user(customerId)),
                    Permission.read(Role.user(sellerId)),
                ]
            );

            return res.json({
                ok: true,
                order: orderDocument,
                item: itemDocument,
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
            return jsonError(res, "Seller or product not found.", 404);
        }

        error(err?.message ?? "Seller order creation failed.");
        return jsonError(res, "Seller order creation failed.", 500);
    }
}

export default async ({ req, res, error }) => {
    if (req.method !== "POST") {
        return jsonError(res, "Method not allowed.", 405);
    }

    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const collectionId = process.env.APPWRITE_USER_COLLECTION_ID;
    const client = getServerClient();

    if (!databaseId || !collectionId || !client) {
        error("Public seller profile function is missing Appwrite configuration.");
        return jsonError(res, "Function configuration is incomplete.", 500);
    }

    const databases = new Databases(client);
    const body = req.bodyJson ?? {};

    if (body.operation === "createSellerOrder") {
        return createSellerOrder({
            req,
            res,
            error,
            databases,
            databaseId,
            userCollectionId: collectionId,
        });
    }

    const sellerId = body.sellerId;

    if (!isValidSellerId(sellerId)) {
        return jsonError(res, "A valid sellerId is required.", 400);
    }

    try {
        const document = await databases.getDocument(
            databaseId,
            collectionId,
            sellerId
        );

        if (
            document.role !== "seller" ||
            document.accountStatus !== "active" ||
            document.vendorStatus !== "active"
        ) {
            return jsonError(res, "Seller profile not found.", 404);
        }

        return res.json({
            ok: true,
            seller: toPublicSellerProfile(document),
        });
    } catch (err) {
        if (err?.code === 404) {
            return jsonError(res, "Seller profile not found.", 404);
        }

        error(err?.message ?? "Public seller profile lookup failed.");
        return jsonError(res, "Public seller profile lookup failed.", 500);
    }
};
