import React, { useState, useEffect, useMemo } from "react";
import { databases, DB_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { CollectionCard } from "@/components/features/collection/CollectionCard";
import type { Collection } from "@/types";

const COLLECTIONS_COLLECTION_ID =
    import.meta.env.VITE_APPWRITE_COLLECTIONS_COLLECTION_ID ?? "";

// ── Map raw Appwrite document → Collection shape expected by CollectionCard ───
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

function getAllTags(collections: Collection[]) {
    const tags = new Set<string>();
    collections.forEach(col => col.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags);
}

export function CollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    useEffect(() => {
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

        databases
            .listDocuments(DB_ID, COLLECTIONS_COLLECTION_ID, [
                Query.orderDesc("$createdAt"),
                Query.limit(50)
            ])
            .then(res => {
                setCollections(
                    res.documents.map(doc =>
                        mapDocument(doc as Record<string, any>)
                    )
                );
            })
            .catch((err: any) => {
                console.error("CollectionsPage fetch error:", err);
                setError(err.message ?? "Failed to load collections");
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredCollections = useMemo(() => {
        return collections.filter(col => {
            const matchesSearch =
                col.title.toLowerCase().includes(search.toLowerCase()) ||
                col.description.toLowerCase().includes(search.toLowerCase());
            const matchesTag = selectedTag
                ? col.tags?.includes(selectedTag)
                : true;
            return matchesSearch && matchesTag;
        });
    }, [collections, search, selectedTag]);

    const tags = useMemo(() => getAllTags(collections), [collections]);

    const featured =
        collections.find(col => col.badge === "Featured") || collections[0];

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10 text-center text-lg text-gray-500">
                Loading collections...
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10 text-center text-red-500">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            {/* Featured banner */}
            {featured && (
                <div className="relative rounded-3xl overflow-hidden mb-10 shadow-lg bg-gradient-to-br from-indigo-500/80 to-indigo-700/90 text-white">
                    <img
                        src={featured.imageUrl}
                        alt={featured.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                        loading="lazy"
                    />
                    <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                                {featured.title}
                            </h1>
                            <p className="text-lg md:text-xl mb-4 md:mb-0 drop-shadow-lg">
                                {featured.description}
                            </p>
                            {featured.tags && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {featured.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        {featured.badge && (
                            <span className="px-5 py-2 rounded-full bg-white/90 text-indigo-700 font-bold text-base shadow-lg">
                                {featured.badge}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Tag filters */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
                <button
                    className={`px-4 py-1.5 rounded-full font-medium text-sm transition ${
                        !selectedTag
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    }`}
                    onClick={() => setSelectedTag(null)}
                >
                    All
                </button>
                {tags.map(tag => (
                    <button
                        key={tag}
                        className={`px-4 py-1.5 rounded-full font-medium text-sm transition ${
                            selectedTag === tag
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                        }`}
                        onClick={() => setSelectedTag(tag)}
                    >
                        #{tag}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="flex justify-center mb-8">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search collections..."
                    className="w-full max-w-md px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCollections.length > 0 ? (
                    filteredCollections.map(col => (
                        <CollectionCard key={col.id} collection={col} />
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-400">
                        No collections found.
                    </div>
                )}
            </div>
        </div>
    );
}
