import React from "react";
import { useNavigate } from "react-router-dom";
import { useVendorWizard } from "@/hooks/useVendorWizard";
import { useAuth } from "@/contexts/AuthContext";

export default function ReviewStep() {
    const navigate = useNavigate();
    const { completeWizard, loading } = useVendorWizard();
    const { user } = useAuth();

    const handleFinish = async () => {
        await completeWizard();
        navigate("/dashboard/vendor");
    };

    // Parse socialLinks safely
    let socials = {};
    try {
        socials = user?.socialLinks ? JSON.parse(user.socialLinks) : {};
    } catch {
        socials = {};
    }

    return (
        <div className="space-y-4 p-3">
            <h2 className="text-lg font-semibold">Review your details</h2>

            <div className="border rounded p-3 space-y-2">
                <div>
                    <strong>Business:</strong> {user?.businessName || "—"}
                </div>
                <div>
                    <strong>Type:</strong> {user?.vendorType || "—"}
                </div>
                <div>
                    <strong>Country:</strong> {user?.country || "—"}
                </div>
                <div>
                    <strong>Description:</strong>{" "}
                    {user?.businessDescription || "—"}
                </div>
                <div>
                    <strong>Primary color:</strong>{" "}
                    <span
                        style={{
                            backgroundColor: user?.primaryColor || "#eee"
                        }}
                        className="inline-block px-2 py-1 rounded ml-2"
                    >
                        {user?.primaryColor || "—"}
                    </span>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="flex-1 py-3 border rounded-lg"
                >
                    Back
                </button>
                <button
                    onClick={handleFinish}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg"
                >
                    {loading ? "Finalizing..." : "Finish Setup"}
                </button>
            </div>
        </div>
    );
}
