import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVendorWizard } from "@/hooks/useVendorWizard";
import { uploadFileToBucket } from "@/lib/appwrite"; // existing helper

export default function BrandingStep() {
    const navigate = useNavigate();
    const { saveData, loading } = useVendorWizard();

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [primaryColor, setPrimaryColor] = useState("#1a73e8");

    const handleNext = async () => {
        // Basic validation
        if (logoFile && logoFile.size > 500_000)
            return alert("Logo must be < 500KB");
        if (bannerFile && bannerFile.size > 2_000_000)
            return alert("Banner must be < 2MB");

        let logoId = null;
        let bannerId = null;

        try {
            if (logoFile) logoId = await uploadFileToBucket(logoFile);
            if (bannerFile) bannerId = await uploadFileToBucket(bannerFile);
        } catch (err) {
            console.error(err);
            return alert(
                "Upload failed. Try smaller images or a stronger connection."
            );
        }

        await saveData(
            {
                logo: logoId || null,
                coverImage: bannerId || null,
                primaryColor
            },
            2
        );
        navigate("/vendor/upgrade/review");
    };

    return (
        <div className="space-y-4 p-3">
            <h2 className="text-lg font-semibold">Branding</h2>

            <div>
                <label className="block mb-1 font-medium">
                    Logo (PNG/JPG, &lt;500KB)
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={e => setLogoFile(e.target.files?.[0] ?? null)}
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">
                    Banner (optional, &lt;2MB)
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={e => setBannerFile(e.target.files?.[0] ?? null)}
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">Primary color</label>
                <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                />
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="flex-1 py-3 border rounded-lg"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg"
                >
                    {loading ? "Saving..." : "Continue"}
                </button>
            </div>
        </div>
    );
}
