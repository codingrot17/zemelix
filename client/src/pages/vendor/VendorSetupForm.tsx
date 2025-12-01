// src/pages/vendor/VendorSetupForm.tsx
import React, { useState } from "react";
import { databases, storage, ID } from "@/lib/appwrite";
import { useAuth } from "@/contexts/AuthContext";

export default function VendorSetupForm() {
  const { user, reloadUserProfile } = useAuth();

  const [form, setForm] = useState({
    businessName: "",
    businessDescription: "",
    slogan: "",
    vendorType: "",
    businessCategory: "",
    phoneNumber: "",
    country: user?.country || "Nigeria",
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: string) => (e: any) => {
    setForm({ ...form, [field]: e.target.value });
  };

  async function upload(file: File | null): Promise<string | null> {
    if (!file) return null;

    const bucket = import.meta.env.VITE_APPWRITE_BUCKET;
    const res = await storage.createFile(bucket, ID.unique(), file);
    return res.$id;
  }

  async function handleSubmit() {
    try {
      setBusy(true);
      setError(null);

      if (!user) throw new Error("User not loaded");

      // 🔥 Upload files
      const logoId = await upload(logo);
      const coverId = await upload(coverImage);

      // 🔥 Prepare final vendor payload
      const payload = {
        ...form,
        logo: logoId,
        coverImage: coverId,
        vendorType: form.vendorType || null,
        businessCategory: form.businessCategory || null,
        phoneNumber: form.phoneNumber || null,
        currency: "NGN",

        // vendor upgrade flags
        vendorStatus: "pending_review",
        role: "vendor",
        accountStatus: "active",
        storeStatus: "closed",
      };

      await databases.updateDocument(
        import.meta.env.VITE_APPWRITE_DB,
        import.meta.env.VITE_APPWRITE_USER_COLLECTION,
        user.$id,
        payload
      );

      await reloadUserProfile?.();

      alert("Vendor setup completed successfully!");
    } catch (err: any) {
      console.log(err);
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-xl font-semibold mb-4">Vendor Setup</h1>

      <div className="space-y-4">
        <input
          placeholder="Business Name"
          value={form.businessName}
          onChange={update("businessName")}
          className="border p-2 w-full rounded"
        />

        <textarea
          placeholder="Business Description"
          value={form.businessDescription}
          onChange={update("businessDescription")}
          className="border p-2 w-full rounded"
        />

        <input
          placeholder="Slogan"
          value={form.slogan}
          onChange={update("slogan")}
          className="border p-2 w-full rounded"
        />

        <input
          placeholder="Vendor Type (Individual / Company)"
          value={form.vendorType}
          onChange={update("vendorType")}
          className="border p-2 w-full rounded"
        />

        <input
          placeholder="Business Category (e.g. Fashion, Tech)"
          value={form.businessCategory}
          onChange={update("businessCategory")}
          className="border p-2 w-full rounded"
        />

        <input
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChange={update("phoneNumber")}
          className="border p-2 w-full rounded"
        />

        {/* FILE UPLOADS */}
        <div>
          <label className="block text-sm font-medium">Logo</label>
          <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          disabled={busy}
          onClick={handleSubmit}
          className="w-full bg-black text-white p-3 rounded-md mt-4"
        >
          {busy ? "Saving..." : "Submit Vendor Setup"}
        </button>
      </div>
    </div>
  );
}
