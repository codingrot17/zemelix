import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVendorWizard } from "@/hooks/useVendorWizard";
import { useAuth } from "@/contexts/AuthContext";
import { vendorTypes } from "@/config/vendorCategories";

function isValidUrl(val?: string) {
    if (!val) return true;
    try {
        new URL(val);
        return true;
    } catch {
        return false;
    }
}

export default function BusinessInfoStep() {
    const navigate = useNavigate();
    const { localDraft, saveLocal, setStep } = useVendorWizard();
    const { user } = useAuth();

    const initial = localDraft ?? {
        businessName: user?.businessName ?? "",
        businessDescription: user?.businessDescription ?? "",
        vendorType: user?.vendorType ?? "",
        businessCategory: user?.businessCategory ?? "",
        country: user?.country ?? "",
        socialLinks: user?.socialLinks ?? {}
    };

    const [form, setForm] = useState({
        businessName: initial.businessName ?? "",
        businessDescription: initial.businessDescription ?? "",
        vendorType: initial.vendorType ?? "",
        businessCategory: initial.businessCategory ?? "",
        country: initial.country ?? "",
        socialLinks: initial.socialLinks ?? {}
    });

    useEffect(() => {
        setForm(prev => ({ ...prev, ...initial }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function updateField(path: string, val: any) {
        if (path.startsWith("social.")) {
            const key = path.split(".")[1];
            setForm(prev => ({
                ...prev,
                socialLinks: { ...(prev.socialLinks || {}), [key]: val }
            }));
            return;
        }
        setForm(prev => ({ ...prev, [path]: val }));
    }

    function validate() {
        const errs: string[] = [];
        // only vendorType is required per user's choice
        if (!form.vendorType) errs.push("Vendor type is required");
        // validate provided social links
        for (const [k, v] of Object.entries(form.socialLinks || {})) {
            if (v && !isValidUrl(v)) errs.push(`${k} link is invalid`);
        }
        return errs;
    }

    async function handleNext() {
        const err = validate();
        if (err.length) return alert(err.join("\n"));

        await saveLocal({
            businessName: form.businessName,
            businessDescription: form.businessDescription,
            vendorType: form.vendorType,
            businessCategory: form.businessCategory,
            country: form.country,
            socialLinks: form.socialLinks,
            step: 1
        });

        setStep(1);
        navigate("/vendor/upgrade/branding");
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Business information</h2>

            <input
                value={form.businessName}
                onChange={e => updateField("businessName", e.target.value)}
                className="w-full border p-3 rounded mb-2"
                placeholder="Business name (optional)"
            />

            <textarea
                value={form.businessDescription}
                onChange={e =>
                    updateField("businessDescription", e.target.value)
                }
                className="w-full border p-3 rounded mb-2"
                placeholder="Short description (optional)"
            />

            <select
                value={form.vendorType}
                onChange={e => updateField("vendorType", e.target.value)}
                className="w-full border p-3 rounded mb-2"
            >
                <option value="">Choose vendor type</option>
                {vendorTypes.map(v => (
                    <option key={v.id} value={v.id}>
                        {v.label}
                    </option>
                ))}
            </select>

            <input
                value={form.businessCategory || ""}
                onChange={e => updateField("businessCategory", e.target.value)}
                className="w-full border p-3 rounded mb-2"
                placeholder="Business category (optional)"
            />

            <input
                value={form.country || ""}
                onChange={e => updateField("country", e.target.value)}
                className="w-full border p-3 rounded mb-2"
                placeholder="Country (optional)"
            />

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
