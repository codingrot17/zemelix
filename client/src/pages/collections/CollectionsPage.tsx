import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CollectionCard } from "@/components/features/collection/CollectionCard";
import ProductCard from "@/components/shared/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { getCollectionErrorMessage, listCollections } from "@/services/collection.service";
import type { Collection } from "@/types/collection";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryDatabase } from "@/data/businessCategories";
import { categoryLabel, listingMatchesCategory } from "@/services/category.service";

type View = "collections" | "products";

function getAllTags(collections: Collection[]) {
    const tags = new Set<string>();
    collections.forEach(col => col.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags);
}

export function CollectionsPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [colLoading, setColLoading] = useState(true);
    const [colError, setColError] = useState<string | null>(null);
    const [search, setSearch] = useState(() => searchParams.get("q") ?? searchParams.get("search") ?? "");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get("category") ?? "");
    const [selectedType, setSelectedType] = useState<"seller" | "service" | null>(() => searchParams.get("type") === "service" ? "service" : searchParams.get("type") === "seller" ? "seller" : null);
    const [activeView, setActiveView] = useState<View>(() => (searchParams.get("view") === "products" || searchParams.has("category") || searchParams.has("search") || searchParams.has("q") || searchParams.has("type")) ? "products" : "collections");
    const [showFilters, setShowFilters] = useState(false);

    const { products, loading: prodLoading, error: prodError, refetch: refetchProducts } = useProducts({ limit: 50 });

    useEffect(() => {
        setSearch(searchParams.get("search") ?? searchParams.get("q") ?? "");
        setActiveView((searchParams.get("view") === "products" || searchParams.has("category") || searchParams.has("search") || searchParams.has("q") || searchParams.has("type")) ? "products" : "collections");
        setSelectedCategory(searchParams.get("category") ?? "");
        setSelectedType(searchParams.get("type") === "service" ? "service" : searchParams.get("type") === "seller" ? "seller" : null);
    }, [searchParams]);

    useEffect(() => {
        let cancelled = false;

        setColLoading(true);
        setColError(null);

        listCollections()
            .then(result => {
                if (!cancelled) setCollections(result);
            })
            .catch(error => {
                if (!cancelled) {
                    console.error("CollectionsPage:", error);
                    setColError(getCollectionErrorMessage(error));
                }
            })
            .finally(() => {
                if (!cancelled) setColLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const tags = useMemo(() => getAllTags(collections), [collections]);

    function updateSearch(value: string) {
        setSearch(value);
        const next = new URLSearchParams(searchParams);
        if (value.trim()) next.set("search", value);
        else next.delete("search");
        next.delete("q");
        if (value.trim()) next.set("view", "products");
        setSearchParams(next, { replace: true });
    }

    const filteredCollections = useMemo(() => {
        const q = search.toLowerCase();
        return collections.filter(col => {
            const matchSearch =
                !q ||
                col.title.toLowerCase().includes(q) ||
                col.description.toLowerCase().includes(q);
            const matchTag = !selectedTag || col.tags?.includes(selectedTag);
            return matchSearch && matchTag;
        });
    }, [collections, search, selectedTag]);

    const filteredProducts = useMemo(() => {
        const q = search.toLowerCase();
        return products.filter(
            p =>
                (!selectedType || p.vendorType === selectedType || (selectedType === "service" && (p.vendorType as string) === "service-provider")) &&
                (!selectedCategory || listingMatchesCategory(p, selectedCategory)) &&
                (!q || p.title.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.sellerName.toLowerCase().includes(q) || (p.tags ?? []).some(tag => tag.toLowerCase().includes(q)))
        );
    }, [products, search, selectedType, selectedCategory]);

    const featured = collections.find(c => c.badge === "Featured") ?? collections[0];
    const isLoading = activeView === "collections" ? colLoading : prodLoading;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {featured && !colLoading && (
                <div
                    className="relative rounded-2xl overflow-hidden mb-10 shadow-lg cursor-pointer group"
                    onClick={() => navigate(`/collections/${featured.slug}`)}
                >
                    <img
                        src={featured.imageUrl}
                        alt={featured.title}
                        className="w-full h-52 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {featured.badge && (
                                <span className="px-3 py-1 rounded-full bg-white/90 text-indigo-700 text-xs font-bold">
                                    {featured.badge}
                                </span>
                            )}
                            {featured.tags?.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-1 rounded-full bg-white/20 text-white text-xs backdrop-blur">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold drop-shadow mb-1">{featured.title}</h1>
                        <p className="text-white/80 text-sm line-clamp-2 max-w-xl">{featured.description}</p>
                    </div>
                </div>
            )}

            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center" aria-label="Browse categories">
                <label htmlFor="marketplace-category" className="text-sm font-medium text-gray-700 dark:text-gray-300">Browse category</label>
                <select id="marketplace-category" value={selectedCategory} onChange={event => { const value = event.target.value; setSelectedCategory(value); const next = new URLSearchParams(searchParams); if (value) next.set("category", value); else next.delete("category"); next.set("view", "products"); setSearchParams(next); setActiveView("products"); }} className="w-full sm:max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                    <option value="">All categories</option>
                    {categoryDatabase.map(group => <optgroup key={group.type} label={group.label}>
                        {group.categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </optgroup>)}
                </select>
            </div>\n\n            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0">
                    {(["collections", "products"] as View[]).map(v => (
                        <button
                            key={v}
                            onClick={() => { setActiveView(v); const next = new URLSearchParams(searchParams); if (v === "products") next.set("view", "products"); else { next.delete("view"); next.delete("category"); setSelectedCategory(""); } setSearchParams(next); }}
                            className={`px-4 py-2 text-sm font-medium capitalize transition ${
                                activeView === v
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => updateSearch(e.target.value)}
                        placeholder={`Search ${activeView}…`}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    {search && (
                        <button onClick={() => updateSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {activeView === "collections" && (
                    <Button variant="outline" onClick={() => setShowFilters(f => !f)} className="flex-shrink-0">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filters {selectedTag && <span className="ml-1 w-2 h-2 rounded-full bg-indigo-600 inline-block" />}
                    </Button>
                )}
            </div>

            {activeView === "products" && (
                <div className="mb-6 flex flex-wrap gap-2">
                    {([{ label: "All listings", value: null }, { label: "Products", value: "seller" }, { label: "Services", value: "service" }] as const).map(option => (
                        <button key={option.label} onClick={() => setSelectedType(option.value)} className={`rounded-full border px-3 py-2 text-xs font-medium transition ${selectedType === option.value ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300 bg-white text-gray-600 hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                            {option.label}
                        </button>
                    ))}
                </div>
            )}

            {activeView === "collections" && showFilters && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                            !selectedTag
                                ? "bg-indigo-600 text-white"
                                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                        }`}
                    >
                        All
                    </button>
                    {tags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                                selectedTag === tag
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                            }`}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            )}

            {colError && activeView === "collections" && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                    {colError}
                </div>
            )}

            {isFallback && activeView === "products" && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-700 dark:text-yellow-300">
                    Showing demo products — set <code>VITE_APPWRITE_PRODUCTS_COLLECTION_ID</code> in .env to load live data.
                </div>
            )}

            {isLoading && (
                <div className="flex items-center justify-center py-20 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mr-3" />
                    <span className="text-sm">Loading {activeView}…</span>
                </div>
            )}

            {!isLoading && activeView === "collections" && (
                filteredCollections.length === 0 ? (
                    <EmptyState
                        message={search ? `No collections matching "${search}"` : "No collections found."}
                        onClear={() => { updateSearch(""); setSelectedTag(null); }}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCollections.map(col => <CollectionCard key={col.id} collection={col} />)}
                    </div>
                )
            )}

            {!isLoading && activeView === "products" && (
                <>
                    {filteredProducts.length === 0 ? (
                        <EmptyState
                            message={search ? `No products matching "${search}"` : "No active products found."}
                            onClear={() => updateSearch("")}
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                    <p className="text-center text-xs text-gray-400 mt-8">
                        {filteredProducts.length} listing{filteredProducts.length !== 1 ? "s" : ""} shown
                    </p>
                </>
            )}
        </div>
    );
}

function EmptyState({ message, onClear }: { message: string; onClear: () => void }) {
    return (
        <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
            <Button variant="outline" onClick={onClear}>Clear filters</Button>
        </div>
    );
}
