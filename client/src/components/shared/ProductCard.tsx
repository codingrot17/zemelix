import { useState } from "react";
import { Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Product } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import {
    BadgeChip,
    SellerStrip,
    StockLabel,
    ListingActionButton
} from "@/components/shared/ListingPrimitives";

export default function ProductCard({ product }: { product: Product }) {
    const navigate = useNavigate();
    const { add } = useCart();
    const [wishlisted, setWishlisted] = useState(false);
    const [added, setAdded] = useState(false);

    const isService = product.vendorType === "service";
    const outOfStock = product.stock === 0;

    const handleAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (outOfStock || isService) {
            navigate(`/product/${product.id}`);
            return;
        }
        add({
            id: product.id,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const toggleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        setWishlisted(prev => {
            const next = !prev;
            try {
                const stored: string[] = JSON.parse(
                    localStorage.getItem("wishlist") || "[]"
                );
                const updated = next
                    ? [...stored, product.id]
                    : stored.filter(id => id !== product.id);
                localStorage.setItem("wishlist", JSON.stringify(updated));
            } catch {}
            return next;
        });
    };

    return (
        <div
            className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
        >
            {/* ── Image ── */}
            <div className="relative h-52 w-full overflow-hidden">
                <img
                    src={product.imageUrl || "/images/placeholder.svg"}
                    alt={product.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />

                {/* Service overlay tint */}
                {isService && (
                    <div className="absolute inset-0 bg-teal-900/10 pointer-events-none" />
                )}

                {/* Badge */}
                {product.badge && (
                    <div className="absolute top-3 left-3">
                        <BadgeChip badge={product.badge} />
                    </div>
                )}

                {/* Wishlist */}
                <button
                    onClick={toggleWishlist}
                    className="absolute top-3 right-3 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full p-1.5 shadow hover:scale-110 transition"
                    aria-label="Wishlist"
                >
                    <Heart
                        className={`w-4 h-4 transition ${
                            wishlisted
                                ? "fill-red-500 text-red-500"
                                : "text-zinc-400"
                        }`}
                    />
                </button>

                {/* Out of stock overlay */}
                {outOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* ── Content ── */}
            <div className="flex flex-col flex-1 p-4 gap-3">
                {/* Seller strip */}
                <SellerStrip
                    name={product.sellerName}
                    avatar={product.sellerAvatar}
                    vendorType={product.vendorType}
                />

                {/* Title */}
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-snug">
                    {product.title}
                </h3>

                {/* Short description */}
                {product.shortDescription && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {product.shortDescription}
                    </p>
                )}

                {/* Rating + Price row */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-3.5 h-3.5 fill-yellow-400" />
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {product.rating > 0
                                ? product.rating.toFixed(1)
                                : "New"}
                        </span>
                    </div>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                        ₦{Number(product.price).toLocaleString()}
                    </span>
                </div>

                {/* Stock label + Action button */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <StockLabel
                        vendorType={product.vendorType}
                        stock={product.stock}
                    />
                    <ListingActionButton
                        vendorType={product.vendorType}
                        outOfStock={outOfStock}
                        added={added}
                        onClick={handleAction}
                        size="sm"
                    />
                </div>
            </div>
        </div>
    );
}
