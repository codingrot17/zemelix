import { Outlet, useLocation } from "react-router-dom";

const steps = [
    { path: "/vendor/upgrade/start", label: "Business Info" },
    { path: "/vendor/upgrade/branding", label: "Branding" },
    { path: "/vendor/upgrade/review", label: "Review" }
];

export default function VendorWizardLayout() {
    const location = useLocation();

    // Find current step index
    const currentStepIndex = steps.findIndex(s =>
        location.pathname.includes(s.path)
    );

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center">
            {/* Wizard Header */}
            <div className="w-full max-w-md p-4 border-b bg-white shadow-sm">
                <h1 className="text-xl font-semibold">Become a Vendor</h1>

                {/* Step Progress UI */}
                <div className="mt-3 flex gap-2">
                    {steps.map((step, index) => (
                        <div
                            key={step.path}
                            className={`flex-1 h-2 rounded-full ${
                                index <= currentStepIndex
                                    ? "bg-blue-600"
                                    : "bg-gray-300"
                            }`}
                        />
                    ))}
                </div>

                <p className="mt-2 text-sm text-gray-600">
                    Step {currentStepIndex + 1} of {steps.length}:{" "}
                    {steps[currentStepIndex]?.label || "Unknown"}
                </p>
            </div>

            {/* Page content */}
            <div className="w-full max-w-md p-4">
                <Outlet />
            </div>
        </div>
    );
}
