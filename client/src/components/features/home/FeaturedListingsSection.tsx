import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CollectionCard } from "@/components/features/collection/CollectionCard";
import type { Collection } from "@/types";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

import { ChevronLeft, ChevronRight } from "lucide-react"; // Imported icons

export function FeaturedListingsCarousel() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const navigate = useNavigate();

  // collections data fetch
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/collections")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch collections");
        return res.json();
      })
      .then((data) => {
        setCollections(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
        setLoading(false);
      });
  }, []);

  // Update selected index and scroll snaps on carousel init and slide change
  const onSelect = useCallback(() => {
    if (!carouselApi) return;
    setSelectedIndex(carouselApi.selectedScrollSnap());
  }, [carouselApi, setSelectedIndex]);

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

  // Scroll to a specific slide
  function scrollTo(index: number) {
    if (!carouselApi) return;
    carouselApi.scrollTo(index);
  }

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
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-8 relative">
      <h2 className="text-2xl font-semibold mb-6 text-primary dark:text-primary-light text-center animate-fade-in">
        Featured Listings
      </h2>

      <Carousel
        setApi={setCarouselApi}
        opts={{
          align: "start",
          loop: false,
        }}
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
          {collections.map((item) => (
            <CarouselItem
              key={item.id}
              className="pl-5 md:basis-1/2 lg:basis-1/2"
            >
              <div className="min-h-[420px] animate-fade-in flex gap-10">
                <CollectionCard collection={item} />
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