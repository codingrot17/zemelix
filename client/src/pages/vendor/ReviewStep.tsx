import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { databases, storage } from "@/lib/appwrite";

export default function ReviewStep() {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [businessInfo, setBusinessInfo] = useState(null);
    const [branding, setBranding] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setBusinessInfo(
            JSON.parse(localStorage.getItem("vendor-onboarding-info"))
        );
        setBranding(
            JSON.parse(localStorage.getItem("vendor-onboarding-branding"))
        );
    }, []);

    async function handleSubmit() {
        setSubmitting(true);

        try {
            const updatedData = {
                ...businessInfo,
                slogan: branding.slogan,
                role: "seller",
                storeStatus: "closed",
                verificationStatus: "pending"
            };

            // Update Appwrite user document
            await databases.updateDocument(
                user.$databaseId,
                user.$tableId,
                user.$id,
                updatedData
            );

            // Refresh in context
            await refreshUser();

            // Cleanup
            localStorage.removeItem("vendor-onboarding-info");
            localStorage.removeItem("vendor-onboarding-branding");

            navigate("/vendor/dashboard");
        } catch (err) {
            console.error(err);
        }

        setSubmitting(false);
    }

    if (!businessInfo) {
        return <p>Loading...</p>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Review Your Information</h2>

            <div className="p-3 border rounded bg-white space-y-1">
                <p>
                    <strong>Name:</strong> {businessInfo.businessName}
                </p>
                <p>
                    <strong>Type:</strong> {businessInfo.vendorType}
                </p>
                <p>
                    <strong>Category:</strong> {businessInfo.businessCategory}
                </p>
                <p className="text-sm">
                    <strong>Description:</strong>{" "}
                    {businessInfo.businessDescription}
                </p>

                <p>
                    <strong>Slogan:</strong> {branding?.slogan}
                </p>
            </div>

            <button
                disabled={submitting}
                onClick={handleSubmit}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
            >
                {submitting ? "Submitting..." : "Confirm & Upgrade"}
            </button>
        </div>
    );
}
