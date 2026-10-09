import { Client, Databases } from "node-appwrite";

const ALLOWED_VENDOR_TYPES = new Set(["product-seller", "service-provider", "digital-creator", "wholesaler", "other"]);

const EDITABLE_FIELDS = [
    "vendorType",
    "businessCategory",
    "businessName",
    "businessDescription",
    "slogan",
    "logo",
    "coverImage",
    "primaryColor",
    "socialLinks"
];

function isOptionalString(value) {
    return value === null || typeof value === "string";
}

function validateInput(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return "Invalid vendor application payload.";
    }

    if (!ALLOWED_VENDOR_TYPES.has(input.vendorType)) {
        return "Invalid vendor type.";
    }

    for (const field of [
        "vendorType",
        "businessCategory",
        "businessName",
        "businessDescription",
        "primaryColor"
    ]) {
        if (typeof input[field] !== "string" || !input[field].trim()) {
            return `Missing or invalid field: ${field}.`;
        }
    }

    if (!isOptionalString(input.slogan)) {
        return "Invalid field: slogan.";
    }

    if (!isOptionalString(input.logo)) {
        return "Invalid field: logo.";
    }

    if (!isOptionalString(input.coverImage)) {
        return "Invalid field: coverImage.";
    }

    if (!isOptionalString(input.socialLinks) &&
        (typeof input.socialLinks !== "object" || Array.isArray(input.socialLinks))) {
        return "Invalid field: socialLinks.";
    }

    return null;
}

export default async ({ req, res, error }) => {
    if (req.method !== "POST") {
        return res.json({ ok: false, error: "Method not allowed." }, 405);
    }

    const userId = req.headers["x-appwrite-user-id"];
    if (!userId) {
        return res.json({ ok: false, error: "Authentication required." }, 401);
    }

    const validationError = validateInput(req.bodyJson);
    if (validationError) {
        return res.json({ ok: false, error: validationError }, 400);
    }

    const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
    const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
    const apiKey = req.headers["x-appwrite-key"];
    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const collectionId = process.env.APPWRITE_USER_COLLECTION_ID;

    if (!endpoint || !projectId || !apiKey || !databaseId || !collectionId) {
        error("Vendor promotion function is missing Appwrite configuration.");
        return res.json({ ok: false, error: "Function configuration is incomplete." }, 500);
    }

    const client = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setKey(apiKey);

    const databases = new Databases(client);
    const application = Object.fromEntries(
        EDITABLE_FIELDS.map(field => [field, req.bodyJson[field]])
    );

    try {
        const current = await databases.getDocument(databaseId, collectionId, userId);
        if (current.accountStatus !== "active") {
            return res.json({ ok: false, error: "This account cannot submit vendor onboarding." }, 403);
        }
        if (current.role !== "customer" || current.vendorStatus === "active") {
            return res.json({ ok: false, error: "Only customer accounts can submit a new vendor application." }, 409);
        }

        const document = await databases.updateDocument(
            databaseId,
            collectionId,
            userId,
            {
                ...application,
                vendorStatus: "draft",
                onboardingStep: 1,
                storeStatus: "closed"
            }
        );

        return res.json({ ok: true, userId: document.$id, status: "draft" });
    } catch (err) {
        if (err?.code === 404) {
            return res.json({ ok: false, error: "User profile not found." }, 404);
        }
        error(err?.message ?? "Vendor application submission failed.");
        return res.json({ ok: false, error: "Vendor application submission failed." }, 500);
    }
};
