import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { RecommendationItem } from "@/utils/recommendations";

interface RecommendationPanelProps {
  recommendations: RecommendationItem[];
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendations,
}) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Set<string | number>>(new Set());

  const toggleFavorite = (id: string | number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleShare = (item: RecommendationItem) => {
    const url = window.location.origin + `/listings/${item.id}`;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <AnimatePresence>
      <motion.section
        key="recommendations"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl mx-auto px-4 py-6"
      >
        <div className="bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-lg shadow p-6 text-center font-semibold">
          🎯 Here are some picks for you:
          <div className="mt-4 flex flex-col gap-4">
            {recommendations.length === 0 ? (
              <>
                <div className="text-gray-600 dark:text-gray-300 mb-4">
                  Sorry, no direct matches found. Try browsing our collections below!
                </div>
                <Button
                  variant="outline"
                  className="mx-auto"
                  onClick={() => navigate("/collections")}
                >
                  Browse All Collections
                </Button>
              </>
            ) : (
              recommendations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col sm:flex-row items-center gap-4 relative group"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                    loading="lazy"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-bold text-lg text-primary dark:text-primary-light">
                      {item.title}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {item.description}
                    </div>
                    {item.price && (
                      <div className="font-bold text-indigo-600 dark:text-indigo-300">
                        {item.price}
                      </div>
                    )}
                  </div>
                  <div className="flex md:flex-col gap-2  sm:gap-1 items-end sm:items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={favorites.has(item.id) ? "Unsave" : "Save"}
                      onClick={() => toggleFavorite(item.id)}
                      className="transition"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(item.id)
                            ? "fill-pink-500 text-pink-500"
                            : "text-gray-400"
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Share"
                      onClick={() => handleShare(item)}
                    >
                      <Share2 className="w-5 h-5 text-indigo-500" />
                    </Button>
                    <Button
                      variant="secondary"
                      className="mt-2 sm:mt-0"
                      onClick={() => navigate(`/listings/${item.id}`)}
                    >
                      See Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
};
