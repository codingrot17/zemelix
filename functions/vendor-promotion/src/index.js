import { Client, Databases } from "node-appwrite";

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
        const document = await databases.updateDocument(
            databaseId,
            collectionId,
            userId,
            {
                ...application,
                role: "seller",
                vendorStatus: "pending",
                storeStatus: "closed",
                onboardingStep: 99,
                currency: "NGN",
                subscriptionPlan: "free",
                accountStatus: "active"
            }
        );

        return res.json({
            ok: true,
            userId: document.$id
        });
    } catch (err) {
        error(err?.message ?? "Vendor promotion failed.");
        return res.json({ ok: false, error: "Vendor promotion failed." }, 500);
    }
};
