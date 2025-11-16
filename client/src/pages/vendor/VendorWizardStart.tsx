import { useNavigate } from "react-router-dom";

export default function VendorWizardStart() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Start Vendor Upgrade</h2>

      <p className="text-gray-600 text-sm">
        To become a vendor, you’ll need to provide your business details,
        branding images, and confirm your information. This helps us create 
        your public store and verify your account.
      </p>

      <button
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
        onClick={() => navigate("/vendor/upgrade/business-info")}
      >
        Continue
      </button>
    </div>
  );
}
