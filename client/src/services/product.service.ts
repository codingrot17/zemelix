import { ID, Query, databases, DB_ID } from "@/lib/appwrite/client";
import {
    storage,
    STORAGE_BUCKET_ID,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID
} from "@/lib/appwrite/client";
import type {
    Product,
    ProductBadge,
    ProductStatus,
    VendorType
} from "@/types/product";

const COLLECTION_ID = import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID;

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

const PROJECT_ID = APPWRITE_PROJECT_ID;

function assertStorageConfig() {
    if (!STORAGE_BUCKET_ID || !PROJECT_ID) {
        throw new Error(
            "Appwrite storage configuration is missing. Set VITE_APPWRITE_STORAGE_BUCKET_ID and VITE_APPWRITE_PROJECT_ID."
        );
    }
}

type ProductDocument = {
    $id: string;
    $createdAt?: string;
    title?: string;
    shortDescription?: string;
    longDescription?: string;
    imageUrl?: string;
    price?: unknown;
    stock?: unknown;
    rating?: unknown;
    category?: string;
    tags?: unknown;
    badge?: unknown;
    featured?: unknown;
    status?: unknown;
    vendorType?: unknown;
    sellerName?: string;
    sellerAvatar?: string;
    sellerWhatsapp?: string;
    sellerId?: string;
};

const PRODUCT_BADGES: ProductBadge[] = [
    "Hot",
    "Trending",
    "Featured",
    "New"
];

function toProductBadge(value: unknown): ProductBadge | undefined {
    return typeof value === "string" && PRODUCT_BADGES.includes(value as ProductBadge)
        ? (value as ProductBadge)
        : undefined;
}

function toProductStatus(value: unknown): ProductStatus {
    return value === "archived" || value === "draft" ? value : "active";
}

function toVendorType(value: unknown): VendorType {
    return value === "service" ? "service" : "seller";
}

function toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function toSellerProduct(doc: ProductDocument): SellerProduct {
    return {
        $id: doc.$id,
        $createdAt: doc.$createdAt ?? "",
        title: doc.title ?? "",
        shortDescription: doc.shortDescription ?? "",
        longDescription: doc.longDescription ?? null,
        price: toNumber(doc.price),
        stock: toNumber(doc.stock),
        category: doc.category ?? "General",
        tags: Array.isArray(doc.tags)
            ? doc.tags.filter((tag): tag is string => typeof tag === "string")
            : [],
        badge: typeof doc.badge === "string" ? doc.badge : null,
        vendorType: typeof doc.vendorType === "string" ? doc.vendorType : "seller",
        sellerName: doc.sellerName ?? "",
        sellerWhatsapp: doc.sellerWhatsapp ?? null,
        sellerAvatar: doc.sellerAvatar ?? null,
        featured: doc.featured === true,
        status: typeof doc.status === "string" ? doc.status : "active",
        rating: toNumber(doc.rating),
        sellerId: doc.sellerId ?? "",
        imageUrl: doc.imageUrl ?? null
    };
}

function docToProduct(doc: ProductDocument): Product {
    return {
        id: doc.$id,
        title: doc.title ?? "",
        shortDescription: doc.shortDescription ?? "",
        longDescription: doc.longDescription ?? "",
        imageUrl: doc.imageUrl ?? "/images/placeholder.svg",
        price: toNumber(doc.price),
        stock: toNumber(doc.stock),
        rating: toNumber(doc.rating),
        category: doc.category ?? "General",
        tags: Array.isArray(doc.tags)
            ? doc.tags.filter((tag): tag is string => typeof tag === "string")
            : [],
        badge: toProductBadge(doc.badge),
        featured: doc.featured === true,
        status: toProductStatus(doc.status),
        vendorType: toVendorType(doc.vendorType),
        sellerName: doc.sellerName ?? "Unknown Seller",
        sellerAvatar: doc.sellerAvatar ?? "/images/placeholder.svg",
        sellerWhatsapp: doc.sellerWhatsapp ?? undefined
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
        activeOnly = true
    } = options;

    const queries: string[] = [
        Query.limit(limit),
        Query.orderDesc("$createdAt")
    ];

    if (featuredOnly) queries.push(Query.equal("featured", true));
    if (activeOnly) queries.push(Query.equal("status", "active"));
    if (category) queries.push(Query.equal("category", category));

    const response = await databases.listDocuments(
        DB_ID,
        COLLECTION_ID,
        queries
    );
    return response.documents.map(document => docToProduct(document));
}

export async function getProduct(productId: string): Promise<Product> {
    assertProductConfig();
    const document = await databases.getDocument(
        DB_ID,
        COLLECTION_ID,
        productId
    );
    return docToProduct(document);
}

export async function listSellerProducts(
    sellerId: string,
    limit = 100
): Promise<SellerProduct[]> {
    assertProductConfig();
    if (!sellerId) throw new Error("Seller ID is required.");

    const response = await databases.listDocuments(DB_ID, COLLECTION_ID, [
        Query.equal("sellerId", sellerId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit)
    ]);

    return response.documents.map(document =>
        toSellerProduct(document as ProductDocument)
    );
}

export async function createSellerProduct(
    input: SellerProductInput
): Promise<SellerProduct> {
    assertProductConfig();
    const document = await databases.createDocument(
        DB_ID,
        COLLECTION_ID,
        ID.unique(),
        input
    );
    return toSellerProduct(document as ProductDocument);
}

export async function updateSellerProduct(
    productId: string,
    input: Partial<SellerProductInput>
): Promise<SellerProduct> {
    assertProductConfig();
    const document = await databases.updateDocument(
        DB_ID,
        COLLECTION_ID,
        productId,
        input
    );
    return toSellerProduct(document as ProductDocument);
}

export async function deleteSellerProduct(productId: string): Promise<void> {
    assertProductConfig();
    await databases.deleteDocument(DB_ID, COLLECTION_ID, productId);
}

export async function uploadProductImage(
    file: File
): Promise<{ fileId: string; url: string }> {
    assertStorageConfig();
    const response = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        file
    );
    const url = `${APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${response.$id}/view?project=${PROJECT_ID}`;
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
