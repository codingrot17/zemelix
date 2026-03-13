import { useState, useEffect } from "react";
import { databases } from "@/lib/appwrite";
import { Query } from "@/lib/appwrite";
import { products as dummyProducts } from "@/data/products"; // add if not present
import type { Product } from "@/types/product";

const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID;

// ── Shape mapper: Appwrite document → Product ─────────────────────────────────
function docToProduct(doc: any): Product {
    return {
        id: doc.$id,
        title: doc.title ?? "",
        shortDescription: doc.shortDescription ?? "",
        imageUrl: doc.imageUrl ?? "/images/placeholder.svg",
        price: Number(doc.price) ?? 0,
        vendorName: doc.vendorName ?? "Unknown",
        vendorType: doc.vendorType ?? "seller",
        vendorAvatar: doc.vendorAvatar ?? "/images/placeholder.svg",
        stock: Number(doc.stock) ?? 0,
        rating: Number(doc.rating) ?? 0,
        badge: doc.badge ?? undefined,
        category: doc.category ?? "General",
        tags: Array.isArray(doc.tags) ? doc.tags : [],
        featured: doc.featured ?? false,
        vendorBio: doc.vendorBio ?? "",
        longDescription: doc.longDescription ?? ""
    };
}

// ── Hook ──────────────────────────────────────────────────────────────────────
interface UseProductsOptions {
    /** Only return featured products */
    featuredOnly?: boolean;
    /** Filter by category string */
    category?: string;
    /** Max results (default: 25) */
    limit?: number;
}

interface UseProductsResult {
    products: Product[];
    loading: boolean;
    error: string | null;
    /** true when data came from dummy/static fallback */
    isFallback: boolean;
}
export function useProducts(
    options: UseProductsOptions = {}
): UseProductsResult {
    const { featuredOnly = false, category, limit = 25 } = options;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFallback, setIsFallback] = useState(false);
    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(null);

            if (!DB_ID || !COLLECTION_ID) {
                // Fallback to dummy data if env not configured
                let data = dummyProducts;
                if (featuredOnly) data = data.filter(p => p.featured);
                if (category) data = data.filter(p => p.category === category);
                data = data.slice(0, limit);

                if (!cancelled) {
                    (setProducts(data), setIsFallback(true), setLoading(false));
                }

                return;
            }

            try {
                const queries: string[] = [Query.limit(limit)];
                if (featuredOnly) queries.push(Query.equal("featured", true));
                if (category) queries.push(Query.equal("category", category));
                const res = await databases.listDocuments(
                    DB_ID,
                    COLLECTION_ID,
                    queries
                );
                if (!cancelled) {
                    setProducts(res.documents.map(docToProduct));
                    setIsFallback(false);
                }
            } catch (err: any) {
                console.warn(
                    "Appwrite fetch failed — using dummy data instead.",
                    err?.message
                );
                if (!cancelled) {
                    setProducts(dummyProducts.slice(0, limit));
                    setIsFallback(true);
                    setError("Failed to fetch live data.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [featuredOnly, category, limit]);

    return { products, loading, error, isFallback };
}
