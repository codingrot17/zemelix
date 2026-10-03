import { Client, Databases } from "node-appwrite";

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

function isValidSellerId(value) {
    return typeof value === "string" &&
        value.trim().length > 0 &&
        value.length <= 128 &&
        !/\s/.test(value);
}

function toPublicSellerProfile(document) {
    return {
        id: document.$id,
        ...Object.fromEntries(
            PUBLIC_FIELDS.map(field => [field, document[field] ?? null])
        ),
    };
}

export default async ({ req, res, error }) => {
    if (req.method !== "POST") {
        return res.json({ ok: false, error: "Method not allowed." }, 405);
    }

    const sellerId = req.bodyJson?.sellerId;

    if (!isValidSellerId(sellerId)) {
        return res.json({ ok: false, error: "A valid sellerId is required." }, 400);
    }

    const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
    const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
    const apiKey = req.headers["x-appwrite-key"];
    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const collectionId = process.env.APPWRITE_USER_COLLECTION_ID;

    if (!endpoint || !projectId || !apiKey || !databaseId || !collectionId) {
        error("Public seller profile function is missing Appwrite configuration.");
        return res.json(
            { ok: false, error: "Function configuration is incomplete." },
            500
        );
    }

    const client = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setKey(apiKey);

    const databases = new Databases(client);

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
            return res.json(
                { ok: false, error: "Seller profile not found." },
                404
            );
        }

        return res.json({
            ok: true,
            seller: toPublicSellerProfile(document),
        });
    } catch (err) {
        if (err?.code === 404) {
            return res.json(
                { ok: false, error: "Seller profile not found." },
                404
            );
        }

        error(err?.message ?? "Public seller profile lookup failed.");
        return res.json(
            { ok: false, error: "Public seller profile lookup failed." },
            500
        );
    }
};
