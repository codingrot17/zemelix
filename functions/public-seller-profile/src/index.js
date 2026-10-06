import { Client, Databases, ID, Permission, Role, Query } from "node-appwrite";

const ORDERS_COLLECTION_ID = "orders";

const BOOKINGS_TABLE_ID = "bookings";
const BOOKING_STATUSES = ["requested","accepted","declined","cancelled","completed","no_show","expired"];

async function getBooking({ databases, databaseId, bookingId }) {
    return databases.getDocument(databaseId, BOOKINGS_TABLE_ID, bookingId);
}

function bookingPermissions(buyerId, providerId) {
    return [
        Permission.read(Role.user(buyerId)),
        Permission.read(Role.user(providerId)),
    ];
}

async function createBookingRequest({ req, res, error, databases, databaseId, userCollectionId }) {
    const buyerId = req.headers["x-appwrite-user-id"];
    const body = req.bodyJson ?? {};
    const {
        serviceId, providerId, requestedDateTime, customerName, customerPhone,
        customerEmail = null, serviceMode = null, serviceLocation = null, notes = null
    } = body;

    if (!buyerId) return jsonError(res, "You must be signed in to request a booking.", 401);
    if (!isNonEmptyString(serviceId, 128) || !isValidSellerId(providerId)) return jsonError(res, "A valid service and provider are required.", 400);
    if (!isNonEmptyString(requestedDateTime, 80) || Number.isNaN(Date.parse(requestedDateTime))) return jsonError(res, "A valid requested date and time are required.", 400);
    if (new Date(requestedDateTime).getTime() <= Date.now()) return jsonError(res, "Requested date and time must be in the future.", 400);
    if (!isNonEmptyString(customerName, 200) || !isNonEmptyString(customerPhone, 50)) return jsonError(res, "Customer name and phone are required.", 400);
    if (customerEmail !== null && !isNonEmptyString(customerEmail, 320)) return jsonError(res, "Customer email is invalid.", 400);

    try {
        const provider = await databases.getDocument(databaseId, userCollectionId, providerId);
        if (provider.role !== "seller" || provider.accountStatus !== "active" || provider.vendorStatus !== "active") {
            return jsonError(res, "Service provider is not available.", 404);
        }

        const service = await databases.getDocument(databaseId, PRODUCTS_COLLECTION_ID, serviceId);
        if (service.sellerId !== providerId || service.status !== "active" || service.vendorType !== "service") {
            return jsonError(res, "Service is not available from this provider.", 400);
        }

        const booking = await databases.createDocument(
            databaseId,
            BOOKINGS_TABLE_ID,
            ID.unique(),
            {
                buyerId,
                providerId,
                serviceId,
                serviceTitleSnapshot: String(service.title ?? "").trim(),
                priceSnapshot: toNumber(service.price),
                requestedDateTime: new Date(requestedDateTime).toISOString(),
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                customerEmail: customerEmail?.trim() || null,
                serviceMode: isNonEmptyString(serviceMode, 100) ? serviceMode.trim() : null,
                serviceLocation: typeof serviceLocation === "string" ? serviceLocation.trim().slice(0, 2000) : null,
                notes: typeof notes === "string" ? notes.trim().slice(0, 4000) : null,
                status: "requested",
                providerResponseAt: null,
                completedAt: null,
                cancelledAt: null,
                cancellationReason: null,
                isArchived: false,
            },
            bookingPermissions(buyerId, providerId)
        );

        return res.json({ ok: true, booking });
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Provider or service not found.", 404);
        error(err?.message ?? "Booking request creation failed.");
        return jsonError(res, "Booking request creation failed.", 500);
    }
}

