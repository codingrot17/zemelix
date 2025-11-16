import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BrandingStep() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        slogan: "",
        logoFile: null,
        coverFile: null,
        logoPreview: "",
        coverPreview: ""
    });

    function handleFileChange(field, file) {
        const preview = file ? URL.createObjectURL(file) : "";
        setForm(prev => ({
            ...prev,
            [field]: file,
            [`${field}Preview`]: preview
        }));
    }

    function handleNext() {
        // Save temporary data
        const temp = {
            slogan: form.slogan,
            logo: form.logoFile ? "selected" : null,
            cover: form.coverFile ? "selected" : null
        };

        localStorage.setItem(
            "vendor-onboarding-branding",
            JSON.stringify(temp)
        );
        navigate("/vendor/upgrade/review");
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Branding</h2>

            <div>
                <label className="text-sm">Slogan</label>
                <input
                    value={form.slogan}
                    onChange={e => setForm({ ...form, slogan: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="Your business slogan"
                />
            </div>

            {/* logo */}
            <div>
                <label className="text-sm">Logo</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={e =>
                        handleFileChange("logoFile", e.target.files[0])
                    }
                />

                {form.logoPreview && (
                    <img
                        src={form.logoPreview}
                        className="h-20 w-20 mt-2 rounded object-cover"
                    />
                )}
            </div>

            {/* cover image */}
            <div>
                <label className="text-sm">Cover Image</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={e =>
                        handleFileChange("coverFile", e.target.files[0])
                    }
                />

                {form.coverPreview && (
                    <img
                        src={form.coverPreview}
                        className="h-28 w-full mt-2 rounded object-cover"
                    />
                )}
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
