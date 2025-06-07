import React, { useState, useMemo } from "react";
import { CollectionCard } from "./CollectionCard";
import { collections as allCollections } from "./collectionsData";
import type { Collection } from "@/types";

// Utility to extract all unique tags from collections
function getAllTags(collections: Collection[]) {
  const tags = new Set<string>();
  collections.forEach(col => col.tags?.forEach(tag => tags.add(tag)));
  return Array.from(tags);
}

export function CollectionsPage() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Filtering logic
  const filteredCollections = useMemo(() => {
    return allCollections.filter(col => {
      const matchesSearch =
        col.title.toLowerCase().includes(search.toLowerCase()) ||
        col.description.toLowerCase().includes(search.toLowerCase());
      const matchesTag = selectedTag ? col.tags?.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [search, selectedTag]);

  const tags = useMemo(() => getAllTags(allCollections), []);

  // Featured collection (first with badge or just the first)
  const featured =
    allCollections.find(col => col.badge === "Featured") || allCollections[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-10 shadow-lg bg-gradient-to-br from-indigo-500/80 to-indigo-700/90 text-white">
        <img
          src={featured.imageUrl}
          alt={featured.title}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          loading="lazy"
        />
        <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">{featured.title}</h1>
            <p className="text-lg md:text-xl mb-4 md:mb-0 drop-shadow-lg">{featured.description}</p>
            {featured.tags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {featured.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {featured.badge && (
            <span className="px-5 py-2 rounded-full bg-white/90 text-indigo-700 font-bold text-base shadow-lg">
              {featured.badge}
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          className={`px-4 py-1.5 rounded-full font-medium text-sm transition ${
            !selectedTag
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          }`}
          onClick={() => setSelectedTag(null)}
        >
          All
        </button>
        {tags.map(tag => (
          <button
            key={tag}
            className={`px-4 py-1.5 rounded-full font-medium text-sm transition ${
              selectedTag === tag
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            }`}
            onClick={() => setSelectedTag(tag)}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex justify-center mb-8">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search collections..."
          className="w-full max-w-md px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Grid of collection cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCollections.length > 0 ? (
          filteredCollections.map(col => <CollectionCard key={col.id} collection={col} />)
        ) : (
          <div className="col-span-full text-center text-gray-400">
            No collections found.
          </div>
        )}
      </div>
    </div>
  );
}
