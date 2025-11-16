import { useState, useEffect } from "react";
import { databases } from "@/lib/appwriteClient";
import { products as dummyProducts } from "@/data/products"; // add if not present
import type { Product } from "@/types";

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION;

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProducts() {
            try {
                if (!DB_ID || !COLLECTION_ID) {
                    // Fallback to dummy data if env not configured
                    setProducts(dummyProducts);
                    return;
                }

                const res = await databases.listDocuments(DB_ID, COLLECTION_ID);
                const items = res.documents.map((doc: any) => ({
                    id: doc.$id,
                    title: doc.title,
                    shortDescription: doc.shortDescription,
                    imageUrl: doc.imageUrl,
                    price: doc.price,
                    vendorName: doc.vendorName,
                    vendorType: doc.vendorType,
                    vendorAvatar: doc.vendorAvatar,
                    stock: doc.stock,
                    rating: doc.rating,
                    badge: doc.badge
                }));
                setProducts(items);
            } catch (err) {
                console.warn(
                    "Appwrite fetch failed — using dummy data instead."
                );
                setProducts(dummyProducts);
                setError("Failed to fetch live data.");
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, []);

    return { products, loading, error };
}