async function mutateBooking({ req, res, error, databases, databaseId, action }) {
    const actorId = req.headers["x-appwrite-user-id"];
    const bookingId = req.bodyJson?.bookingId;
    if (!actorId) return jsonError(res, "You must be signed in to update a booking.", 401);
    if (!isNonEmptyString(bookingId, 128)) return jsonError(res, "A valid bookingId is required.", 400);

    try {
        const booking = await getBooking({ databases, databaseId, bookingId });
        const isProvider = booking.providerId === actorId;
        const isBuyer = booking.buyerId === actorId;
        if (!isProvider && !isBuyer) return jsonError(res, "You can only update your own bookings.", 403);

        const now = new Date().toISOString();
        let data = null;

        if (action === "acceptBooking" && isProvider && booking.status === "requested") {
            data = { status: "accepted", providerResponseAt: now };
        } else if (action === "declineBooking" && isProvider && booking.status === "requested") {
            data = { status: "declined", providerResponseAt: now };
        } else if (action === "cancelBooking" && ((isBuyer && ["requested","accepted"].includes(booking.status)) || (isProvider && ["requested","accepted"].includes(booking.status)))) {
            data = { status: "cancelled", cancelledAt: now };
        } else if (action === "completeBooking" && isProvider && booking.status === "accepted") {
            data = { status: "completed", completedAt: now };
        } else if (action === "noShowBooking" && isProvider && booking.status === "accepted") {
            data = { status: "no_show", completedAt: now };
        }

        if (!data) return jsonError(res, "This booking cannot be updated with that action.", 409);
        const updated = await databases.updateDocument(databaseId, BOOKINGS_TABLE_ID, bookingId, data);
        return res.json({ ok: true, booking: updated });
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Booking not found.", 404);
        error(err?.message ?? "Booking update failed.");
        return jsonError(res, "Booking update failed.", 500);
    }
}

async function setBookingArchived({ req, res, error, databases, databaseId, archived }) {
    const actorId = req.headers["x-appwrite-user-id"];
    const bookingId = req.bodyJson?.bookingId;
    if (!actorId) return jsonError(res, "You must be signed in to archive bookings.", 401);
    if (!isNonEmptyString(bookingId, 128)) return jsonError(res, "A valid bookingId is required.", 400);

    try {
        const booking = await getBooking({ databases, databaseId, bookingId });
        if (booking.providerId !== actorId) return jsonError(res, "Only the provider can archive bookings.", 403);
        const updated = await databases.updateDocument(databaseId, BOOKINGS_TABLE_ID, bookingId, { isArchived: archived });
        return res.json({ ok: true, booking: updated });
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Booking not found.", 404);
        error(err?.message ?? "Booking archive update failed.");
        return jsonError(res, "Booking archive update failed.", 500);
    }
}

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
    return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
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
        ...Object.fromEntries(PUBLIC_FIELDS.map(field => [field, document[field] ?? null])),
    };
}

function jsonError(res, message, status) {
    return res.json({ ok: false, error: message }, status);
}

function getServerClient(apiKey) {
    const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
    const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
    if (!endpoint || !projectId || !apiKey) return null;
    return new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
}

