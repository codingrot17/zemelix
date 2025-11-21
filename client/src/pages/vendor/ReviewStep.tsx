import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVendorWizard } from "@/hooks/useVendorWizard";
import { uploadFileToBucket } from "@/lib/appwrite";
import { useAuth } from "@/contexts/AuthContext";

export default function ReviewStep() {
    const navigate = useNavigate();
    const { localDraft, finalSubmit, saveLocal } = useVendorWizard();
    const { user } = useAuth();
    const [busy, setBusy] = useState(false);

    async function handleSubmit() {
        if (!localDraft) return alert("Nothing to submit");
        setBusy(true);

        try {
            // uploadFn: wraps your existing upload helper, returns fileId string
            const uploadFn = async (file: File, filename?: string) => {
                const res = await uploadFileToBucket(file, filename);
                // Appwrite SDK returns $id on created file object
                return res.$id ?? res.id ?? res;
            };

            await finalSubmit({ uploadFn });

            // double-protect: ensure onboardingStep numeric stored; already done in finalSubmit
            // optional: saveLocal to ensure local cleared
            saveLocal({ step: 99 });

            navigate("/vendor/dashboard");
        } catch (err: any) {
            console.error("ReviewStep submit error", err);
            alert(err?.message || "Failed to submit vendor details");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>

            <div className="mb-4">
                <strong>Business name:</strong>{" "}
                {localDraft?.businessName || "(none)"} <br />
                <strong>Type:</strong> {localDraft?.vendorType || "(none)"}{" "}
                <br />
                <strong>Country:</strong> {localDraft?.country || "(none)"}{" "}
                <br />
                <strong>Logo:</strong>{" "}
                {localDraft?.logoPreviewLocal ? (
                    <img
                        src={localDraft.logoPreviewLocal}
                        className="w-20 h-20 object-cover"
                        alt="logo"
                    />
                ) : localDraft?.logoFileId ? (
                    "Existing"
                ) : (
                    "(none)"
                )}{" "}
                <br />
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="flex-1 py-3 border rounded"
                >
                    Back
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={busy}
                    className="flex-1 py-3 bg-green-600 text-white rounded"
                >
                    {busy ? "Submitting..." : "Submit"}
                </button>
            </div>
        </div>
    );
}
