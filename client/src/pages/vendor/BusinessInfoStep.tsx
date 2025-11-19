import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVendorWizard } from "@/hooks/useVendorWizard";

export default function BusinessInfoStep() {
    const navigate = useNavigate();
    const { saveData, loading, step } = useVendorWizard();

    const [form, setForm] = useState({
        businessName: "",
        businessDescription: "",
        vendorType: "",
        country: "",
        socialLinks: {
            facebook: "",
            instagram: "",
            twitter: "",
            website: ""
        }
    });

    const updateField = (key: string, value: any) => {
        setForm(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const updateSocial = (key: string, value: string) => {
        setForm(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [key]: value }
        }));
    };

    const handleNext = async () => {
        // Required validation
        if (!form.businessName.trim()) return alert("Business name required");
        if (!form.vendorType.trim()) return alert("Select vendor type");
        if (!form.country.trim()) return alert("Select your country");

        await saveData(form, 1); // move to step 1 → Branding
        navigate("/vendor/upgrade/branding");
    };

    return (
        <div className="space-y-4">
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
                <option value="">Select Vendor Type *</option>
                <option value="fashion">Fashion</option>
                <option value="tech">Tech</option>
                <option value="beauty">Beauty</option>
                <option value="services">Services</option>
            </select>

            <input
                className="w-full border p-3 rounded-lg"
                placeholder="Country *"
                value={form.country}
                onChange={e => updateField("country", e.target.value)}
            />

            <div className="space-y-2">
                <h3 className="font-medium text-gray-700">Social Links</h3>

                {["facebook", "instagram", "twitter", "website"].map(key => (
                    <input
                        key={key}
                        className="w-full border p-3 rounded-lg"
                        placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                        value={(form.socialLinks as any)[key]}
                        onChange={e => updateSocial(key, e.target.value)}
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
