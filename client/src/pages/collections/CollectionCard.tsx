import React from "react";
import { Link } from "react-router-dom";
import type { Collection } from "@/types";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const badgeColors: Record<string, string> = {
    Featured: "bg-indigo-600 text-white",
    Popular: "bg-emerald-500 text-white",
    New: "bg-pink-500 text-white",
  };

  return (
    <Link
      to={`/collections/${collection.slug}`}
      className="block rounded-xl overflow-hidden shadow hover:shadow-lg bg-white dark:bg-gray-900 transition relative"
    >
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
      <div className="p-4">
        <h3 className="font-bold text-lg text-primary dark:text-primary-light">
          {collection.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
          {collection.description}
        </p>
      </div>
    </Link>
  );
}