async function createSellerOrder({ req, res, error, databases, databaseId, userCollectionId }) {
    const customerId = req.headers["x-appwrite-user-id"];
    if (!customerId) return jsonError(res, "You must be signed in to create an order.", 401);

    const body = req.bodyJson ?? {};
    const { sellerId, checkoutSessionId, customerName, customerPhone } = body;
    const customerEmail = body.customerEmail ?? null;
    const items = Array.isArray(body.items) ? body.items : [];

    if (!isValidSellerId(sellerId)) {
        return jsonError(res, "A valid sellerId is required.", 400);
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
    if (
        items.length === 0 ||
        items.length > 50 ||
        items.some(
            item =>
                !isNonEmptyString(item?.productId, 128) ||
                !Number.isInteger(Number(item?.quantity)) ||
                Number(item.quantity) < 1
        )
    ) {
        return jsonError(res, "At least one valid order item is required.", 400);
    }

    try {
        const seller = await databases.getDocument(databaseId, userCollectionId, sellerId);
        if (seller.role !== "seller" || seller.accountStatus !== "active" || seller.vendorStatus !== "active") {
            return jsonError(res, "Seller is not available.", 404);
        }

        const products = [];
        const seenProductIds = new Set();

        for (const item of items) {
            const productId = item.productId.trim();
            const quantity = Number(item.quantity);

            if (seenProductIds.has(productId)) {
                return jsonError(res, "Each product may only appear once per seller order.", 400);
            }
            seenProductIds.add(productId);

            const product = await databases.getDocument(databaseId, PRODUCTS_COLLECTION_ID, productId);
            if (product.sellerId !== sellerId || product.status !== "active") {
                return jsonError(res, "Product is not available from this seller.", 400);
            }

            const unitPrice = toNumber(product.price);
            const productTitle = typeof product.title === "string" ? product.title.trim() : "";
            if (!productTitle || unitPrice < 0) return jsonError(res, "Product data is invalid.", 400);

            products.push({
                productId,
                quantity,
                productTitle,
                unitPrice,
                imageUrl: typeof product.imageUrl === "string" ? product.imageUrl : null
            });
        }

        const subtotal = products.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0
        );

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
                subtotal,
                total: subtotal,
                customerName: customerName.trim(),
                customerEmail: customerEmail?.trim() || null,
                customerPhone: customerPhone.trim(),
                contactedAt: new Date().toISOString(),
                purchasedAt: null,
                cancelledAt: null,
            },
            [Permission.read(Role.user(customerId)), Permission.read(Role.user(sellerId)), Permission.update(Role.user(sellerId))]
        );

        try {
            const createdItems = [];
            for (const product of products) {
                createdItems.push(
                    await databases.createDocument(
                        databaseId,
                        ORDER_ITEMS_COLLECTION_ID,
                        ID.unique(),
                        {
                            orderId: orderDocument.$id,
                            productId: product.productId,
                            productTitle: product.productTitle,
                            quantity: product.quantity,
                            unitPrice: product.unitPrice,
                            total: product.unitPrice * product.quantity,
                            imageUrl: product.imageUrl,
                        },
                        [Permission.read(Role.user(customerId)), Permission.read(Role.user(sellerId))]
                    )
                );
            }
            return res.json({ ok: true, order: orderDocument, items: createdItems });
        } catch (itemError) {
            try { await databases.deleteDocument(databaseId, ORDERS_COLLECTION_ID, orderDocument.$id); } catch { /* preserve original error */ }
            throw itemError;
        }
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Seller or product not found.", 404);
        error(err?.message ?? "Seller order creation failed.");
        return jsonError(res, "Seller order creation failed.", 500);
    }
}
async function markSellerOrderPurchased({ req, res, error, databases, databaseId }) {
    const sellerId = req.headers["x-appwrite-user-id"];
    const orderId = req.bodyJson?.orderId;
    if (!sellerId) return jsonError(res, "You must be signed in to mark an order as purchased.", 401);
    if (!isNonEmptyString(orderId, 128)) return jsonError(res, "A valid orderId is required.", 400);

    try {
        const order = await databases.getDocument(databaseId, ORDERS_COLLECTION_ID, orderId);
        if (order.sellerId !== sellerId) return jsonError(res, "You can only update your own orders.", 403);
        if (order.status !== "contacted") return jsonError(res, "Only contacted orders can be marked as purchased.", 409);

        const itemResponse = await databases.listDocuments(databaseId, ORDER_ITEMS_COLLECTION_ID, [Query.equal("orderId", orderId), Query.limit(100)]);
        if (itemResponse.documents.length === 0) return jsonError(res, "Order has no items to purchase.", 400);

        const updates = [];
        for (const item of itemResponse.documents) {
            const quantity = toNumber(item.quantity);
            if (!Number.isInteger(quantity) || quantity < 1) return jsonError(res, "Order contains an invalid item quantity.", 400);

            const product = await databases.getDocument(databaseId, PRODUCTS_COLLECTION_ID, item.productId);
            if (product.sellerId !== sellerId) return jsonError(res, "Order contains a product owned by another seller.", 403);

            const currentStock = toNumber(product.stock);
            if (currentStock < quantity) {
                return jsonError(res, `Insufficient stock for "${product.title ?? item.productTitle}". Available: ${currentStock}.`, 409);
            }
            updates.push({ productId: product.$id, previousStock: currentStock, nextStock: currentStock - quantity });
        }

        const appliedUpdates = [];
        try {
            for (const update of updates) {
                await databases.updateDocument(databaseId, PRODUCTS_COLLECTION_ID, update.productId, { stock: update.nextStock });
                appliedUpdates.push(update);
            }
            const updatedOrder = await databases.updateDocument(databaseId, ORDERS_COLLECTION_ID, orderId, {
                status: "purchased",
                purchasedAt: new Date().toISOString(),
            });
            return res.json({ ok: true, order: updatedOrder });
        } catch (purchaseError) {
            for (const update of appliedUpdates.reverse()) {
                try { await databases.updateDocument(databaseId, PRODUCTS_COLLECTION_ID, update.productId, { stock: update.previousStock }); }
                catch (rollbackError) { error(rollbackError?.message ?? `Failed to restore stock for product ${update.productId}.`); }
            }
            throw purchaseError;
        }
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Order or product not found.", 404);
        error(err?.message ?? "Seller order purchase confirmation failed.");
        return jsonError(res, "Seller order purchase confirmation failed.", 500);
    }
}

