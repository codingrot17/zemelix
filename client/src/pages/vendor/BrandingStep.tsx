import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVendorWizard } from "@/hooks/useVendorWizard";
import { storage } from "@/lib/appwrite"; // your existing storage instance

export default function BrandingStep() {
    const navigate = useNavigate();
    const { saveData, loading } = useVendorWizard();

    const [logo, setLogo] = useState<File | null>(null);
    const [banner, setBanner] = useState<File | null>(null);
    const [primaryColor, setPrimaryColor] = useState("#1a73e8");

    const uploadFile = async (file: File) => {
        const uploaded = await storage.createFile(
            "brand-assets",
            file.name + Date.now(),
            file
        );
        return uploaded.$id;
    };

    const handleNext = async () => {
        let logoId = null;
        let bannerId = null;

        if (logo) logoId = await uploadFile(logo);
        if (banner) bannerId = await uploadFile(banner);

        await saveData(
            {
                logo: logoId,
                coverImage: bannerId,
                primaryColor,
            },
            2 // next → review
        );

        navigate("/vendor/upgrade/review");
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Branding</h2>

            <div>
                <label className="block mb-1 font-medium">Logo</label>
                <input type="file" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
            </div>

            <div>
                <label className="block mb-1 font-medium">Banner</label>
                <input type="file" onChange={(e) => setBanner(e.target.files?.[0] || null)} />
            </div>

            <div>
                <label className="block mb-1 font-medium">Primary Color</label>
                <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-10"
                />
            </div>

            <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
            >
                {loading ? "Uploading..." : "Continue"}
            </button>
        </div>
    );
}
