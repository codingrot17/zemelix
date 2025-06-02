import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
 // CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Flame,
  Star,
  Clock,
  Share2,
  ShoppingBag,
  Calendar,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// TypeScript types
interface Seller {
  name: string;
  avatar: string;
  rating: number;
}

interface FeaturedItem {
  id: number | string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  seller: Seller;
  badge?: "Hot" | "Trending" | "New";
  flashDealEnds: number | null;
  available: number;
  total: number;
  type: "goods" | "booking";
}

// Demo data
const featuredItems: FeaturedItem[] = [
  {
    id: 1,
    title: "Handmade Wooden Chair",
    description: "Comfortable and stylish wooden chair for your living room.",
    price: "$120",
    imageUrl: "/images/placeholder.svg",
    seller: { name: "Jane Doe", avatar: "/images/placeholder.svg", rating: 4.9 },
    badge: "Hot",
    flashDealEnds: Date.now() + 1000 * 60 * 60 * 2,
    available: 3,
    total: 20,
    type: "goods",
  },
  {
    id: 2,
    title: "Web Design Service",
    description: "Professional website design tailored for your business.",
    price: "$500",
    imageUrl: "/images/placeholder.svg",
    seller: { name: "CodeSmith", avatar: "/images/placeholder.svg", rating: 5.0 },
    badge: "Trending",
    flashDealEnds: null,
    available: 7,
    total: 10,
    type: "booking",
  },
  {
    id: 3,
    title: "Vintage Camera",
    description: "Classic vintage camera in excellent condition.",
    price: "$250",
    imageUrl: "/images/placeholder.svg",
    seller: { name: "RetroGuy", avatar: "/images/placeholder.svg", rating: 4.7 },
    badge: "New",
    flashDealEnds: Date.now() + 1000 * 60 * 30,
    available: 1,
    total: 10,
    type: "goods",
  },
];

