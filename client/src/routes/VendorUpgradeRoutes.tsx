import React from "react";
import { Route } from "react-router-dom";
import UpgradeGate from "@/components/vendor/UpgradeGate";
import VendorSetupForm from "@/pages/vendor/VendorSetupForm";

const VendorUpgradeRoutes = (
    <Route
        path="/vendor/upgrade"
        element={
            <UpgradeGate>
                <VendorSetupForm />
            </UpgradeGate>
        }
    />
);

export default VendorUpgradeRoutes;
