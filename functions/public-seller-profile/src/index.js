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


const FEEDBACK_TABLE_ID = "feedback";

async function requireAdmin({ req, databases, databaseId, userCollectionId }) {
    const actorId = req.headers["x-appwrite-user-id"];
    if (!actorId) return { error: jsonError(req.res, "You must be signed in.", 401) };
    try {
        const user = await databases.getDocument(databaseId, userCollectionId, actorId);
        if (user.role !== "admin" || user.accountStatus !== "active") {
            return { error: jsonError(req.res, "Admin access required.", 403) };
        }
        return { user };
    } catch (err) {
        return { error: jsonError(req.res, "Admin access required.", 403) };
    }
}

async function listFeedback({ req, res, error, databases, databaseId, userCollectionId }) {
    const auth = await requireAdmin({ req: { ...req, res }, databases, databaseId, userCollectionId });
    if (auth.error) return auth.error;
    try {
        const result = await databases.listDocuments(databaseId, FEEDBACK_TABLE_ID, [Query.orderDesc("$createdAt"), Query.limit(100)]);
        return res.json({ ok: true, feedback: result.documents });
    } catch (err) {
        error(err?.message ?? "Feedback lookup failed.");
        return jsonError(res, "Feedback lookup failed.", 500);
    }
}

async function updateFeedbackStatus({ req, res, error, databases, databaseId, userCollectionId }) {
    const auth = await requireAdmin({ req: { ...req, res }, databases, databaseId, userCollectionId });
    if (auth.error) return auth.error;
    const { feedbackId, status, adminNote = null } = req.bodyJson ?? {};
    if (!isNonEmptyString(feedbackId, 128) || !["open", "in-review", "resolved"].includes(status)) {
        return jsonError(res, "A valid feedbackId and status are required.", 400);
    }
    if (adminNote !== null && typeof adminNote !== "string") return jsonError(res, "adminNote must be text.", 400);
    try {
        const feedback = await databases.getDocument(databaseId, FEEDBACK_TABLE_ID, feedbackId);
        const updated = await databases.updateDocument(databaseId, FEEDBACK_TABLE_ID, feedbackId, {
            status,
            adminNote: typeof adminNote === "string" && adminNote.trim() ? adminNote.trim().slice(0, 5000) : null,
            resolvedAt: status === "resolved" ? new Date().toISOString() : null,
        });
        return res.json({ ok: true, feedback: updated });
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Feedback submission not found.", 404);
        error(err?.message ?? "Feedback update failed.");
        return jsonError(res, "Feedback update failed.", 500);
    }
}


const SUPPORT_CONVERSATIONS_TABLE_ID = "support_conversations";
const SUPPORT_MESSAGES_TABLE_ID = "support_messages";

async function supportActor({ req, res, databases, databaseId, userCollectionId }) {
    const actorId = req.headers["x-appwrite-user-id"];
    if (!actorId) return null;
    try {
        const profile = await databases.getDocument(databaseId, userCollectionId, actorId);
        if (profile.accountStatus !== "active" || !["customer", "seller", "admin"].includes(profile.role)) {
            return null;
        }
        return { id: actorId, role: profile.role === "seller" ? "vendor" : profile.role, profile };
    } catch {
        return null;
    }
}

async function createSupportConversation({ req, res, error, databases, databaseId, userCollectionId }) {
    const actor = await supportActor({ req, res, databases, databaseId, userCollectionId });
    if (!actor) return jsonError(res, "Sign in to use support chat.", 401);
    if (actor.role === "admin") return jsonError(res, "Admins should reply from the support inbox.", 400);
    const subject = req.bodyJson?.subject;
    const message = req.bodyJson?.message;
    if (!isNonEmptyString(subject, 180) || !isNonEmptyString(message, 4000)) {
        return jsonError(res, "A subject and message are required.", 400);
    }
    try {
        const now = new Date().toISOString();
        const conversation = await databases.createDocument(
            databaseId, SUPPORT_CONVERSATIONS_TABLE_ID, ID.unique(),
            {
                ownerId: actor.id,
                ownerRole: actor.role,
                ownerName: String(actor.profile.fullName || ""),
                ownerEmail: String(actor.profile.email || ""),
                subject: subject.trim(),
                status: "open",
                lastMessage: message.trim(),
                lastMessageAt: now,
                assignedAdminId: null,
                closedAt: null
            },
            [Permission.read(Role.user(actor.id))]
        );
        const firstMessage = await databases.createDocument(
            databaseId, SUPPORT_MESSAGES_TABLE_ID, ID.unique(),
            { conversationId: conversation.$id, senderId: actor.id, senderRole: actor.role, message: message.trim(), messageType: "text", isRead: false },
            [Permission.read(Role.user(actor.id))]
        );
        return res.json({ ok: true, conversation, messages: [firstMessage] });
    } catch (err) {
        error(err?.message ?? "Support conversation creation failed.");
        return jsonError(res, "Could not start your support conversation. Please try again.", 500);
    }
}

