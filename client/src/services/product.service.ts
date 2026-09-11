import { databases, DB_ID, Query } from "@/lib/appwrite";
import type { Product } from "@/types/product";

const COLLECTION_ID = import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID;

export interface ListProductsOptions {
    featuredOnly?: boolean;
    category?: string;
    limit?: number;
    activeOnly?: boolean;
}

function assertProductConfig() {
    if (!DB_ID || !COLLECTION_ID) {
        throw new Error(
            "Appwrite product configuration is missing. Set VITE_APPWRITE_DB_ID and VITE_APPWRITE_PRODUCTS_COLLECTION_ID."
        );
    }
}

function docToProduct(doc: Record<string, any>): Product {
    return {
        id: doc.$id,
        title: doc.title ?? "",
        shortDescription: doc.shortDescription ?? "",
        longDescription: doc.longDescription ?? "",
        imageUrl: doc.imageUrl ?? "/images/placeholder.svg",
        price: Number(doc.price) || 0,
        stock: Number(doc.stock) || 0,
        rating: Number(doc.rating) || 0,
        category: doc.category ?? "General",
        tags: Array.isArray(doc.tags) ? doc.tags : [],
        badge: doc.badge ?? undefined,
        featured: doc.featured ?? false,
        status: doc.status ?? "active",
        vendorType: doc.vendorType ?? "seller",
        sellerName: doc.sellerName ?? "Unknown Seller",
        sellerAvatar: doc.sellerAvatar ?? "/images/placeholder.svg",
        sellerWhatsapp: doc.sellerWhatsapp ?? undefined,
    };
}

export async function listProducts(
    options: ListProductsOptions = {}
): Promise<Product[]> {
    assertProductConfig();

    const {
        featuredOnly = false,
        category,
        limit = 25,
        activeOnly = true,
    } = options;

    const queries: string[] = [
        Query.limit(limit),
        Query.orderDesc("$createdAt"),
    ];

    if (featuredOnly) queries.push(Query.equal("featured", true));
    if (activeOnly) queries.push(Query.equal("status", "active"));
    if (category) queries.push(Query.equal("category", category));

    const response = await databases.listDocuments(
        DB_ID,
        COLLECTION_ID,
        queries
    );

    return response.documents.map((document) =>
        docToProduct(document as Record<string, any>)
    );
}

export async function getProduct(productId: string): Promise<Product> {
    assertProductConfig();

    const document = await databases.getDocument(
        DB_ID,
        COLLECTION_ID,
        productId
    );

    return docToProduct(document as Record<string, any>);
}
