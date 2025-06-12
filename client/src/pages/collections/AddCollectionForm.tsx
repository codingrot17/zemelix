import React, { useState } from "react";
import { API_BASE } from "@/api";
import type { Collection } from "@/types";

const initialState = {
  title: "",
  description: "",
  longDescription: "",
  imageUrl: "",
  slug: "",
  badge: undefined as "Featured" | "Popular" | "New" | undefined,
  tags: "",
  curatorName: "",
  curatorAvatar: "",
  curatorRating: "",
  itemCount: "",
  priceFrom: "",
  exampleServiceTitle: "",
  exampleServiceDescription: "",
  exampleServicePrice: "",
  type: "goods" as "goods" | "booking",
};

export function AddCollectionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Prepare tags array
    const tags = form.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    // Prepare curator object
    const curator =
      form.curatorName || form.curatorAvatar || form.curatorRating
        ? {
            name: form.curatorName,
            avatar: form.curatorAvatar,
            ...(form.curatorRating && { rating: Number(form.curatorRating) }),
          }
        : undefined;

    // Prepare exampleService object
    const exampleService =
      form.exampleServiceTitle || form.exampleServiceDescription || form.exampleServicePrice
        ? {
            title: form.exampleServiceTitle,
            description: form.exampleServiceDescription,
            price: form.exampleServicePrice,
          }
        : undefined;

    // Build collection object
    const collection: Omit<Collection, "_id"> = {
      title: form.title,
      description: form.description,
      longDescription: form.longDescription,
      imageUrl: form.imageUrl,
      slug: form.slug,
      badge: form.badge,
      tags,
      curator,
      itemCount: form.itemCount ? Number(form.itemCount) : undefined,
      priceFrom: form.priceFrom,
      exampleService,
      type: form.type,
    };

    try {
      const res = await fetch(`${API_BASE}/collections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collection),
      });
      if (!res.ok) throw new Error("Failed to add collection");
      setSuccess(true);
      setForm(initialState);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to add collection");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow rounded-lg p-8 space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Add New Collection</h2>

      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 rounded">Collection added!</div>}

      <div className="flex flex-col gap-2">
        <label className="font-semibold">Title</label>
        <input name="title" value={form.title} onChange={handleChange} required className="input" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Short Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} required className="input" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Long Description</label>
        <textarea name="longDescription" value={form.longDescription} onChange={handleChange} className="input" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Image URL</label>
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} required className="input" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Slug (unique, for URL)</label>
        <input name="slug" value={form.slug} onChange={handleChange} required className="input" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Badge</label>
        <select name="badge" value={form.badge || ""} onChange={handleChange} className="input">
          <option value="">None</option>
          <option value="Featured">Featured</option>
          <option value="Popular">Popular</option>
          <option value="New">New</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Tags (comma-separated)</label>
        <input name="tags" value={form.tags} onChange={handleChange} className="input" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Type</label>
        <select name="type" value={form.type} onChange={handleChange} className="input">
          <option value="goods">Goods (items)</option>
          <option value="booking">Booking (services)</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Item/Booking Count</label>
        <input type="number" name="itemCount" value={form.itemCount} onChange={handleChange} className="input" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Price From</label>
        <input name="priceFrom" value={form.priceFrom} onChange={handleChange} className="input" />
      </div>

      {/* Curator Fields */}
      <div className="flex flex-col gap-2 border-t pt-4">
        <label className="font-semibold">Curator Name</label>
        <input name="curatorName" value={form.curatorName} onChange={handleChange} className="input" />
        <label className="font-semibold">Curator Avatar URL</label>
        <input name="curatorAvatar" value={form.curatorAvatar} onChange={handleChange} className="input" />
        <label className="font-semibold">Curator Rating</label>
        <input type="number" step="0.1" name="curatorRating" value={form.curatorRating} onChange={handleChange} className="input" />
      </div>

      {/* Example Service/Product */}
      <div className="flex flex-col gap-2 border-t pt-4">
        <label className="font-semibold">Featured Service/Product Title</label>
        <input name="exampleServiceTitle" value={form.exampleServiceTitle} onChange={handleChange} className="input" />
        <label className="font-semibold">Featured Service/Product Description</label>
        <input name="exampleServiceDescription" value={form.exampleServiceDescription} onChange={handleChange} className="input" />
        <label className="font-semibold">Featured Service/Product Price</label>
        <input name="exampleServicePrice" value={form.exampleServicePrice} onChange={handleChange} className="input" />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl mt-2 transition"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Collection"}
      </button>
    </form>
  );
}

// Optionally add some basic styles for .input if you don't use Tailwind or similar:
