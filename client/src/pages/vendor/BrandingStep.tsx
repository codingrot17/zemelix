import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVendorWizard } from "@/hooks/useVendorWizard";
import { useAuth } from "@/contexts/AuthContext";
import { getFilePreviewUrl } from "@/lib/appwrite";

export default function BrandingStep() {
    const navigate = useNavigate();
    const { localDraft, saveLocal } = useVendorWizard();
    const { user } = useAuth();

    const initial = localDraft ?? {
        primaryColor: user?.primaryColor ?? "#1a73e8",
        logoFileId: user?.logo ?? null,
        bannerFileId: user?.coverImage ?? null
    };

    const [primaryColor, setPrimaryColor] = useState(initial.primaryColor);
    const [logoPreview, setLogoPreview] = useState(
        initial.logoFileId ? getFilePreviewUrl(initial.logoFileId) : null
    );
    const [bannerPreview, setBannerPreview] = useState(
        initial.bannerFileId ? getFilePreviewUrl(initial.bannerFileId) : null
    );
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    useEffect(() => {
        setPrimaryColor(initial.primaryColor);
        if (initial.logoFileId)
            setLogoPreview(getFilePreviewUrl(initial.logoFileId));
        if (initial.bannerFileId)
            setBannerPreview(getFilePreviewUrl(initial.bannerFileId));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleFilePick(
        e: React.ChangeEvent<HTMLInputElement>,
        forName: "logo" | "banner"
    ) {
        const f = e.target.files?.[0] ?? null;
        if (!f) return;
        if (forName === "logo") {
            setLogoFile(f);
            setLogoPreview(URL.createObjectURL(f));
            saveLocal({
                logoFile: f,
                logoFileId: null,
                logoPreviewLocal: URL.createObjectURL(f)
            });
        } else {
            setBannerFile(f);
            setBannerPreview(URL.createObjectURL(f));
            saveLocal({
                bannerFile: f,
                bannerFileId: null,
                bannerPreviewLocal: URL.createObjectURL(f)
            });
        }
    }

    async function handleNext() {
        // Allow skipping branding: logo/banner optional
        await saveLocal({
            primaryColor,
            logoFile,
            bannerFile,
            logoFileId: localDraft?.logoFileId ?? initial.logoFileId ?? null,
            bannerFileId:
                localDraft?.bannerFileId ?? initial.bannerFileId ?? null,
            logoPreviewLocal: logoPreview,
            bannerPreviewLocal: bannerPreview,
            step: 2
        });

        navigate("/vendor/upgrade/social");
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Branding</h2>

            <div className="mb-3">
                <label className="block text-sm mb-1">Primary color</label>
                <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="block text-sm mb-1">Logo (optional)</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFilePick(e, "logo")}
                />
                {logoPreview && (
                    <img
                        src={logoPreview}
                        className="w-24 h-24 object-cover mt-2"
                        alt="logo preview"
                    />
                )}
                {!logoPreview && (
                    <div className="text-sm text-gray-500 mt-2">
                        No logo yet (optional)
                    </div>
                )}
            </div>

            <div className="mb-3">
                <label className="block text-sm mb-1">
                    Cover Image (optional)
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFilePick(e, "banner")}
                />
                {bannerPreview && (
                    <img
                        src={bannerPreview}
                        className="w-full h-36 object-cover mt-2"
                        alt="banner preview"
                    />
                )}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="flex-1 py-3 border rounded"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    className="flex-1 py-3 bg-blue-600 text-white rounded"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
