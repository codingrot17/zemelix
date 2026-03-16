import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import {
    BadgeChip,
    SellerStrip,
    StockLabel,
    ListingActionButton
} from "@/components/shared/ListingPrimitives";
import type { Product } from "@/types/product";

export function FeaturedListingsCarousel() {
    const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

    const navigate = useNavigate();
    const { add } = useCart();
    const { products, loading, isFallback } = useProducts({
        featuredOnly: false,
        limit: 12,
        activeOnly: true
    });

    // ── Carousel setup ──────────────────────────────────────────────────────────
    const onSelect = useCallback(() => {
        if (!carouselApi) return;
        setSelectedIndex(carouselApi.selectedScrollSnap());
    }, [carouselApi]);

    useEffect(() => {
        if (!carouselApi) return;
        onSelect();
        setScrollSnaps(carouselApi.scrollSnapList());
        carouselApi.on("select", onSelect);
        carouselApi.on("reInit", onSelect);
        return () => {
            carouselApi.off("select", onSelect);
            carouselApi.off("reInit", onSelect);
        };
    }, [carouselApi, onSelect]);

    const scrollTo = (index: number) => carouselApi?.scrollTo(index);

    // ── Cart action ─────────────────────────────────────────────────────────────
    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (product.vendorType === "service") {
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
        setTimeout(
            () =>
                setAddedIds(prev => {
                    const next = new Set(prev);
                    next.delete(product.id);
                    return next;
                }),
            2000
        );
    };

    if (!loading && products.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10 text-center text-gray-500 text-sm">
                No featured listings available yet.
            </div>
        );
    }

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Featured Listings
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Products and services from verified sellers
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/collections")}
                    className="hidden sm:flex"
                >
                    View All
                </Button>
            </div>

            {/* Fallback notice */}
            {isFallback && (
                <div className="mb-4 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-700 dark:text-yellow-300">
                    Showing demo listings — add products via the Seller
                    Dashboard to show live data.
                </div>
            )}

            {/* Carousel */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="h-80 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
                        />
                    ))}
                </div>
            ) : (
                <Carousel
                    setApi={setCarouselApi}
                    opts={{ align: "start", loop: false }}
                    className="w-full relative"
                >
                    <CarouselPrevious className="absolute top-1/2 -left-4 -translate-y-1/2 z-20 rounded-full bg-white dark:bg-gray-800 shadow-md border">
                        <ChevronLeft className="w-5 h-5" />
                    </CarouselPrevious>
                    <CarouselNext className="absolute top-1/2 -right-4 -translate-y-1/2 z-20 rounded-full bg-white dark:bg-gray-800 shadow-md border">
                        <ChevronRight className="w-5 h-5" />
                    </CarouselNext>

                    <CarouselContent>
                        {products.map(product => (
                            <CarouselItem
                                key={product.id}
                                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                            >
                                <FeaturedCard
                                    product={product}
                                    added={addedIds.has(product.id)}
                                    onAction={e => handleAddToCart(e, product)}
                                    onView={() =>
                                        navigate(`/product/${product.id}`)
                                    }
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Dot indicators */}
                    <div className="flex justify-center gap-2 mt-6">
                        {scrollSnaps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                    selectedIndex === index
                                        ? "bg-indigo-600 dark:bg-indigo-400 scale-125"
                                        : "bg-gray-300 dark:bg-gray-600"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </Carousel>
            )}

            {/* Mobile view all */}
            <div className="flex justify-center mt-6 sm:hidden">
                <Button
                    variant="outline"
                    onClick={() => navigate("/collections")}
                    className="w-full"
                >
                    View All Listings
                </Button>
            </div>
        </section>
    );
}

// ── FeaturedCard ───────────────────────────────────────────────────────────────
function FeaturedCard({
    product,
    added,
    onAction,
    onView
}: {
    product: Product;
    added: boolean;
    onAction: (e: React.MouseEvent) => void;
    onView: () => void;
}) {
    const isService = product.vendorType === "service";
    const outOfStock = product.stock === 0;

    return (
        <div
            className="flex flex-col border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
            onClick={onView}
        >
            {/* Image */}
            <div className="relative h-52 overflow-hidden">
                <img
                    src={product.imageUrl || "/images/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                {isService && (
                    <div className="absolute inset-0 bg-teal-900/10 pointer-events-none" />
                )}
                {product.badge && (
                    <div className="absolute top-3 left-3">
                        <BadgeChip badge={product.badge} />
                    </div>
                )}
                {outOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-2 flex-1">
                <SellerStrip
                    name={product.sellerName}
                    avatar={product.sellerAvatar}
                    vendorType={product.vendorType}
                />

                <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {product.title}
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {product.shortDescription}
                </p>

                {/* Rating row */}
                <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {product.rating > 0 ? product.rating.toFixed(1) : "New"}
                    </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            ₦{Number(product.price).toLocaleString()}
                        </p>
                        <StockLabel
                            vendorType={product.vendorType}
                            stock={product.stock}
                        />
                    </div>
                    <ListingActionButton
                        vendorType={product.vendorType}
                        outOfStock={outOfStock}
                        added={added}
                        onClick={onAction}
                        size="sm"
                    />
                </div>
            </div>
        </div>
    );
}