async function listMySupportConversations({ req, res, error, databases, databaseId, userCollectionId }) {
    const actor = await supportActor({ req, res, databases, databaseId, userCollectionId });
    if (!actor) return jsonError(res, "Sign in to use support chat.", 401);
    try {
        const result = await databases.listDocuments(databaseId, SUPPORT_CONVERSATIONS_TABLE_ID, [
            Query.equal("ownerId", actor.id), Query.orderDesc("$updatedAt"), Query.limit(50)
        ]);
        return res.json({ ok: true, conversations: result.documents });
    } catch (err) {
        error(err?.message ?? "Support conversation lookup failed.");
        return jsonError(res, "Could not load your support conversations.", 500);
    }
}

async function listSupportConversations({ req, res, error, databases, databaseId, userCollectionId }) {
    const auth = await requireAdmin({ req: { ...req, res }, databases, databaseId, userCollectionId });
    if (auth.error) return auth.error;
    try {
        const status = req.bodyJson?.status;
        const queries = [Query.orderDesc("$updatedAt"), Query.limit(100)];
        if (["open", "in-progress", "closed"].includes(status)) queries.unshift(Query.equal("status", status));
        const result = await databases.listDocuments(databaseId, SUPPORT_CONVERSATIONS_TABLE_ID, queries);
        return res.json({ ok: true, conversations: result.documents });
    } catch (err) {
        error(err?.message ?? "Support inbox lookup failed.");
        return jsonError(res, "Could not load the support inbox.", 500);
    }
}

async function listSupportMessages({ req, res, error, databases, databaseId, userCollectionId }) {
    const actor = await supportActor({ req, res, databases, databaseId, userCollectionId });
    if (!actor) return jsonError(res, "Sign in to use support chat.", 401);
    const conversationId = req.bodyJson?.conversationId;
    if (!isNonEmptyString(conversationId, 128)) return jsonError(res, "A valid conversation is required.", 400);
    try {
        const conversation = await databases.getDocument(databaseId, SUPPORT_CONVERSATIONS_TABLE_ID, conversationId);
        const isAdmin = actor.role === "admin";
        if (!isAdmin && conversation.ownerId !== actor.id) return jsonError(res, "You cannot access this conversation.", 403);
        const result = await databases.listDocuments(databaseId, SUPPORT_MESSAGES_TABLE_ID, [
            Query.equal("conversationId", conversationId), Query.orderAsc("$createdAt"), Query.limit(200)
        ]);
        if (isAdmin) {
            const unread = result.documents.filter(item => item.senderRole !== "admin" && item.isRead !== true);
            await Promise.all(unread.map(item => databases.updateDocument(databaseId, SUPPORT_MESSAGES_TABLE_ID, item.$id, { isRead: true })));
        }
        return res.json({ ok: true, conversation, messages: result.documents });
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Conversation not found.", 404);
        error(err?.message ?? "Support messages lookup failed.");
        return jsonError(res, "Could not load messages.", 500);
    }
}

async function sendSupportMessage({ req, res, error, databases, databaseId, userCollectionId }) {
    const actor = await supportActor({ req, res, databases, databaseId, userCollectionId });
    if (!actor) return jsonError(res, "Sign in to use support chat.", 401);
    const conversationId = req.bodyJson?.conversationId;
    const message = req.bodyJson?.message;
    if (!isNonEmptyString(conversationId, 128) || !isNonEmptyString(message, 4000)) {
        return jsonError(res, "A conversation and message are required.", 400);
    }
    try {
        const conversation = await databases.getDocument(databaseId, SUPPORT_CONVERSATIONS_TABLE_ID, conversationId);
        const isAdmin = actor.role === "admin";
        if (!isAdmin && conversation.ownerId !== actor.id) return jsonError(res, "You cannot reply to this conversation.", 403);
        if (!isAdmin && conversation.status === "closed") return jsonError(res, "This conversation is closed. Start a new chat for further help.", 409);
        const senderRole = isAdmin ? "admin" : actor.role;
        const now = new Date().toISOString();
        const created = await databases.createDocument(
            databaseId, SUPPORT_MESSAGES_TABLE_ID, ID.unique(),
            { conversationId, senderId: actor.id, senderRole, message: message.trim(), messageType: "text", isRead: false },
            [Permission.read(Role.user(conversation.ownerId))]
        );
        const updated = await databases.updateDocument(databaseId, SUPPORT_CONVERSATIONS_TABLE_ID, conversationId, {
            lastMessage: message.trim(), lastMessageAt: now,
            status: isAdmin ? "in-progress" : "open",
            closedAt: null
        });
        return res.json({ ok: true, message: created, conversation: updated });
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Conversation not found.", 404);
        error(err?.message ?? "Support reply failed.");
        return jsonError(res, "Could not send your message.", 500);
    }
}

