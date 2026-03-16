import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    BadgeChip,
    ListingTypeChip
} from "@/components/shared/ListingPrimitives";
import type { RecommendationItem } from "@/utils/recommendations";

interface RecommendationPanelProps {
    recommendations: RecommendationItem[];
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
    recommendations
}) => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState<Set<string | number>>(new Set());

    const toggleFavorite = (id: string | number) => {
        setFavorites(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleShare = (item: RecommendationItem) => {
        const url = window.location.origin + `/product/${item.id}`;
        if (navigator.share) {
            navigator.share({ title: item.title, text: item.description, url });
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
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="max-w-2xl mx-auto px-4 py-6"
            >
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-teal-50 dark:from-indigo-900/30 dark:to-teal-900/30 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            🎯 Picks for you
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Based on your preferences
                        </p>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {recommendations.length === 0 ? (
                            <div className="px-6 py-10 text-center">
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                    No direct matches found. Browse our
                                    collections!
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/collections")}
                                    className="mx-auto"
                                >
                                    Browse All Collections
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        ) : (
                            recommendations.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer group"
                                    onClick={() =>
                                        navigate(`/product/${item.id}`)
                                    }
                                >
                                    {/* Thumbnail */}
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={
                                                item.imageUrl ||
                                                "/images/placeholder.svg"
                                            }
                                            alt={item.title}
                                            className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
                                            loading="lazy"
                                        />
                                        {item.type && (
                                            <div className="absolute -bottom-1.5 -right-1.5">
                                                <ListingTypeChip
                                                    vendorType={
                                                        item.type === "service"
                                                            ? "service"
                                                            : "seller"
                                                    }
                                                    size="xs"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                                            {item.description}
                                        </p>
                                        {item.price && (
                                            <p
                                                className={`text-sm font-bold mt-1 ${
                                                    item.type === "service"
                                                        ? "text-teal-600 dark:text-teal-400"
                                                        : "text-indigo-600 dark:text-indigo-400"
                                                }`}
                                            >
                                                {item.price}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-1.5 items-center flex-shrink-0">
                                        <button
                                            aria-label={
                                                favorites.has(item.id)
                                                    ? "Unsave"
                                                    : "Save"
                                            }
                                            onClick={e => {
                                                e.stopPropagation();
                                                toggleFavorite(item.id);
                                            }}
                                            className="p-1.5 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20 transition"
                                        >
                                            <Heart
                                                className={`w-4 h-4 ${
                                                    favorites.has(item.id)
                                                        ? "fill-pink-500 text-pink-500"
                                                        : "text-gray-400"
                                                }`}
                                            />
                                        </button>
                                        <button
                                            aria-label="Share"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleShare(item);
                                            }}
                                            className="p-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
                                        >
                                            <Share2 className="w-4 h-4 text-gray-400 hover:text-indigo-500" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer CTA */}
                    {recommendations.length > 0 && (
                        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                onClick={() => navigate("/collections")}
                            >
                                See all listings
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </div>
            </motion.section>
        </AnimatePresence>
    );
};
