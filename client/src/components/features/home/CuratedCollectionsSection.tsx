import React, { useState, useEffect, useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp } from "lucide-react";

// Example data
const curatedCollections = [
  {
    title: "Top-Rated Web Developers",
    items: [
      {
        name: "Jane Dev",
        desc: "Full-stack developer with 5-star reviews.",
        avatar: "/images/placeholder.svg",
        badge: "Top Rated",
        icon: <Star className="w-4 h-4 text-yellow-500" />,
      },
      {
        name: "CodeSmith",
        desc: "Affordable web solutions.",
        avatar: "/images/placeholder.svg",
        badge: "Trending",
        icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
      },
    ],
  },
  {
    title: "Trending Hairdressers",
    items: [
      {
        name: "StylePro",
        desc: "Modern cuts and color.",
        avatar: "/images/placeholder.svg",
        badge: "Trending",
        icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
      },
      {
        name: "HairGenius",
        desc: "Braids, weaves, and more.",
        avatar: "/images/placeholder.svg",
        badge: "Top Rated",
        icon: <Star className="w-4 h-4 text-yellow-500" />,
      },
    ],
  },
  // Add more collections as needed
];

export function CuratedCollectionsCarousel() {
  const [current, setCurrent] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);
  const autoPlayRef = useRef();

  // Responsive: 1 card on mobile, 2 on md+
  useEffect(() => {
    function handleResize() {
      setCardsPerView(window.innerWidth < 768 ? 1 : 2);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-play logic
  useEffect(() => {
    autoPlayRef.current = next;
  });
  useEffect(() => {
    function play() {
      autoPlayRef.current();
    }
    const interval = setInterval(play, 4000); // 4 seconds per slide
    return () => clearInterval(interval);
  }, [current, cardsPerView]);

  // Carousel navigation
  function prev() {
    setCurrent((prev) => Math.max(prev - cardsPerView, 0));
  }
  function next() {
    setCurrent((prev) =>
      prev + cardsPerView >= curatedCollections.length
        ? 0
        : prev + cardsPerView
    );
  }

  // Calculate visible collections
  const visible = curatedCollections.slice(current, current + cardsPerView);

  // Dot indicators logic
  const totalDots = Math.ceil(curatedCollections.length / cardsPerView);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-8">
      <h2 className="text-2xl font-semibold mb-6 text-primary dark:text-primary-light text-center">
        Curated Collections
      </h2>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <CarouselPrevious onClick={prev} />
          <CarouselNext onClick={next} />
        </div>
        <CarouselContent>
          {curatedCollections.map((col, idx) => (
            <CarouselItem
              key={col.title}
              className="pl-1 md:basis-1/2 lg:basis-1/2"
              style={{
                display:
                  idx >= current && idx < current + cardsPerView
                    ? "block"
                    : "none",
              }}
            >
              <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-6 backdrop-blur-md border border-gray-100 dark:border-gray-800 flex flex-col h-full transition-transform hover:-translate-y-1 hover:shadow-2xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                  {col.title}
                </h3>
                <ul className="flex flex-col gap-4 flex-1">
                  {col.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-center gap-4 bg-muted dark:bg-muted-dark rounded-lg px-4 py-3 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                    >
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-700 object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base text-foreground dark:text-foreground-light">{item.name}</span>
                          {item.icon}
                          {item.badge && (
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                              item.badge === "Top Rated"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                {/* Centered View More Button on mobile, right on desktop */}
                <div className="mt-4 flex justify-center md:justify-end">
                  <Button
                    className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-400 dark:hover:bg-indigo-500 w-full md:w-auto p-2"
                    size="md"
                  >
                    View More
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalDots }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx * cardsPerView)}
              className={`w-3 h-3 rounded-full transition-colors ${
                current / cardsPerView === idx
                  ? "bg-indigo-600"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </section>
  );
}