async function updateSupportConversation({ req, res, error, databases, databaseId, userCollectionId }) {
    const auth = await requireAdmin({ req: { ...req, res }, databases, databaseId, userCollectionId });
    if (auth.error) return auth.error;
    const conversationId = req.bodyJson?.conversationId;
    const status = req.bodyJson?.status;
    if (!isNonEmptyString(conversationId, 128) || !["open", "in-progress", "closed"].includes(status)) {
        return jsonError(res, "A valid conversation and status are required.", 400);
    }
    try {
        const updated = await databases.updateDocument(databaseId, SUPPORT_CONVERSATIONS_TABLE_ID, conversationId, {
            status, closedAt: status === "closed" ? new Date().toISOString() : null
        });
        return res.json({ ok: true, conversation: updated });
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Conversation not found.", 404);
        error(err?.message ?? "Support status update failed.");
        return jsonError(res, "Could not update conversation status.", 500);
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

async function updateOwnProfile({ req, res, error, databases, databaseId, userCollectionId }) {
    const actorId = req.headers["x-appwrite-user-id"];
    const input = req.bodyJson?.data;
    if (!actorId) return jsonError(res, "You must be signed in to update your profile.", 401);
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return jsonError(res, "A valid profile update is required.", 400);
    }

    const allowedFields = ["fullName", "phoneNumber", "country"];
    const keys = Object.keys(input);
    if (!keys.length || keys.some((key) => !allowedFields.includes(key))) {
        return jsonError(res, "Profile update contains unsupported fields.", 400);
    }
    if ("fullName" in input && (typeof input.fullName !== "string" || !input.fullName.trim() || input.fullName.trim().length > 200)) {
        return jsonError(res, "Full name must be between 1 and 200 characters.", 400);
    }
    if ("phoneNumber" in input && (typeof input.phoneNumber !== "string" || input.phoneNumber.length > 50)) {
        return jsonError(res, "Phone number must be 50 characters or fewer.", 400);
    }
    if ("country" in input && (typeof input.country !== "string" || !input.country.trim() || input.country.trim().length > 100)) {
        return jsonError(res, "Country must be between 1 and 100 characters.", 400);
    }

    const update = {};
    if ("fullName" in input) update.fullName = input.fullName.trim();
    if ("phoneNumber" in input) update.phoneNumber = input.phoneNumber.trim();
    if ("country" in input) update.country = input.country.trim();

    try {
        const current = await databases.getDocument(databaseId, userCollectionId, actorId);
        if (current.accountStatus !== "active") {
            return jsonError(res, "This account cannot update its profile.", 403);
        }
        const updated = await databases.updateDocument(databaseId, userCollectionId, actorId, update);
        return res.json({ ok: true, profile: updated });
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "User profile not found.", 404);
        error(err?.message ?? "Profile update failed.");
        return jsonError(res, "Profile update failed.", 500);
    }
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
function orderMutationError(message, status) {
    return Object.assign(new Error(message), { httpStatus: status });
}

async function mutateSellerOrderInventory({ req, res, error, databases, databaseId, undo }) {
    const sellerId = req.headers["x-appwrite-user-id"];
    const orderId = req.bodyJson?.orderId;
    if (!sellerId) return jsonError(res, "You must be signed in to update orders.", 401);
    if (!isNonEmptyString(orderId, 128)) return jsonError(res, "A valid orderId is required.", 400);

    let transactionId = null;
    let committed = false;
    try {
        const transaction = await databases.createTransaction({ ttl: 60 });
        transactionId = transaction.$id;

        const order = await databases.getDocument({
            databaseId,
            collectionId: ORDERS_COLLECTION_ID,
            documentId: orderId,
            transactionId,
        });
        if (order.sellerId !== sellerId) throw orderMutationError("You can only update your own orders.", 403);
        const expectedStatus = undo ? "purchased" : "contacted";
        if (order.status !== expectedStatus) {
            throw orderMutationError(
                undo ? "Only purchased orders can be reverted." : "Only contacted orders can be marked as purchased.",
                409
            );
        }

        if (undo) {
            const priorReview = await databases.listDocuments({ databaseId, collectionId: REVIEWS_TABLE_ID, queries: [Query.equal("orderId", orderId), Query.limit(1)], transactionId });
            if (priorReview.documents.length) throw orderMutationError("This purchase cannot be reverted after a review has been submitted.", 409);
        }

        const itemResponse = await databases.listDocuments({
            databaseId,
            collectionId: ORDER_ITEMS_COLLECTION_ID,
            queries: [Query.equal("orderId", orderId), Query.limit(100)],
            transactionId,
        });
        if (itemResponse.documents.length === 0) {
            throw orderMutationError(undo ? "Order has no items to restore." : "Order has no items to purchase.", 400);
        }

        // Aggregate duplicate product lines before calculating inventory changes.
        const quantities = new Map();
        for (const item of itemResponse.documents) {
            const quantity = toNumber(item.quantity);
            if (!Number.isInteger(quantity) || quantity < 1) {
                throw orderMutationError("Order contains an invalid item quantity.", 400);
            }
            quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + quantity);
        }

        const updates = [];
        for (const [productId, quantity] of quantities.entries()) {
            const product = await databases.getDocument({
                databaseId,
                collectionId: PRODUCTS_COLLECTION_ID,
                documentId: productId,
                transactionId,
            });
            if (product.sellerId !== sellerId) {
                throw orderMutationError("Order contains a product owned by another seller.", 403);
            }
            const currentStock = toNumber(product.stock);
            if (!Number.isFinite(currentStock) || currentStock < 0) {
                throw orderMutationError("A product has invalid inventory data.", 409);
            }
            if (!undo && currentStock < quantity) {
                throw orderMutationError(
                    `Insufficient stock for "${product.title ?? productId}". Available: ${currentStock}.`,
                    409
                );
            }
            updates.push({
                productId,
                nextStock: undo ? currentStock + quantity : currentStock - quantity,
            });
        }

        for (const update of updates) {
            await databases.updateDocument({
                databaseId,
                collectionId: PRODUCTS_COLLECTION_ID,
                documentId: update.productId,
                data: { stock: update.nextStock },
                transactionId,
            });
        }

        const updatedOrder = await databases.updateDocument({
            databaseId,
            collectionId: ORDERS_COLLECTION_ID,
            documentId: orderId,
            data: undo
                ? { status: "contacted", purchasedAt: null }
                : { status: "purchased", purchasedAt: new Date().toISOString() },
            transactionId,
        });

        await databases.updateTransaction({ transactionId, commit: true });
        committed = true;
        return res.json({ ok: true, order: updatedOrder });
    } catch (err) {
        if (transactionId && !committed) {
            try {
                await databases.updateTransaction({ transactionId, rollback: true });
            } catch (rollbackError) {
                error(rollbackError?.message ?? "Failed to roll back the inventory transaction.");
            }
        }
        if (err?.httpStatus) return jsonError(res, err.message, err.httpStatus);
        if (err?.code === 404) return jsonError(res, "Order or product not found.", 404);
        if (err?.code === 409 || err?.type === "transaction_conflict") {
            return jsonError(res, "Inventory changed while this order was being processed. Refresh and try again.", 409);
        }
        error(err?.message ?? (undo ? "Seller purchase undo failed." : "Seller purchase confirmation failed."));
        return jsonError(res, undo ? "Seller purchase undo failed." : "Seller purchase confirmation failed.", 500);
    }
}

