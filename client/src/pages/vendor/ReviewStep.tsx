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

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Review Your Information</h2>

            <div className="border rounded-lg p-4 space-y-2">
                <p>
                    <strong>Name:</strong> {user?.businessName}
                </p>
                <p>
                    <strong>Description:</strong> {user?.businessDescription}
                </p>
                <p>
                    <strong>Vendor Type:</strong> {user?.vendorType}
                </p>
                <p>
                    <strong>Country:</strong> {user?.country}
                </p>
                <p>
                    <strong>Color:</strong> {user?.primaryColor}
                </p>
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
