import { useState } from "react";
import { Heart, Star, ShoppingCart, Bookmark } from "lucide-react";
import type { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
    const [wishlisted, setWishlisted] = useState(false);

    const toggleWishlist = () => {
        setWishlisted(prev => {
            const next = !prev;
            const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
            const updated = next
                ? [...stored, product.id]
                : stored.filter((id: string) => id !== product.id);
            localStorage.setItem("wishlist", JSON.stringify(updated));
            return next;
        });
    };

    return (
        <div className="group relative flex flex-col bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-out">
            {/* Image */}
            <div className="relative h-56 w-full overflow-hidden">
                <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                />
                <button
                    onClick={toggleWishlist}
                    className="absolute top-3 right-3 bg-white/70 backdrop-blur-md p-2 rounded-full shadow-sm hover:scale-110 transition"
                >
                    <Heart
                        className={`w-4 h-4 ${
                            wishlisted
                                ? "fill-red-500 text-red-500"
                                : "text-zinc-600"
                        }`}
                    />
                </button>
                {product.badge && (
                    <span className="absolute bottom-3 left-3 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-full">
                        {product.badge}
                    </span>
                )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between flex-grow p-4 space-y-3">
                <div>
                    <div className="flex items-center gap-2">
                        <img
                            src={product.vendorAvatar}
                            alt={product.vendorName}
                            className="h-6 w-6 rounded-full border"
                        />
                        <p className="text-sm font-medium">
                            {product.vendorName}
                        </p>
                        <p
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                product.vendorType === "seller"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-blue-100 text-blue-700"
                            }`}
                        >
                            {product.vendorType}
                        </p>
                    </div>

                    <h3 className="mt-2 text-base font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-1">
                        {product.title}
                    </h3>
                    <p className="text-sm text-zinc-500 line-clamp-2">
                        {product.shortDescription}
                    </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-yellow-400" />{" "}
                        {product.rating}
                    </div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        ${product.price}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">
                        {product.vendorType === "seller"
                            ? `${product.stock} in stock`
                            : `${product.stock} slots left`}
                    </p>
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 text-white rounded-full text-xs hover:bg-zinc-700 active:scale-95 transition">
                        {product.vendorType === "seller" ? (
                            <>
                                <ShoppingCart className="w-4 h-4" /> Add to Cart
                            </>
                        ) : (
                            <>
                                <Bookmark className="w-4 h-4" /> Book Now
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