async function markSellerOrderPurchased(args) {
    return mutateSellerOrderInventory({ ...args, undo: false });
}

async function undoSellerOrderPurchase(args) {
    return mutateSellerOrderInventory({ ...args, undo: true });
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



const REVIEWS_TABLE_ID = "reviews";
const PRODUCTS_COLLECTIONS_ID_FOR_REVIEWS = PRODUCTS_COLLECTION_ID;
const BOOKINGS_TABLES_ID_FOR_REVIEWS = BOOKINGS_TABLE_ID;

async function listReviewsForListing({ req, res, error, databases, databaseId }) {
    const listingId = req.bodyJson?.listingId;
    if (!isNonEmptyString(listingId, 128)) return jsonError(res, "A valid listingId is required.", 400);
    try {
        const result = await databases.listDocuments({ databaseId, collectionId: REVIEWS_TABLE_ID, queries: [Query.equal("listingId", listingId), Query.equal("status", "published"), Query.orderDesc("$createdAt"), Query.limit(100)] });
        const reviews = result.documents.map(review => ({ $id: review.$id, $createdAt: review.$createdAt, listingId: review.listingId, listingType: review.listingType, rating: review.rating, reviewText: review.reviewText, vendorReply: review.vendorReply, vendorReplyAt: review.vendorReplyAt, editedAt: review.editedAt, status: review.status }));
        return res.json({ ok: true, reviews });
    } catch (err) { error(err?.message ?? "Review lookup failed."); return jsonError(res, "Could not load reviews.", 500); }
}
async function getMyReview({ req, res, error, databases, databaseId }) {
    const reviewerId = req.headers["x-appwrite-user-id"];
    if (!reviewerId) return jsonError(res, "Sign in to check your review.", 401);
    const { listingId, listingType, orderId, bookingId } = req.bodyJson ?? {};
    if (!isNonEmptyString(listingId,128) || !["product","service"].includes(listingType)) return jsonError(res,"A valid listing and type are required.",400);
    if (listingType === "product" && !isNonEmptyString(orderId,128)) return jsonError(res,"A valid orderId is required.",400);
    if (listingType === "service" && !isNonEmptyString(bookingId,128)) return jsonError(res,"A valid bookingId is required.",400);
    try {
        const queries = [Query.equal("listingId",listingId), Query.equal("reviewerId",reviewerId), Query.limit(1)];
        queries.push(listingType === "product" ? Query.equal("orderId",orderId) : Query.equal("bookingId",bookingId));
        const result = await databases.listDocuments({databaseId, collectionId:REVIEWS_TABLE_ID, queries});
        return res.json({ok:true, review:result.documents[0] ?? null});
    } catch (err) { error(err?.message ?? "Review lookup failed."); return jsonError(res,"Could not check your review.",500); }
}
async function submitReview({req,res,error,databases,databaseId}) {
 const reviewerId=req.headers["x-appwrite-user-id"];
 if(!reviewerId)return jsonError(res,"Sign in to leave a review.",401);
 const body=req.bodyJson??{}; const {listingId,listingType,orderId,bookingId}=body;
 const rating=Number(body.rating); const reviewText=typeof body.reviewText==="string"?body.reviewText.trim():"";
 if(!isNonEmptyString(listingId,128)||!["product","service"].includes(listingType))return jsonError(res,"A valid listing and listing type are required.",400);
 if(!Number.isInteger(rating)||rating<1||rating>5)return jsonError(res,"Rating must be a whole number from 1 to 5.",400);
 if(reviewText.length>3000)return jsonError(res,"Review text must be 3,000 characters or fewer.",400);
 if(listingType==="product"&&(!isNonEmptyString(orderId,128)||bookingId))return jsonError(res,"A qualifying purchased order is required for a product review.",400);
 if(listingType==="service"&&(!isNonEmptyString(bookingId,128)||orderId))return jsonError(res,"A completed booking is required for a service review.",400);
 try {
  let vendorId;
  if(listingType==="product"){
   const order=await databases.getDocument(databaseId,ORDERS_COLLECTION_ID,orderId);
   if(order.customerId!==reviewerId)return jsonError(res,"You can only review your own purchases.",403);
   if(order.status!=="purchased")return jsonError(res,"Only confirmed purchases can be reviewed.",409);
   const items=await databases.listDocuments(databaseId,ORDER_ITEMS_COLLECTION_ID,[Query.equal("orderId",orderId),Query.equal("productId",listingId),Query.limit(100)]);
   if(!items.documents.length)return jsonError(res,"This product is not part of that order.",403);
   const product=await databases.getDocument(databaseId,PRODUCTS_COLLECTIONS_ID_FOR_REVIEWS,listingId);
   vendorId=product.sellerId;
   if(vendorId===reviewerId)return jsonError(res,"You cannot review your own listing.",403);
  } else {
   const booking=await databases.getDocument(databaseId,BOOKINGS_TABLES_ID_FOR_REVIEWS,bookingId);
   if(booking.buyerId!==reviewerId)return jsonError(res,"You can only review your own bookings.",403);
   if(booking.status!=="completed")return jsonError(res,"Only completed bookings can be reviewed.",409);
   if(booking.serviceId!==listingId)return jsonError(res,"This service is not part of that booking.",403);
   const service=await databases.getDocument(databaseId,PRODUCTS_COLLECTIONS_ID_FOR_REVIEWS,listingId);
   vendorId=booking.providerId;
   if(service.sellerId!==vendorId)return jsonError(res,"Booking provider does not match the service owner.",409);
   if(vendorId===reviewerId)return jsonError(res,"You cannot review your own service.",403);
  }
  const duplicateQueries=listingType==="product"?[Query.equal("orderId",orderId),Query.equal("listingId",listingId),Query.limit(1)]:[Query.equal("bookingId",bookingId),Query.equal("listingId",listingId),Query.limit(1)];
  const existing=await databases.listDocuments(databaseId,REVIEWS_TABLE_ID,duplicateQueries);
  if(existing.documents.length)return jsonError(res,"You have already reviewed this listing for that transaction.",409);
  const data={listingId,listingType,vendorId,reviewerId,rating,reviewText:reviewText||null,status:"published",vendorReply:null,vendorReplyAt:null,editedAt:null};
  if(listingType==="product")data.orderId=orderId;else data.bookingId=bookingId;
  const review=await databases.createDocument(databaseId,REVIEWS_TABLE_ID,ID.unique(),data,[Permission.read(Role.user(reviewerId))]);
  return res.json({ok:true,review});
 } catch(err){if(err?.code===404)return jsonError(res,"The qualifying order, booking, or listing was not found.",404);if(err?.code===409)return jsonError(res,"A review already exists for this transaction and listing.",409);error(err?.message??"Review submission failed.");return jsonError(res,"Could not submit your review.",500);}
}
async function editReview({ req, res, error, databases, databaseId }) {
    const reviewerId = req.headers["x-appwrite-user-id"];
    if (!reviewerId) return jsonError(res, "Sign in to edit your review.", 401);
    const { reviewId, rating, reviewText } = req.bodyJson ?? {};
    const nextRating = Number(rating);
    const nextText = typeof reviewText === "string" ? reviewText.trim() : "";
    if (!isNonEmptyString(reviewId, 128)) return jsonError(res, "A valid reviewId is required.", 400);
    if (!Number.isInteger(nextRating) || nextRating < 1 || nextRating > 5) return jsonError(res, "Rating must be a whole number from 1 to 5.", 400);
    if (nextText.length > 3000) return jsonError(res, "Review text must be 3,000 characters or fewer.", 400);
    try {
        const review = await databases.getDocument(databaseId, REVIEWS_TABLE_ID, reviewId);
        if (review.reviewerId !== reviewerId) return jsonError(res, "You can only edit your own review.", 403);
        if (review.status !== "published") return jsonError(res, "Only published reviews can be edited.", 409);
        if (Date.now() - new Date(review.$createdAt).getTime() > 14 * 24 * 60 * 60 * 1000) {
            return jsonError(res, "Reviews can only be edited within 14 days of submission.", 409);
        }
        const updated = await databases.updateDocument(databaseId, REVIEWS_TABLE_ID, reviewId, {
            rating: nextRating,
            reviewText: nextText || null,
            editedAt: new Date().toISOString()
        });
        return res.json({ ok: true, review: updated });
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Review not found.", 404);
        error(err?.message ?? "Review edit failed.");
        return jsonError(res, "Could not update your review.", 500);
    }
}

async function replyToReview({ req, res, error, databases, databaseId }) {
    const actorId = req.headers["x-appwrite-user-id"];
    if (!actorId) return jsonError(res, "Sign in to reply to reviews.", 401);
    const { reviewId, vendorReply } = req.bodyJson ?? {};
    if (!isNonEmptyString(reviewId, 128) || typeof vendorReply !== "string" || !vendorReply.trim() || vendorReply.trim().length > 2000) {
        return jsonError(res, "A review and reply of up to 2,000 characters are required.", 400);
    }
    try {
        const review = await databases.getDocument(databaseId, REVIEWS_TABLE_ID, reviewId);
        if (review.vendorId !== actorId) return jsonError(res, "Only the listing owner can reply to this review.", 403);
        if (review.status !== "published") return jsonError(res, "Only published reviews can receive a reply.", 409);
        if (review.vendorReply && review.vendorReply.trim()) return jsonError(res, "A reply has already been posted for this review.", 409);
        const updated = await databases.updateDocument(databaseId, REVIEWS_TABLE_ID, reviewId, {
            vendorReply: vendorReply.trim(),
            vendorReplyAt: new Date().toISOString()
        });
        return res.json({ ok: true, review: updated });
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Review not found.", 404);
        error(err?.message ?? "Review reply failed.");
        return jsonError(res, "Could not save your reply.", 500);
    }
}

async function listPublishedReviewsForVendor({ req, res, error, databases, databaseId }) {
    const vendorId = req.bodyJson?.vendorId;
    if (!isValidSellerId(vendorId)) return jsonError(res, "A valid vendorId is required.", 400);
    try {
        const result = await databases.listDocuments({
            databaseId,
            collectionId: REVIEWS_TABLE_ID,
            queries: [
                Query.equal("vendorId", vendorId),
                Query.equal("status", "published"),
                Query.orderDesc("$createdAt"),
                Query.limit(100)
            ]
        });
        return res.json({ ok: true, reviews: result.documents });
    } catch (err) {
        error(err?.message ?? "Vendor public review lookup failed.");
        return jsonError(res, "Could not load vendor reviews.", 500);
    }
}

async function listReviewsForVendor({ req, res, error, databases, databaseId }) {
    const vendorId = req.headers["x-appwrite-user-id"];
    if (!vendorId) return jsonError(res, "Sign in to view your reviews.", 401);
    try {
        const result = await databases.listDocuments({
            databaseId,
            collectionId: REVIEWS_TABLE_ID,
            queries: [Query.equal("vendorId", vendorId), Query.orderDesc("$createdAt"), Query.limit(100)]
        });
        return res.json({ ok: true, reviews: result.documents });
    } catch (err) {
        error(err?.message ?? "Vendor review lookup failed.");
        return jsonError(res, "Could not load your reviews.", 500);
    }
}

async function listReviewsForAdmin({ req, res, error, databases, databaseId, userCollectionId }) {
    const auth = await requireAdmin({ req: { ...req, res }, databases, databaseId, userCollectionId });
    if (auth.error) return auth.error;
    try {
        const status = req.bodyJson?.status;
        const queries = [Query.orderDesc("$createdAt"), Query.limit(100)];
        if (["published", "hidden", "removed"].includes(status)) queries.unshift(Query.equal("status", status));
        const result = await databases.listDocuments({ databaseId, collectionId: REVIEWS_TABLE_ID, queries });
        return res.json({ ok: true, reviews: result.documents });
    } catch (err) {
        error(err?.message ?? "Review moderation lookup failed.");
        return jsonError(res, "Could not load reviews for moderation.", 500);
    }
}

async function moderateReview({ req, res, error, databases, databaseId, userCollectionId }) {
    const auth = await requireAdmin({ req: { ...req, res }, databases, databaseId, userCollectionId });
    if (auth.error) return auth.error;
    const { reviewId, status } = req.bodyJson ?? {};
    if (!isNonEmptyString(reviewId, 128) || !["published", "hidden", "removed"].includes(status)) {
        return jsonError(res, "A valid review and moderation status are required.", 400);
    }
    try {
        const review = await databases.getDocument(databaseId, REVIEWS_TABLE_ID, reviewId);
        const updated = await databases.updateDocument(databaseId, REVIEWS_TABLE_ID, reviewId, { status });
        return res.json({ ok: true, review: updated });
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Review not found.", 404);
        error(err?.message ?? "Review moderation failed.");
        return jsonError(res, "Could not update review status.", 500);
    }
}

const TESTIMONIALS_TABLE_ID = "testimonials";

async function listApprovedTestimonials({ req, res, error, databases, databaseId }) {
    try {
        const result = await databases.listDocuments(databaseId, TESTIMONIALS_TABLE_ID, [
            Query.equal("status", "approved"), Query.orderDesc("$createdAt"), Query.limit(50)
        ]);
        const testimonials = result.documents.map(({ $id, $createdAt, name, quote, type, videoUrl, rating }) => ({
            $id, $createdAt, name, quote, type, videoUrl: videoUrl || null, rating
        }));
        return res.json({ ok: true, testimonials });
    } catch (err) {
        error(err?.message ?? "Testimonials lookup failed.");
        return jsonError(res, "Could not load testimonials. Please try again.", 500);
    }
}

async function submitTestimonial({ req, res, error, databases, databaseId }) {
    const body = req.bodyJson ?? {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const quote = typeof body.quote === "string" ? body.quote.trim() : "";
    const type = body.type;
    const videoUrl = typeof body.videoUrl === "string" ? body.videoUrl.trim() : "";
    const rating = Number(body.rating);
    if (!isNonEmptyString(name, 100) || !isNonEmptyString(quote, 1500)) {
        return jsonError(res, "Name and experience are required (up to 100 and 1,500 characters).", 400);
    }
    if (!["text", "video"].includes(type) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return jsonError(res, "Choose a valid testimonial type and a rating from 1 to 5.", 400);
    }
    if (type === "video") {
        try {
            const url = new URL(videoUrl);
            if (url.protocol !== "https:" || !["youtube.com", "www.youtube.com", "youtu.be", "www.youtu.be", "vimeo.com", "www.vimeo.com"].includes(url.hostname)) {
                return jsonError(res, "Use a valid HTTPS YouTube or Vimeo URL.", 400);
            }
        } catch {
            return jsonError(res, "Enter a valid YouTube or Vimeo URL.", 400);
        }
    }
    const submitterId = req.headers["x-appwrite-user-id"] || null;
    try {
        const testimonial = await databases.createDocument(
            databaseId, TESTIMONIALS_TABLE_ID, ID.unique(),
            { name, quote, type, videoUrl: type === "video" ? videoUrl : null, rating, submitterId, status: "pending" },
            submitterId ? [Permission.read(Role.user(submitterId))] : []
        );
        return res.json({ ok: true, testimonial: { $id: testimonial.$id, status: testimonial.status } });
    } catch (err) {
        error(err?.message ?? "Testimonial submission failed.");
        return jsonError(res, "Could not submit your testimonial. Please try again.", 500);
    }
}

async function listTestimonialsForAdmin({ req, res, error, databases, databaseId, userCollectionId }) {
    const auth = await requireAdmin({ req: { ...req, res }, databases, databaseId, userCollectionId });
    if (auth.error) return auth.error;
    try {
        const result = await databases.listDocuments(databaseId, TESTIMONIALS_TABLE_ID, [
            Query.orderDesc("$createdAt"), Query.limit(100)
        ]);
        return res.json({ ok: true, testimonials: result.documents });
    } catch (err) {
        error(err?.message ?? "Testimonial moderation lookup failed.");
        return jsonError(res, "Could not load testimonial submissions.", 500);
    }
}

async function moderateTestimonial({ req, res, error, databases, databaseId, userCollectionId }) {
    const auth = await requireAdmin({ req: { ...req, res }, databases, databaseId, userCollectionId });
    if (auth.error) return auth.error;
    const { testimonialId, status } = req.bodyJson ?? {};
    if (!isNonEmptyString(testimonialId, 128) || !["approved", "rejected", "pending"].includes(status)) {
        return jsonError(res, "A valid testimonial and moderation status are required.", 400);
    }
    try {
        const testimonial = await databases.updateDocument(databaseId, TESTIMONIALS_TABLE_ID, testimonialId, { status });
        return res.json({ ok: true, testimonial });
    } catch (err) {
        if (err?.code === 404) return jsonError(res, "Testimonial not found.", 404);
        error(err?.message ?? "Testimonial moderation failed.");
        return jsonError(res, "Could not update testimonial status.", 500);
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



    if (body.operation === "listReviewsForListing") return listReviewsForListing({ req, res, error, databases, databaseId });
    if (body.operation === "submitReview") return submitReview({ req, res, error, databases, databaseId });
    if (body.operation === "getMyReview") return getMyReview({ req, res, error, databases, databaseId });
    if (body.operation === "replyToReview") return replyToReview({ req, res, error, databases, databaseId });
    if (body.operation === "editReview") return editReview({ req, res, error, databases, databaseId });
    if (body.operation === "listReviewsForVendor") return listReviewsForVendor({ req, res, error, databases, databaseId });
    if (body.operation === "listPublishedReviewsForVendor") return listPublishedReviewsForVendor({ req, res, error, databases, databaseId });
    if (body.operation === "listReviewsForAdmin") return listReviewsForAdmin({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    if (body.operation === "moderateReview") return moderateReview({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    if (body.operation === "listApprovedTestimonials") return listApprovedTestimonials({ req, res, error, databases, databaseId });
    if (body.operation === "submitTestimonial") return submitTestimonial({ req, res, error, databases, databaseId });
    if (body.operation === "listTestimonialsForAdmin") return listTestimonialsForAdmin({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    if (body.operation === "moderateTestimonial") return moderateTestimonial({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    if (body.operation === "createSupportConversation") return createSupportConversation({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    if (body.operation === "listMySupportConversations") return listMySupportConversations({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    if (body.operation === "listSupportConversations") return listSupportConversations({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    if (body.operation === "listSupportMessages") return listSupportMessages({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    if (body.operation === "sendSupportMessage") return sendSupportMessage({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    if (body.operation === "updateSupportConversation") return updateSupportConversation({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    if (body.operation === "updateOwnProfile") {
        return updateOwnProfile({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    }
    if (body.operation === "listFeedback") {
        return listFeedback({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    }
    if (body.operation === "updateFeedbackStatus") {
        return updateFeedbackStatus({ req, res, error, databases, databaseId, userCollectionId: collectionId });
    }
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