// Countdown hook
function useCountdown(endTime: number | null) {
  const [timeLeft, setTimeLeft] = useState(endTime ? endTime - Date.now() : 0);
  useEffect(() => {
    if (!endTime) return;
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, endTime - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);
  if (!endTime || timeLeft <= 0) return null;
  const h = Math.floor(timeLeft / 3600000);
  const m = Math.floor((timeLeft % 3600000) / 60000);
  const s = Math.floor((timeLeft % 60000) / 1000);
  return `${h > 0 ? h + "h " : ""}${m}m ${s}s`;
}

function FeaturedCard({ item }: { item: FeaturedItem }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const countdown = useCountdown(item.flashDealEnds);

  // Badge color logic
  const badgeColors: Record<"Hot" | "Trending" | "New", string> = {
    Hot: "bg-red-500 text-white",
    Trending: "bg-emerald-500 text-white",
    New: "bg-indigo-500 text-white",
  };

  // Stock/progress
  const percent = Math.round((item.available / item.total) * 100);
  const lowStock = item.available <= 2;

  // Animation classes
  const almostGoneAnim = lowStock ? "animate-bounce animate-infinite" : "";
  const bookNowPulse =
    item.type === "booking" && item.available > 0
      ? "animate-pulse animate-infinite"
      : "";

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href,
      });
    } else {
      alert("Share this item: " + window.location.href);
    }
  }

  function handleFlip(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setFlipped((f) => !f);
  }

  return (
    <div className="relative w-full h-[420px] [perspective:1200px]">
      <div
        className={`
          transition-transform duration-700 [transform-style:preserve-3d] w-full h-full
          ${flipped ? "[transform:rotateY(180deg)]" : ""}
        `}
      >
        {/* Front */}
        <div className="
          absolute w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-white/90 to-indigo-50 dark:from-gray-900/90 dark:to-indigo-900 rounded-xl shadow-xl overflow-hidden flex flex-col animate-fade-in
        ">
          <div className="relative">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-48 object-cover animate-fade-in"
            />
            {/* Badge */}
            {item.badge && (
              <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow ${badgeColors[item.badge]} animate-fade-in`}>
                {item.badge === "Hot" && <Flame className="inline w-4 h-4 mr-1" />}
                {item.badge}
              </span>
            )}
            {/* Flash deal countdown */}
            {countdown && (
              <span className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 text-white px-2 py-0.5 rounded-full text-xs animate-fade-in">
                <Clock className="w-4 h-4" /> {countdown}
              </span>
            )}
            {/* Wishlist */}
            <button
              className="absolute bottom-3 right-3 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow hover:bg-pink-100 dark:hover:bg-pink-900 transition"
              aria-label="Add to wishlist"
              onClick={(e) => {
                e.stopPropagation();
                setWishlisted((w) => !w);
              }}
            >
              <Heart className={`w-5 h-5 transition-all duration-300 ${wishlisted ? "fill-pink-500 text-pink-500 scale-125" : "text-gray-400"}`} />
            </button>
            {/* Share */}
            <button
              className="absolute bottom-3 left-3 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
              aria-label="Share"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
            >
              <Share2 className="w-5 h-5 text-indigo-500" />
            </button>
            {/* Flip button (Info) always visible */}
            <button
              className="absolute top-3 right-1 bg-white/80 dark:bg-gray-800/80 rounded-full p-1.5 shadow hover:bg-indigo-100 dark:hover:bg-indigo-900 transition z-10"
              aria-label="Show more info"
              onClick={handleFlip}
            >
              <Info className="w-5 h-5 text-indigo-500" />
            </button>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white animate-fade-in">{item.title}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 animate-fade-in">{item.description}</p>
            </div>
            {/* Stock/booking info */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {item.type === "goods" ? (
                  <ShoppingBag className="w-4 h-4 text-indigo-500" />
                ) : (
                  <Calendar className="w-4 h-4 text-emerald-500" />
                )}
                <span className={`text-xs font-semibold ${lowStock ? "text-red-600" : "text-indigo-600 dark:text-indigo-300"}`}>
                  {item.available} {item.type === "goods" ? "in stock" : "bookings"} left
                </span>
                {lowStock && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 ${almostGoneAnim}`}>
                    Almost Gone!
                  </span>
                )}
                {bookNowPulse && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 animate-pulse">
                    Book Now
                  </span>
                )}
              </div>
              {/* Progress bar */}
              <div className="flex-1 ml-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${lowStock ? "bg-red-500" : "bg-indigo-500"}`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
            {/* Seller & price */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <img
                  src={item.seller.avatar}
                  alt={item.seller.name}
                  className="w-8 h-8 rounded-full border-2 border-indigo-300 dark:border-indigo-700"
                />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.seller.name}</span>
                <span className="flex items-center gap-1 text-yellow-500 ml-2">
                  <Star className="w-4 h-4" /> {item.seller.rating}
                </span>
              </div>
              {/* Animated price reveal */}
              <div
                className="relative"
                onMouseEnter={() => setShowPrice(true)}
                onMouseLeave={() => setShowPrice(false)}
                onTouchStart={() => setShowPrice((p) => !p)}
              >
                <span className={`
                  font-bold text-indigo-600 dark:text-indigo-300 transition-all duration-500
                  ${showPrice ? "opacity-100 scale-110 animate-bounce" : "opacity-60 scale-90"}
                `}>
                  {item.price}
                </span>
              </div>
            </div>
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => alert(`View details for ${item.title}`)}
            >
              View Details
            </Button>
          </div>
        </div>
        {/* Back */}
        <div className="
          absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]
          bg-indigo-600 dark:bg-indigo-900 text-white rounded-xl shadow-xl flex flex-col p-6 items-center justify-center
        ">
          <h3 className="text-xl font-bold mb-2 animate-fade-in">{item.title}</h3>
          <p className="mb-4 text-center animate-fade-in">{item.description}</p>
          <Button
            variant="outline"
            className="w-full border-white text-primary hover:bg-white/10 animate-fade-in"
            onClick={() => alert(`Quick action for ${item.title}`)}
          >
            Quick Book / Buy Now
          </Button>
          <Button
            size="sm"
            className="mt-4 w-full bg-white/10 text-white border-white"
            onClick={handleFlip}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FeaturedListingsCarousel() {
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

  // Update selected index and scroll snaps on carousel init and slide change
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

  // Scroll to a specific slide
  function scrollTo(index: number) {
    if (!carouselApi) return;
    carouselApi.scrollTo(index);
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
        <CarouselPrevious className="
          absolute top-1/2 left-2 -translate-y-1/2 z-20 rounded-full bg-black/30 hover:bg-black/50 text-white p-2 cursor-pointer transition
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        ">
          <ChevronLeft className="w-6 h-6" />
        </CarouselPrevious>

        {/* Overlay Next Button */}
        <CarouselNext className="
          absolute top-1/2 right-2 -translate-y-1/2 z-20 rounded-full bg-black/30 hover:bg-black/50 text-white p-2 cursor-pointer transition
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        ">
          <ChevronRight className="w-6 h-6" />
        </CarouselNext>

        <CarouselContent>
          {featuredItems.map((item) => (
            <CarouselItem
              key={item.id}
              className="pl-1 md:basis-1/2 lg:basis-1/2"
            >
              <div className="min-h-[420px] animate-fade-in">
                <FeaturedCard item={item} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

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

      {/* View More Button */}
      <div className="flex justify-center mt-8">
        <Button
          className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-400 dark:hover:bg-indigo-500 px-8 py-3 text-base font-semibold rounded-full shadow-lg transition"
          onClick={() => navigate("/listings")}
        >
          View More Products & Services
        </Button>
      </div>
    </section>
  );
}
