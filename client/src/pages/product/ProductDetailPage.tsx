import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "@/services/product.service";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/product";
import {
    ArrowLeft,
    Star,
    Share2,
    Heart,
    MessageCircle,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    BadgeChip,
    ListingTypeChip,
    StockLabel,
    ListingActionButton
} from "@/components/shared/ListingPrimitives";

function buildWhatsAppUrl(phone: string, title: string): string {
    const cleaned = phone.replace(/\D/g, "");
    const number = cleaned.startsWith("0") ? "234" + cleaned.slice(1) : cleaned;
    const msg = encodeURIComponent(
        `Hi! I'm interested in: *${title}* — is it still available?`
    );
    return `https://wa.me/${number}?text=${msg}`;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
                <Star
                    key={s}
                    className={`w-4 h-4 ${
                        s <= Math.round(rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                    }`}
                />
            ))}
            <span className="text-sm text-gray-500 ml-1">
                {rating > 0 ? rating.toFixed(1) : "No ratings yet"}
            </span>
        </div>
    );
}

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { add } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [wishlisted, setWishlisted] = useState(false);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        if (!id) {
            setError("Product not found.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function loadProduct() {
            setLoading(true);
            setError(null);

            try {
                const result = await getProduct(id);
                if (!cancelled) setProduct(result);
            } catch (err) {
                console.error("Failed to load product.", err);
                if (!cancelled) {
                    setProduct(null);
                    setError("Product not found.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadProduct();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleAction = () => {
        if (!product) return;
        if (product.vendorType === "service") return;
        add({
            id: product.id,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product?.title,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied!");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading…
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
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    const isService = product.vendorType === "service";
    const outOfStock = product.stock === 0;
    const sellerInitials = product.sellerName
        .split(" ")
        .map(n => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div className="relative">
                    <div
                        className={`rounded-2xl overflow-hidden shadow-md border-2 ${
                            isService
                                ? "border-teal-200 dark:border-teal-800"
                                : "border-indigo-100 dark:border-indigo-900"
                        }`}
                    >
                        <img
                            src={product.imageUrl || "/images/placeholder.svg"}
                            alt={product.title}
                            className="w-full aspect-square object-cover"
                        />
                        {isService && (
                            <div className="absolute inset-0 bg-teal-900/5 pointer-events-none rounded-2xl" />
                        )}
                    </div>

                    {product.badge && (
                        <div className="absolute top-4 left-4">
                            <BadgeChip badge={product.badge} />
                        </div>
                    )}

                    <button
                        onClick={() => setWishlisted(w => !w)}
                        className="absolute top-4 right-4 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full p-2 shadow hover:scale-110 transition"
                        aria-label="Wishlist"
                    >
                        <Heart
                            className={`w-5 h-5 ${
                                wishlisted
                                    ? "fill-pink-500 text-pink-500"
                                    : "text-gray-400"
                            }`}
                        />
                    </button>

                    {outOfStock && (
                        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                            <span className="bg-white text-gray-800 font-bold px-4 py-2 rounded-full text-sm">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                            {product.category}
                        </span>
                        <ListingTypeChip vendorType={product.vendorType} />
                        {product.tags?.slice(0, 3).map(tag => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full text-xs"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-snug">
                        {product.title}
                    </h1>

                    {product.rating >= 0 && <StarRating rating={product.rating} />}

                    <p
                        className={`text-3xl font-bold ${
                            isService
                                ? "text-teal-600 dark:text-teal-400"
                                : "text-indigo-600 dark:text-indigo-300"
                        }`}
                    >
                        ₦{Number(product.price).toLocaleString()}
                    </p>

                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                        {product.shortDescription}
                    </p>
                    {product.longDescription && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                            {product.longDescription}
                        </p>
                    )}

                    <StockLabel
                        vendorType={product.vendorType}
                        stock={product.stock}
                    />

                    <div
                        className={`p-4 rounded-xl border ${
                            isService
                                ? "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800"
                                : "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
                        }`}
                    >
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                            {isService ? "Service Provider" : "Sold by"}
                        </p>
                        <div className="flex items-center gap-3">
                            {product.sellerAvatar ? (
                                <img
                                    src={product.sellerAvatar}
                                    alt={product.sellerName}
                                    className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700 object-cover shadow"
                                />
                            ) : (
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow ${
                                        isService ? "bg-teal-500" : "bg-indigo-500"
                                    }`}
                                >
                                    {sellerInitials}
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {product.sellerName}
                                </p>
                                <ListingTypeChip
                                    vendorType={product.vendorType}
                                    size="xs"
                                />
                            </div>
                        </div>

                        {product.sellerWhatsapp && (
                            <a
                                href={buildWhatsAppUrl(product.sellerWhatsapp, product.title)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition"
                                onClick={e => e.stopPropagation()}
                            >
                                <MessageCircle className="w-4 h-4" />
                                Chat on WhatsApp
                            </a>
                        )}
                    </div>

                    <div className="flex gap-3 mt-2">
                        <ListingActionButton
                            vendorType={product.vendorType}
                            outOfStock={outOfStock}
                            added={added}
                            onClick={handleAction}
                            size="default"
                            className="flex-1"
                        />
                        <Button
                            variant="outline"
                            onClick={handleShare}
                            aria-label="Share"
                            className="px-4"
                        >
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
