import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Share2,
  Star,
  Info,
  Users,
  Tag,
  Layers,
  ShoppingBag,
  Calendar,
} from "lucide-react";
import type { Collection } from "@/types/collection";

const badgeColors: Record<string, string> = {
  Hot: "bg-red-500 text-white",
  Trending: "bg-emerald-500 text-white",
  Featured: "bg-indigo-600 text-white",
  New: "bg-pink-500 text-white",
};

export const CollectionCard: React.FC<{ collection: Collection }> = ({
  collection,
}) => {
  const [wishlisted, setWishlisted] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const navigate = useNavigate();

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: collection.title,
        text: collection.description,
        url: window.location.origin + `/collections/${collection.slug}`,
      });
    } else {
      alert(
        "Share this collection: " +
          window.location.origin +
          `/collections/${collection.slug}`
      );
    }
  }

  function handleFlip(e: React.MouseEvent) {
    e.stopPropagation();
    setFlipped((f) => !f);
  }

  const percent =
    collection.itemCount !== undefined
      ? Math.min(100, Math.round((collection.itemCount / 100) * 100))
      : 100;

  return (
    <div className="relative w-full h-[500px] [perspective:1200px]">
      <div
        className={`
          transition-transform duration-700 [transform-style:preserve-3d] w-full h-full
          ${flipped ? "[transform:rotateY(180deg)]" : ""}
        `}
      >
        {/* Front */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-white/90 to-indigo-50 dark:from-gray-900/90 dark:to-indigo-900 rounded-xl shadow-xl overflow-hidden flex flex-col pb-4 group">
          <div className="relative">
            <img
              src={collection.imageUrl}
              alt={collection.title}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            {collection.badge && (
              <span
                className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow ${badgeColors[collection.badge]}`}
              >
                {collection.badge}
              </span>
            )}
            <button
              className="absolute bottom-3 right-3 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow hover:bg-pink-100 dark:hover:bg-pink-900 transition"
              aria-label="Add to wishlist"
              onClick={(e) => {
                e.preventDefault();
                setWishlisted((w) => !w);
              }}
            >
              <Heart
                className={`w-5 h-5 transition-all duration-300 ${
                  wishlisted
                    ? "fill-pink-500 text-pink-500 scale-125"
                    : "text-gray-400"
                }`}
              />
            </button>
            <button
              className="absolute bottom-3 left-3 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
              aria-label="Share"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5 text-indigo-500" />
            </button>
            <button
              className="absolute top-3 right-3 bg-white/80 dark:bg-gray-800/80 rounded-full p-1.5 shadow hover:bg-indigo-100 dark:hover:bg-indigo-900 transition z-10"
              aria-label="Show more info"
              onClick={handleFlip}
              type="button"
            >
              <Info className="w-5 h-5 text-indigo-500" />
            </button>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {collection.title}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {collection.description}
              </p>
            </div>
            {collection.tags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {collection.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {collection.itemCount !== undefined && (
              <div className="mt-4 flex items-center gap-2">
                {collection.type === "goods" ? (
                  <ShoppingBag className="w-5 h-5 text-indigo-500" />
                ) : (
                  <Calendar className="w-5 h-5 text-emerald-500" />
                )}
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                  {collection.itemCount}{" "}
                  {collection.type === "goods" ? "items" : "bookings"}
                </span>
                <div className="flex-1 ml-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500 bg-indigo-500"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            )}
            {(collection.curator || collection.priceFrom) && (
              <div className="flex items-center justify-between mt-4">
                {collection.curator ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={collection.curator.avatar}
                      alt={collection.curator.name}
                      className="w-8 h-8 rounded-full border-2 border-indigo-300 dark:border-indigo-700"
                    />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {collection.curator.name}
                    </span>
                    {collection.curator.rating && (
                      <span className="flex items-center gap-1 text-yellow-500 ml-2">
                        <Star className="w-4 h-4" /> {collection.curator.rating}
                      </span>
                    )}
                  </div>
                ) : (
                  <span />
                )}
                {collection.priceFrom && (
                  <div
                    className="relative"
                    onMouseEnter={() => setShowPrice(true)}
                    onMouseLeave={() => setShowPrice(false)}
                    onTouchStart={() => setShowPrice((p) => !p)}
                  >
                    <span
                      className={`
                      font-bold text-indigo-600 dark:text-indigo-300 transition-all duration-500
                      ${
                        showPrice
                          ? "opacity-100 scale-110 animate-bounce"
                          : "opacity-60 scale-90"
                      }
                    `}
                    >
                      {collection.priceFrom}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="px-4 pb-4 mt-auto">
            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl mt-2 transition"
              onClick={() => navigate(`/collections/${collection.slug}`)}
            >
              View Collection
            </button>
          </div>
        </div>
        {/* Backside (more info) */}
        <div className="
          absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]
          bg-indigo-700 dark:bg-indigo-900 text-white rounded-xl shadow-xl flex flex-col p-6 items-center justify-between
        ">
          <div className="w-full">
            <h3 className="text-xl font-bold mb-2">{collection.title}</h3>
            <p className="mb-4 text-center text-white/90">
              {collection.longDescription || collection.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {collection.tags?.map((tag) => (
                <span
                  key={tag}
                  className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
            {collection.itemCount !== undefined && (
              <div className="flex items-center justify-center gap-2 mb-3">
                {collection.type === "goods" ? (
                  <ShoppingBag className="w-5 h-5" />
                ) : (
                  <Calendar className="w-5 h-5" />
                )}
                <span className="text-sm">
                  {collection.itemCount}{" "}
                  {collection.type === "goods" ? "items" : "bookings"} in this
                  collection
                </span>
              </div>
            )}
            {collection.curator && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <Users className="w-4 h-4" />
                <span className="text-sm">{collection.curator.name}</span>
                {collection.curator.rating && (
                  <span className="flex items-center gap-1 text-yellow-300">
                    <Star className="w-4 h-4" /> {collection.curator.rating}
                  </span>
                )}
              </div>
            )}
            {collection.exampleService && (
              <div className="mt-4 bg-white/10 rounded-lg p-3 text-center">
                <div className="text-xs uppercase font-bold text-white/70 mb-1">
                  {collection.type === "goods"
                    ? "Featured Product"
                    : "Featured Service"}
                </div>
                <div className="font-semibold">
                  {collection.exampleService.title}
                </div>
                <div className="text-sm text-white/80">
                  {collection.exampleService.description}
                </div>
                <div className="mt-1 font-bold text-indigo-200">
                  {collection.exampleService.price}
                </div>
              </div>
            )}
          </div>
          <button
            className="mt-6 w-full bg-white/10 text-white border-white border rounded py-2"
            onClick={handleFlip}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