async function undoSellerOrderPurchase({ req, res, error, databases, databaseId }) {
    const sellerId = req.headers["x-appwrite-user-id"];
    const orderId = req.bodyJson?.orderId;
    if (!sellerId) return jsonError(res, "You must be signed in to undo a purchase.", 401);
    if (!isNonEmptyString(orderId, 128)) return jsonError(res, "A valid orderId is required.", 400);

    try {
        const order = await databases.getDocument(databaseId, ORDERS_COLLECTION_ID, orderId);
        if (order.sellerId !== sellerId) return jsonError(res, "You can only update your own orders.", 403);
        if (order.status !== "purchased") return jsonError(res, "Only purchased orders can be reverted.", 409);

        const itemResponse = await databases.listDocuments(databaseId, ORDER_ITEMS_COLLECTION_ID, [Query.equal("orderId", orderId), Query.limit(100)]);
        if (itemResponse.documents.length === 0) return jsonError(res, "Order has no items to restore.", 400);

        const updates = [];
        for (const item of itemResponse.documents) {
            const quantity = toNumber(item.quantity);
            if (!Number.isInteger(quantity) || quantity < 1) return jsonError(res, "Order contains an invalid item quantity.", 400);

            const product = await databases.getDocument(databaseId, PRODUCTS_COLLECTION_ID, item.productId);
            if (product.sellerId !== sellerId) return jsonError(res, "Order contains a product owned by another seller.", 403);

            const currentStock = toNumber(product.stock);
            updates.push({ productId: product.$id, previousStock: currentStock, nextStock: currentStock + quantity });
        }

        const appliedUpdates = [];
        try {
            for (const update of updates) {
                await databases.updateDocument(databaseId, PRODUCTS_COLLECTION_ID, update.productId, { stock: update.nextStock });
                appliedUpdates.push(update);
            }
            const updatedOrder = await databases.updateDocument(databaseId, ORDERS_COLLECTION_ID, orderId, {
                status: "contacted",
                purchasedAt: null,
            });
            return res.json({ ok: true, order: updatedOrder });
        } catch (undoError) {
            for (const update of appliedUpdates.reverse()) {
                try { await databases.updateDocument(databaseId, PRODUCTS_COLLECTION_ID, update.productId, { stock: update.previousStock }); }
                catch (rollbackError) { error(rollbackError?.message ?? `Failed to restore stock for product ${update.productId}.`); }
            }
            throw undoError;
        }
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Order or product not found.", 404);
        error(err?.message ?? "Seller purchase undo failed.");
        return jsonError(res, "Seller purchase undo failed.", 500);
    }
}

