import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Collection } from "@/types";
import { Star, ShoppingBag, Calendar, Users, Tag } from "lucide-react";

export function SingleCollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/collections/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error("Collection not found");
        return res.json();
      })
      .then(data => {
        setCollection(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!collection) return null;

  return (
    <div className="max-w-3xl mx-auto my-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
      <button
        className="mb-4 text-indigo-600 hover:underline"
        onClick={() => navigate(-1)}
      >
        ← Back to Collections
      </button>
      <div className="flex flex-col md:flex-row gap-8">
        <img
          src={collection.imageUrl}
          alt={collection.title}
          className="w-full md:w-64 h-64 object-cover rounded-lg shadow"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{collection.title}</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">{collection.longDescription || collection.description}</p>
          {collection.tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {collection.tags.map(tag => (
                <span key={tag} className="bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 px-2 py-0.5 rounded-full text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 mb-4">
            {collection.type === "goods" ? (
              <ShoppingBag className="w-5 h-5 text-indigo-500" />
            ) : (
              <Calendar className="w-5 h-5 text-emerald-500" />
            )}
            <span className="text-sm text-indigo-700 dark:text-indigo-300">
              {collection.itemCount} {collection.type === "goods" ? "items" : "bookings"}
            </span>
            {collection.curator && (
              <>
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{collection.curator.name}</span>
                {collection.curator.rating && (
                  <span className="flex items-center gap-1 text-yellow-500 ml-2">
                    <Star className="w-4 h-4" /> {collection.curator.rating}
                  </span>
                )}
              </>
            )}
          </div>
          {collection.priceFrom && (
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-300 mb-2">
              {collection.priceFrom}
            </div>
          )}
          {collection.exampleService && (
            <div className="mt-4 bg-indigo-50 dark:bg-indigo-800 rounded-lg p-4">
              <div className="text-xs uppercase font-bold text-indigo-700 dark:text-indigo-200 mb-1">
                {collection.type === "goods" ? "Featured Product" : "Featured Service"}
              </div>
              <div className="font-semibold">{collection.exampleService.title}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{collection.exampleService.description}</div>
              <div className="mt-1 font-bold text-indigo-700 dark:text-indigo-200">{collection.exampleService.price}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
