import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { products as dummyProducts } from "@/data/products";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/product";
import {
    ArrowLeft,
    ShoppingCart,
    Bookmark,
    Star,
    Package,
    Share2,
    Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_PRODUCTS_COLLECTION_ID;

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

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { add } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [wishlisted, setWishlisted] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        if (!id) return;

        // Try Appwrite first, fall back to dummy data
        if (DB_ID && COLLECTION_ID) {
            databases
                .getDocument(DB_ID, COLLECTION_ID, id)
                .then(doc => setProduct(docToProduct(doc)))
                .catch(() => {
                    // fallback
                    const found = dummyProducts.find(p => p.id === id);
                    if (found) setProduct(found);
                    else setError("Product not found.");
                })
                .finally(() => setLoading(false));
        } else {
            const found = dummyProducts.find(p => p.id === id);
            if (found) setProduct(found);
            else setError("Product not found.");
            setLoading(false);
        }
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        add({
            id: product.id,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl
        });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product?.title,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">
                Loading product...
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                <p className="text-red-500 mb-4">
                    {error ?? "Product not found."}
                </p>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    const isService = product.vendorType === "service";

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* ── Image ── */}
                <div className="relative">
                    <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full aspect-square object-cover rounded-2xl shadow-md"
                    />
                    {product.badge && (
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow">
                            {product.badge}
                        </span>
                    )}
                    <button
                        onClick={() => setWishlisted(w => !w)}
                        className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow hover:bg-pink-50 transition"
                        aria-label="Add to wishlist"
                    >
                        <Heart
                            className={`w-5 h-5 transition-all ${
                                wishlisted
                                    ? "fill-pink-500 text-pink-500"
                                    : "text-gray-400"
                            }`}
                        />
                    </button>
                </div>

                {/* ── Details ── */}
                <div className="flex flex-col gap-4">
                    {/* Category + tags */}
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                            {product.category}
                        </span>
                        {product.tags?.map(tag => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-snug">
                        {product.title}
                    </h1>

                    {/* Rating */}
                    {product.rating > 0 && (
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star
                                    key={s}
                                    className={`w-4 h-4 ${
                                        s <= Math.round(product.rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                    }`}
                                />
                            ))}
                            <span className="text-sm text-gray-500 ml-1">
                                {product.rating.toFixed(1)}
                            </span>
                        </div>
                    )}

                    {/* Price */}
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                        ₦{Number(product.price).toLocaleString()}
                    </p>

                    {/* Short description */}
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {product.shortDescription}
                    </p>

                    {/* Long description */}
                    {product.longDescription && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t pt-4">
                            {product.longDescription}
                        </p>
                    )}

                    {/* Stock / slots */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Package className="w-4 h-4" />
                        {isService
                            ? `${product.stock} slots available`
                            : `${product.stock} in stock`}
                    </div>

                    {/* Vendor */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <img
                            src={product.vendorAvatar}
                            alt={product.vendorName}
                            className="w-10 h-10 rounded-full border-2 border-indigo-200"
                        />
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {product.vendorName}
                            </p>
                            {product.vendorBio && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                    {product.vendorBio}
                                </p>
                            )}
                        </div>
                        <span
                            className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                                isService
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            }`}
                        >
                            {isService ? "Service" : "Seller"}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-2">
                        <Button
                            className="flex-1"
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                        >
                            {addedToCart ? (
                                "Added ✓"
                            ) : isService ? (
                                <>
                                    <Bookmark className="w-4 h-4 mr-2" />
                                    Book Now
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    {product.stock === 0
                                        ? "Out of Stock"
                                        : "Add to Cart"}
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleShare}
                            aria-label="Share"
                        >
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
