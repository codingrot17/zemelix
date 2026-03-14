import { useState, useEffect } from "react";
import { databases, Query } from "@/lib/appwrite";
import { products as dummyProducts } from "@/data/products";
import type { Product } from "@/types/product";

const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID;

// ── Map Appwrite document → Product ──────────────────────────────────────────
// Field names now match the real schema (sellerName, sellerWhatsapp, sellerAvatar)
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
        sellerWhatsapp: doc.sellerWhatsapp ?? undefined
    };
}

interface UseProductsOptions {
    featuredOnly?: boolean;
    category?: string;
    limit?: number;
    activeOnly?: boolean; // filter status === "active"
}

interface UseProductsResult {
    products: Product[];
    loading: boolean;
    error: string | null;
    isFallback: boolean;
    refetch: () => void;
}

export function useProducts(
    options: UseProductsOptions = {}
): UseProductsResult {
    const {
        featuredOnly = false,
        category,
        limit = 25,
        activeOnly = true
    } = options;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFallback, setIsFallback] = useState(false);
    const [tick, setTick] = useState(0);

    const refetch = () => setTick(t => t + 1);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);

            // ── Fallback: no env configured ──────────────────────────────────
            if (!DB_ID || !COLLECTION_ID) {
                let data = dummyProducts as unknown as Product[];
                if (featuredOnly) data = data.filter(p => p.featured);
                if (activeOnly)
                    data = data.filter(p => !p.status || p.status === "active");
                if (category) data = data.filter(p => p.category === category);
                data = data.slice(0, limit);
                if (!cancelled) {
                    setProducts(data);
                    setIsFallback(true);
                    setLoading(false);
                }
                return;
            }

            // ── Live Appwrite fetch ───────────────────────────────────────────
            try {
                const queries: string[] = [
                    Query.limit(limit),
                    Query.orderDesc("$createdAt")
                ];
                if (featuredOnly) queries.push(Query.equal("featured", true));
                if (activeOnly) queries.push(Query.equal("status", "active"));
                if (category) queries.push(Query.equal("category", category));

                const res = await databases.listDocuments(
                    DB_ID,
                    COLLECTION_ID,
                    queries
                );

                if (!cancelled) {
                    setProducts(
                        res.documents.map(d =>
                            docToProduct(d as Record<string, any>)
                        )
                    );
                    setIsFallback(false);
                }
            } catch (err: any) {
                console.warn(
                    "useProducts: Appwrite fetch failed, using dummy data.",
                    err?.message
                );
                if (!cancelled) {
                    setProducts(
                        dummyProducts.slice(0, limit) as unknown as Product[]
                    );
                    setIsFallback(true);
                    setError("Failed to fetch live products.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [featuredOnly, category, limit, activeOnly, tick]);

    return { products, loading, error, isFallback, refetch };
}
