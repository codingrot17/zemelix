import React from "react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function UserOrdersPage() {
    return (
        <ComingSoon
            title="My Orders"
            backTo="/dashboard/user"
            backLabel="Back to Dashboard"
        />
    );
}
