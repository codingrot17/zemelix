import { useState, useEffect } from "react";
import { listProducts } from "@/services/product.service";
import type { Product } from "@/types/product";

interface UseProductsOptions {
    featuredOnly?: boolean;
    category?: string;
    limit?: number;
    activeOnly?: boolean;
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
        activeOnly = true,
    } = options;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    const refetch = () => setTick((value) => value + 1);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const data = await listProducts({
                    featuredOnly,
                    category,
                    limit,
                    activeOnly,
                });

                if (!cancelled) {
                    setProducts(data);
                }
            } catch (err: any) {
                console.error("useProducts: failed to load products", err);

                if (!cancelled) {
                    setProducts([]);
                    setError(
                        err?.message || "Failed to fetch products from Appwrite."
                    );
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

    return {
        products,
        loading,
        error,
        isFallback: false,
        refetch,
    };
}
