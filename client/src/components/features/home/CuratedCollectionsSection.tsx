import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { databases, Query } from "@/lib/appwrite";
import { products as dummyProducts } from "@/data/products";
import {
    BadgeChip,
    SellerStrip,
    ListingActionButton,
    StockLabel
} from "@/components/shared/ListingPrimitives";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/product";

// ── Config ─────────────────────────────────────────────────────────────────────
const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID;
const ITEMS_PER_GROUP = 3;
const AUTOPLAY_MS = 4500;

// ── Types ──────────────────────────────────────────────────────────────────────
interface CategoryGroup {
    category: string;
    items: Product[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────
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
        sellerAvatar: doc.sellerAvatar ?? undefined,
        sellerWhatsapp: doc.sellerWhatsapp ?? undefined
    };
}

/**
 * Groups a flat product list by category.
 * Each group contains at most ITEMS_PER_GROUP items (highest rated first).
 * Groups with fewer than 2 items are dropped to avoid thin slides.
 */
function groupByCategory(products: Product[]): CategoryGroup[] {
    const map = new Map<string, Product[]>();

    for (const p of products) {
        const key = p.category || "Other";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(p);
    }

    return Array.from(map.entries())
        .filter(([, items]) => items.length >= 2)
        .map(([category, items]) => ({
            category,
            // already sorted by rating desc from Appwrite query
            items: items.slice(0, ITEMS_PER_GROUP)
        }));
}

// ── Main component ─────────────────────────────────────────────────────────────
export function CuratedCollectionsCarousel() {
    const navigate = useNavigate();
    const { add } = useCart();

    const [groups, setGroups] = useState<CategoryGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFallback, setIsFallback] = useState(false);
    const [current, setCurrent] = useState(0);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

    // autoplay ref holds the latest `next` fn without stale closure
    const nextRef = useRef<() => void>(() => {});

    // ── Fetch ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            setLoading(true);

            // Fallback: no env configured
            if (!DB_ID || !COLLECTION_ID) {
                const grouped = groupByCategory(
                    dummyProducts as unknown as Product[]
                );
                setGroups(grouped);
                setIsFallback(true);
                setLoading(false);
                return;
            }

            try {
                const res = await databases.listDocuments(
                    DB_ID,
                    COLLECTION_ID,
                    [
                        Query.equal("status", "active"),
                        Query.orderDesc("rating"),
                        Query.limit(40)
                    ]
                );
                const products = res.documents.map(d =>
                    docToProduct(d as Record<string, any>)
                );
                const grouped = groupByCategory(products);

                // If Appwrite returned too few products, fall back to demo
                if (grouped.length === 0) {
                    setGroups(
                        groupByCategory(dummyProducts as unknown as Product[])
                    );
                    setIsFallback(true);
                } else {
                    setGroups(grouped);
                    setIsFallback(false);
                }
            } catch (err) {
                console.warn(
                    "CuratedCollections fetch failed, using demo data.",
                    err
                );
                setGroups(
                    groupByCategory(dummyProducts as unknown as Product[])
                );
                setIsFallback(true);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    // ── Navigation ──────────────────────────────────────────────────────────────
    const prev = useCallback(() => {
        setCurrent(c => (c === 0 ? groups.length - 1 : c - 1));
    }, [groups.length]);

    const next = useCallback(() => {
        setCurrent(c => (c === groups.length - 1 ? 0 : c + 1));
    }, [groups.length]);

    // Keep ref fresh
    useEffect(() => {
        nextRef.current = next;
    }, [next]);

    // Autoplay
    useEffect(() => {
        if (groups.length <= 1) return;
        const id = setInterval(() => nextRef.current(), AUTOPLAY_MS);
        return () => clearInterval(id);
    }, [groups.length]);

    // ── Cart action ─────────────────────────────────────────────────────────────
    const handleAction = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (product.vendorType === "service" || product.stock === 0) {
            navigate(`/product/${product.id}`);
            return;
        }
        add({
            id: product.id,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl
        });
        setAddedIds(prev => new Set(prev).add(product.id));
        setTimeout(() => {
            setAddedIds(prev => {
                const next = new Set(prev);
                next.delete(product.id);
                return next;
            });
        }, 2000);
    };

    // ── Loading skeleton ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />
                <div className="h-72 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            </section>
        );
    }

    if (groups.length === 0) return null;

    const activeGroup = groups[current];

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Curated Collections
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Top-rated listings by category
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/collections")}
                    className="hidden sm:flex"
                >
                    Browse All
                </Button>
            </div>

            {/* Fallback notice */}
            {isFallback && (
                <div className="mb-4 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-700 dark:text-yellow-300">
                    Showing demo data — add products via Seller Dashboard to
                    show live collections.
                </div>
            )}

            {/* Slide */}
            <div className="relative">
                {/* Prev / Next */}
                {groups.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={next}
                            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </>
                )}

                {/* Card */}
                <div
                    key={activeGroup.category}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all"
                >
                    {/* Category header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-teal-50 dark:from-indigo-900/20 dark:to-teal-900/20 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                            {activeGroup.category}
                        </h3>
                        <button
                            onClick={() => navigate("/collections")}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                            See all →
                        </button>
                    </div>

                    {/* Product rows */}
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {activeGroup.items.map(product => (
                            <div
                                key={product.id}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer group"
                                onClick={() =>
                                    navigate(`/product/${product.id}`)
                                }
                            >
                                {/* Thumbnail */}
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={
                                            product.imageUrl ||
                                            "/images/placeholder.svg"
                                        }
                                        alt={product.title}
                                        className="w-14 h-14 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                                        loading="lazy"
                                    />
                                    {product.badge && (
                                        <div className="absolute -top-1.5 -left-1.5">
                                            <BadgeChip
                                                badge={product.badge}
                                                className="text-[9px] px-1.5 py-0.5"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                        {product.title}
                                    </p>
                                    <SellerStrip
                                        name={product.sellerName}
                                        avatar={product.sellerAvatar}
                                        vendorType={product.vendorType}
                                        className="mt-1"
                                    />
                                    <StockLabel
                                        vendorType={product.vendorType}
                                        stock={product.stock}
                                    />
                                </div>

                                {/* Price + Action */}
                                <div
                                    className="flex flex-col items-end gap-2 flex-shrink-0"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        ₦
                                        {Number(product.price).toLocaleString()}
                                    </span>
                                    <ListingActionButton
                                        vendorType={product.vendorType}
                                        outOfStock={product.stock === 0}
                                        added={addedIds.has(product.id)}
                                        onClick={e => handleAction(e, product)}
                                        size="sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dot indicators */}
                {groups.length > 1 && (
                    <div className="flex justify-center gap-2 mt-5">
                        {groups.map((g, idx) => (
                            <button
                                key={g.category}
                                onClick={() => setCurrent(idx)}
                                className={`transition-all rounded-full ${
                                    idx === current
                                        ? "w-6 h-2.5 bg-indigo-600 dark:bg-indigo-400"
                                        : "w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                                }`}
                                aria-label={`Go to ${g.category}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile CTA */}
            <div className="flex justify-center mt-6 sm:hidden">
                <Button
                    variant="outline"
                    onClick={() => navigate("/collections")}
                    className="w-full"
                >
                    Browse All Collections
                </Button>
            </div>
        </section>
    );
}
