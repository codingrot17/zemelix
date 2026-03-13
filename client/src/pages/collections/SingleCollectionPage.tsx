import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { databases, DB_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import type { Collection } from "@/types";
import { Star, ShoppingBag, Calendar, Users } from "lucide-react";

const COLLECTIONS_COLLECTION_ID =
    import.meta.env.VITE_APPWRITE_COLLECTIONS_COLLECTION_ID ?? "";

// ── Same mapper as CollectionsPage ─────────────────────────────────────────────
function mapDocument(doc: Record<string, any>): Collection {
    return {
        id: doc.$id,
        title: doc.title ?? "",
        slug: doc.slug ?? doc.$id,
        description: doc.description ?? "",
        longDescription: doc.longDescription ?? undefined,
        imageUrl: doc.imageUrl ?? "",
        badge: doc.badge ?? undefined,
        tags: Array.isArray(doc.tags) ? doc.tags : [],
        type: doc.type ?? "goods",
        itemCount: doc.itemCount ?? undefined,
        priceFrom: doc.priceFrom ?? undefined,
        curator: doc.curatorName
            ? {
                  name: doc.curatorName,
                  avatar: doc.curatorAvatar ?? "",
                  rating: doc.curatorRating ?? undefined
              }
            : undefined,
        exampleService: doc.exampleServiceTitle
            ? {
                  title: doc.exampleServiceTitle,
                  description: doc.exampleServiceDescription ?? "",
                  price: doc.exampleServicePrice ?? ""
              }
            : undefined
    };
}

export function SingleCollectionPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        if (!DB_ID || !COLLECTIONS_COLLECTION_ID) {
            setError(
                "Collections not configured. " +
                    "Add VITE_APPWRITE_COLLECTIONS_COLLECTION_ID to your .env"
            );
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Query by slug field — falls back to $id match if slug field doesn't exist
        databases
            .listDocuments(DB_ID, COLLECTIONS_COLLECTION_ID, [
                Query.equal("slug", slug),
                Query.limit(1)
            ])
            .then(res => {
                if (res.documents.length === 0) {
                    // Fallback: try fetching by document ID directly
                    return databases
                        .getDocument(DB_ID, COLLECTIONS_COLLECTION_ID, slug)
                        .then(doc => ({ documents: [doc] }));
                }
                return res;
            })
            .then(res => {
                if (res.documents.length === 0) {
                    setError("Collection not found");
                    return;
                }
                setCollection(
                    mapDocument(res.documents[0] as Record<string, any>)
                );
            })
            .catch((err: any) => {
                console.error("SingleCollectionPage fetch error:", err);
                setError(
                    err?.code === 404
                        ? "Collection not found"
                        : (err.message ?? "Failed to load collection")
                );
            })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return <div className="p-10 text-center text-gray-500">Loading...</div>;
    }

    if (error) {
        return (
            <div className="p-10 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    className="text-indigo-600 hover:underline"
                    onClick={() => navigate(-1)}
                >
                    ← Back to Collections
                </button>
            </div>
        );
    }

    if (!collection) return null;

    return (
        <div className="max-w-3xl mx-auto my-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
            <button
                className="mb-4 text-indigo-600 hover:underline"
                onClick={() => navigate(-1)}
            >
                ← Back to Collections
            </button>

            <div className="flex flex-col md:flex-row gap-8">
                <img
                    src={collection.imageUrl}
                    alt={collection.title}
                    className="w-full md:w-64 h-64 object-cover rounded-lg shadow"
                />
                <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">
                        {collection.title}
                    </h1>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                        {collection.longDescription || collection.description}
                    </p>

                    {collection.tags && collection.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {collection.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 px-2 py-0.5 rounded-full text-xs font-medium"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                        {collection.type === "goods" ? (
                            <ShoppingBag className="w-5 h-5 text-indigo-500" />
                        ) : (
                            <Calendar className="w-5 h-5 text-emerald-500" />
                        )}
                        {collection.itemCount !== undefined && (
                            <span className="text-sm text-indigo-700 dark:text-indigo-300">
                                {collection.itemCount}{" "}
                                {collection.type === "goods"
                                    ? "items"
                                    : "bookings"}
                            </span>
                        )}
                        {collection.curator && (
                            <>
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">
                                    {collection.curator.name}
                                </span>
                                {collection.curator.rating && (
                                    <span className="flex items-center gap-1 text-yellow-500">
                                        <Star className="w-4 h-4" />
                                        {collection.curator.rating}
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {collection.priceFrom && (
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-300 mb-2">
                            {collection.priceFrom}
                        </div>
                    )}

                    {collection.exampleService && (
                        <div className="mt-4 bg-indigo-50 dark:bg-indigo-800 rounded-lg p-4">
                            <div className="text-xs uppercase font-bold text-indigo-700 dark:text-indigo-200 mb-1">
                                {collection.type === "goods"
                                    ? "Featured Product"
                                    : "Featured Service"}
                            </div>
                            <div className="font-semibold">
                                {collection.exampleService.title}
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                {collection.exampleService.description}
                            </div>
                            <div className="mt-1 font-bold text-indigo-700 dark:text-indigo-200">
                                {collection.exampleService.price}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
