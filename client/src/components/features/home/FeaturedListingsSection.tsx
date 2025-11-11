import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { products } from "@/data/products";
import { useCart } from "@/hooks/useCart";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

export function FeaturedListingsCarousel() {
    const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
    const navigate = useNavigate();
    const { add } = useCart();

    // Setup carousel handlers
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

    function scrollTo(index: number) {
        if (!carouselApi) return;
        carouselApi.scrollTo(index);
    }

    if (!products || products.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10 text-center text-gray-500">
                No featured products available yet.
            </div>
        );
    }

    return (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 py-8 relative">
            <h2 className="text-2xl font-semibold mb-6 text-primary dark:text-primary-light text-center animate-fade-in">
                Featured Listings
            </h2>

            <Carousel
                setApi={setCarouselApi}
                opts={{ align: "start", loop: false }}
                className="w-full relative"
            >
                {/* Overlay Prev Button */}
                <CarouselPrevious
                    className="
            absolute top-1/2 left-2 -translate-y-1/2 z-20 rounded-full bg-black/30 hover:bg-black/50 text-white p-2 cursor-pointer transition
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
                >
                    <ChevronLeft className="w-6 h-6" />
                </CarouselPrevious>

                {/* Overlay Next Button */}
                <CarouselNext
                    className="
            absolute top-1/2 right-2 -translate-y-1/2 z-20 rounded-full bg-black/30 hover:bg-black/50 text-white p-2 cursor-pointer transition
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
                >
                    <ChevronRight className="w-6 h-6" />
                </CarouselNext>

                <CarouselContent>
                    {products.map(product => (
                        <CarouselItem
                            key={product.id}
                            className="pl-5 md:basis-1/2 lg:basis-1/3"
                        >
                            <div className="min-h-[420px] animate-fade-in flex flex-col border rounded-lg overflow-hidden hover:shadow-md transition">
                                <img
                                    src={product.imageUrl}
                                    alt={product.title}
                                    className="w-full h-56 object-cover"
                                />
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-medium text-base mb-1">
                                        {product.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {product.category}
                                    </p>
                                    <p className="text-sm font-semibold mb-3">
                                        ₦{product.price.toLocaleString()}
                                    </p>

                                    <div className="mt-auto flex justify-between items-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-sm"
                                            onClick={() =>
                                                add({
                                                    id: product.id,
                                                    title: product.title,
                                                    price: product.price,
                                                    imageUrl: product.imageUrl
                                                })
                                            }
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Add to Cart
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="text-sm"
                                            onClick={() =>
                                                navigate(
                                                    `/product/${product.id}`
                                                )
                                            }
                                        >
                                            View
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* Dot Indicators */}
                <div className="flex justify-center gap-3 mt-6">
                    {scrollSnaps.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollTo(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                                selectedIndex === index
                                    ? "bg-indigo-600 dark:bg-indigo-400 scale-125"
                                    : "bg-gray-300 dark:bg-gray-700"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </Carousel>

            {/* View More Button */}
            <div className="flex justify-center mt-8">
                <Button
                    className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-400 dark:hover:bg-indigo-500 px-8 py-3 text-base font-semibold rounded-full shadow-lg transition"
                    onClick={() => navigate("/collections")}
                >
                    View More Products & Services
                </Button>
            </div>
        </section>
    );
}