async function setSellerOrderArchived({ req, res, error, databases, databaseId, archived }) {
    const sellerId = req.headers["x-appwrite-user-id"];
    const orderId = req.bodyJson?.orderId;

    if (!sellerId) return jsonError(res, "You must be signed in to archive orders.", 401);
    if (!isNonEmptyString(orderId, 128)) return jsonError(res, "A valid orderId is required.", 400);
    if (typeof archived !== "boolean") return jsonError(res, "A valid archived value is required.", 400);

    try {
        const order = await databases.getDocument(databaseId, ORDERS_COLLECTION_ID, orderId);
        if (order.sellerId !== sellerId) return jsonError(res, "You can only update your own orders.", 403);
        if (order.status !== "contacted") {
            return jsonError(res, "Only active leads can be archived or restored.", 409);
        }

        const updatedOrder = await databases.updateDocument(
            databaseId,
            ORDERS_COLLECTION_ID,
            orderId,
            { isArchived: archived }
        );

        return res.json({ ok: true, order: updatedOrder });
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Order not found.", 404);
        error(err?.message ?? "Seller order archive update failed.");
        return jsonError(res, "Seller order archive update failed.", 500);
    }
}

export default async ({ req, res, error }) => {
    if (req.method !== "POST") return jsonError(res, "Method not allowed.", 405);

    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const collectionId = process.env.APPWRITE_USER_COLLECTION_ID;
    const apiKey = req.headers["x-appwrite-key"];
    const client = getServerClient(apiKey);

    if (!databaseId || !collectionId || !client) {
        error("Public seller profile function is missing Appwrite configuration.");
        return jsonError(res, "Function configuration is incomplete.", 500);
    }

    const databases = new Databases(client);
    const body = req.bodyJson ?? {};

    if (body.operation === "createBookingRequest") {
        return createBookingRequest({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    }
    if (["acceptBooking","declineBooking","cancelBooking","completeBooking","noShowBooking"].includes(body.operation)) {
        return mutateBooking({ req, res, error, databases, databaseId, action: body.operation });
    }
    if (body.operation === "archiveBooking") {
        return setBookingArchived({ req, res, error, databases, databaseId, archived: true });
    }
    if (body.operation === "unarchiveBooking") {
        return setBookingArchived({ req, res, error, databases, databaseId, archived: false });
    }
    if (body.operation === "createSellerOrder") {
        return createSellerOrder({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    }
    if (body.operation === "markSellerOrderPurchased") {
        return markSellerOrderPurchased({ req, res, error, databases, databaseId });
    }
    if (body.operation === "undoSellerOrderPurchase") {
        return undoSellerOrderPurchase({ req, res, error, databases, databaseId });
    }
    if (body.operation === "archiveSellerOrder") {
        return setSellerOrderArchived({ req, res, error, databases, databaseId, archived: true });
    }
    if (body.operation === "unarchiveSellerOrder") {
        return setSellerOrderArchived({ req, res, error, databases, databaseId, archived: false });
    }

    const sellerId = body.sellerId;
    if (!isValidSellerId(sellerId)) return jsonError(res, "A valid sellerId is required.", 400);

    try {
        const document = await databases.getDocument(databaseId, collectionId, sellerId);
        if (document.role !== "seller" || document.accountStatus !== "active" || document.vendorStatus !== "active") {
            return jsonError(res, "Seller profile not found.", 404);
        }
        return res.json({ ok: true, seller: toPublicSellerProfile(document) });
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Seller profile not found.", 404);
        error(err?.message ?? "Public seller profile lookup failed.");
        return jsonError(res, "Public seller profile lookup failed.", 500);
    }
};
