import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVendorWizard } from "@/hooks/useVendorWizard";
import { vendorTypes } from "@/config/vendorCategories";
import { isValidUrl } from "@/lib/validators"; // optional helper - implement small helper if missing

export default function BusinessInfoStep() {
    const navigate = useNavigate();
    const { saveData, loading, step } = useVendorWizard();

    // load initial values from user via AuthContext if you want; for MVP we keep local
    const [form, setForm] = useState({
        businessName: "",
        businessDescription: "",
        vendorType: "", // should be one of vendorTypes.id
        country: "",
        socialLinks: { facebook: "", instagram: "", twitter: "", website: "" }
    });

    // helper: ensure we only send allowed vendorType
    const allowedIds = vendorTypes.map(v => v.id);
    const normalizeVendorType = (v: string) =>
        allowedIds.includes(v) ? v : "other";

    const updateField = (key: string, val: any) =>
        setForm(prev => ({ ...prev, [key]: val }));

    const updateSocial = (key: string, val: string) =>
        setForm(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [key]: val }
        }));

    useEffect(() => {
        // Optionally prefill from global user object by reading AuthContext (not shown here)
    }, []);

    const validate = () => {
        if (!form.businessName.trim()) return "Business name is required";
        if (!form.vendorType) return "Select vendor type";
        if (!form.country.trim()) return "Country is required";
        if (form.socialLinks.website && !isValidUrl(form.socialLinks.website))
            return "Website must be a valid URL";
        return null;
    };

    const handleNext = async () => {
        const err = validate();
        if (err) return alert(err);

        // Normalize vendorType to allowed enum before sending to Appwrite
        const payload = {
            businessName: form.businessName.trim(),
            businessDescription: form.businessDescription?.trim() || null,
            vendorType: normalizeVendorType(form.vendorType),
            country: form.country.trim(),
            socialLinks: JSON.stringify(form.socialLinks) // store JSON string in USER.socialLinks
        };

        await saveData(payload, 1);
        navigate("/vendor/upgrade/branding");
    };

    return (
        <div className="space-y-4 p-3">
            <h2 className="text-lg font-semibold">Business Information</h2>

            <input
                className="w-full border p-3 rounded-lg"
                placeholder="Business Name *"
                value={form.businessName}
                onChange={e => updateField("businessName", e.target.value)}
            />

            <textarea
                className="w-full border p-3 rounded-lg"
                placeholder="Business Description"
                rows={4}
                value={form.businessDescription}
                onChange={e =>
                    updateField("businessDescription", e.target.value)
                }
            />

            <select
                className="w-full border p-3 rounded-lg"
                value={form.vendorType}
                onChange={e => updateField("vendorType", e.target.value)}
            >
                <option value="">Select vendor type *</option>
                {vendorTypes.map(v => (
                    <option key={v.id} value={v.id}>
                        {v.label}
                    </option>
                ))}
            </select>

            <input
                className="w-full border p-3 rounded-lg"
                placeholder="Country *"
                value={form.country}
                onChange={e => updateField("country", e.target.value)}
            />

            <div className="space-y-2">
                <h3 className="font-medium text-gray-700">Social Links</h3>
                {["facebook", "instagram", "twitter", "website"].map(k => (
                    <input
                        key={k}
                        className="w-full border p-3 rounded-lg"
                        placeholder={k.charAt(0).toUpperCase() + k.slice(1)}
                        value={(form.socialLinks as any)[k]}
                        onChange={e => updateSocial(k, e.target.value)}
                    />
                ))}
            </div>

            <button
                onClick={handleNext}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
            >
                {loading ? "Saving..." : "Continue"}
            </button>
        </div>
    );
}
