import React from "react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function AdminOrders() {
    return (
        <ComingSoon
            title="Admin Orders"
            backTo="/dashboard/admin"
            backLabel="Back to Dashboard"
        />
    );
}
