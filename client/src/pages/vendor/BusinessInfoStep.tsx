import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BusinessInfoStep() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        businessName: "",
        vendorType: "",
        businessCategory: "",
        businessDescription: ""
    });

    function updateField(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    function handleNext() {
        // Save temporarily to localStorage for now
        localStorage.setItem("vendor-onboarding-info", JSON.stringify(form));
        navigate("/vendor/upgrade/branding");
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Business Information</h2>

            {/* business name */}
            <div>
                <label className="text-sm">Business Name</label>
                <input
                    value={form.businessName}
                    onChange={e => updateField("businessName", e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter your business name"
                />
            </div>

            {/* vendor type */}
            <div>
                <label className="text-sm">Vendor Type</label>
                <select
                    value={form.vendorType}
                    onChange={e => updateField("vendorType", e.target.value)}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Select vendor type</option>
                    <option value="product">Product Seller</option>
                    <option value="service">Service Provider</option>
                    <option value="product-service">Both</option>
                </select>
            </div>

            {/* category */}
            <div>
                <label className="text-sm">Business Category</label>
                <input
                    value={form.businessCategory}
                    onChange={e =>
                        updateField("businessCategory", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Fashion, Tech, Food, Cleaning, etc."
                />
            </div>

            {/* description */}
            <div>
                <label className="text-sm">Short Description</label>
                <textarea
                    value={form.businessDescription}
                    onChange={e =>
                        updateField("businessDescription", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                    rows={4}
                    placeholder="Describe your business..."
                />
            </div>

            <button
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
                onClick={handleNext}
            >
                Continue
            </button>
        </div>
    );
}
