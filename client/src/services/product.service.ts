import { ID, Query, databases, storage, DB_ID, STORAGE_BUCKET_ID } from "@/lib/appwrite";
import type { Product } from "@/types/product";

const COLLECTION_ID = import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

export interface ListProductsOptions {
    featuredOnly?: boolean;
    category?: string;
    limit?: number;
    activeOnly?: boolean;
}

export interface SellerProductInput {
    title: string;
    shortDescription: string;
    longDescription?: string | null;
    price: number;
    stock: number;
    category: string;
    tags: string[];
    badge?: string | null;
    vendorType: string;
    sellerName: string;
    sellerWhatsapp?: string | null;
    sellerAvatar?: string | null;
    featured: boolean;
    status: string;
    rating: number;
    sellerId: string;
    imageUrl?: string | null;
}

export interface SellerProduct extends SellerProductInput {
    $id: string;
    $createdAt: string;
}

function assertProductConfig() {
    if (!DB_ID || !COLLECTION_ID) {
        throw new Error(
            "Appwrite product configuration is missing. Set VITE_APPWRITE_DB_ID and VITE_APPWRITE_PRODUCTS_COLLECTION_ID."
        );
    }
}

function assertStorageConfig() {
    if (!STORAGE_BUCKET_ID || !PROJECT_ID) {
        throw new Error(
            "Appwrite storage configuration is missing. Set VITE_APPWRITE_STORAGE_BUCKET_ID and VITE_APPWRITE_PROJECT_ID."
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

export async function listProducts(options: ListProductsOptions = {}): Promise<Product[]> {
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

    const response = await databases.listDocuments(DB_ID, COLLECTION_ID, queries);
    return response.documents.map(document => docToProduct(document as Record<string, any>));
}

export async function getProduct(productId: string): Promise<Product> {
    assertProductConfig();
    const document = await databases.getDocument(DB_ID, COLLECTION_ID, productId);
    return docToProduct(document as Record<string, any>);
}

export async function listSellerProducts(sellerId: string, limit = 100): Promise<SellerProduct[]> {
    assertProductConfig();
    if (!sellerId) throw new Error("Seller ID is required.");

    const response = await databases.listDocuments(DB_ID, COLLECTION_ID, [
        Query.equal("sellerId", sellerId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
    ]);

    return response.documents as unknown as SellerProduct[];
}

export async function createSellerProduct(input: SellerProductInput): Promise<SellerProduct> {
    assertProductConfig();
    const document = await databases.createDocument(
        DB_ID,
        COLLECTION_ID,
        ID.unique(),
        input
    );
    return document as unknown as SellerProduct;
}

export async function updateSellerProduct(
    productId: string,
    input: Partial<SellerProductInput>
): Promise<SellerProduct> {
    assertProductConfig();
    const document = await databases.updateDocument(DB_ID, COLLECTION_ID, productId, input);
    return document as unknown as SellerProduct;
}

export async function deleteSellerProduct(productId: string): Promise<void> {
    assertProductConfig();
    await databases.deleteDocument(DB_ID, COLLECTION_ID, productId);
}

export async function uploadProductImage(file: File): Promise<{ fileId: string; url: string }> {
    assertStorageConfig();
    const response = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), file);
    const url = `${ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${response.$id}/view?project=${PROJECT_ID}`;
    return { fileId: response.$id, url };
}

export async function deleteProductImage(fileId: string): Promise<void> {
    assertStorageConfig();
    try {
        await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
    } catch {
        // Ignore missing/already-deleted files.
    }
}
