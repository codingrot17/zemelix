import { Route } from "react-router-dom";
import UpgradeGate from "@/components/vendor/UpgradeGate";
import VendorWizardLayout from "@/pages/vendor/VendorWizardLayout";
import BusinessInfoStep from "@/pages/vendor/BusinessInfoStep";
import BrandingStep from "@/pages/vendor/BrandingStep";
import ReviewStep from "@/pages/vendor/ReviewStep";

export const VendorUpgradeRoutes = (
    <Route
        path="/vendor/upgrade"
        element={
            <UpgradeGate>
                <VendorWizardLayout />
            </UpgradeGate>
        }
    >
        <Route index element={<BusinessInfoStep />} />
        <Route path="branding" element={<BrandingStep />} />
        <Route path="review" element={<ReviewStep />} />
    </Route>
);
