import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CollectionCard } from "./CollectionCard";

interface Collection {
  id: number | string;
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  badge?: "Featured" | "Popular" | "New";
}

const collections: Collection[] = [
  {
    id: 1,
    title: "Top Electronics",
    description: "Latest gadgets and must-have devices.",
    imageUrl: "/images/collections/electronics.jpg",
    slug: "electronics",
    badge: "Featured",
  },
  {
    id: 2,
    title: "Fashion Finds",
    description: "Trending styles and timeless classics.",
    imageUrl: "/images/collections/fashion.jpg",
    slug: "fashion",
    badge: "Popular",
  },
  {
    id: 3,
    title: "Home & Garden",
    description: "Everything for a cozy, beautiful home.",
    imageUrl: "/images/collections/home-garden.jpg",
    slug: "home-garden",
  },
  // Add more collections as needed
];


export function CollectionsPage() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const navigate = useNavigate();

  // Responsive cards per view (1 mobile, 2 desktop)
  const [cardsPerView, setCardsPerView] = useState(1);
  useEffect(() => {
    function handleResize() {
      setCardsPerView(window.innerWidth < 768 ? 1 : 2);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-8 relative">
      <h2 className="text-2xl font-semibold mb-6 text-primary dark:text-primary-light text-center">
        Explore Collections
      </h2>

      <Carousel
        setApi={setCarouselApi}
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full relative"
      >
        <CarouselPrevious
          className="absolute top-1/2 left-2 -translate-y-1/2 z-20 rounded-full bg-black/30 hover:bg-black/50 text-white p-2 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Previous collections"
        >
          <ChevronLeft className="w-6 h-6" />
        </CarouselPrevious>

        <CarouselNext
          className="absolute top-1/2 right-2 -translate-y-1/2 z-20 rounded-full bg-black/30 hover:bg-black/50 text-white p-2 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Next collections"
        >
          <ChevronRight className="w-6 h-6" />
        </CarouselNext>

        <CarouselContent>
          {collections.map((collection) => (
            <CarouselItem
              key={collection.id}
              className={`pl-1 md:basis-1/2 lg:basis-1/3`}
            >
              <div className="min-h-[320px] animate-fade-in flex gap-6">
                <CollectionCard collection={collection} />
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
          View All Collections
        </Button>
      </div>
    </section>
  );
}
