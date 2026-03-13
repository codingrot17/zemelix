import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeRole } from "@/lib/authHelpers";

/**
 * Dashboard index — immediately redirects to the correct
 * role-specific sub-dashboard so /dashboard never dead-ends.
 */
export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const role = normalizeRole({
            role: user?.role,
            profile: user?.profile
        });

        switch (role) {
            case "admin":
                navigate("/dashboard/admin", { replace: true });
                break;
            case "seller":
                navigate("/dashboard/seller", { replace: true });
                break;
            case "customer":
            default:
                navigate("/dashboard/user", { replace: true });
                break;
        }
    }, [user, navigate]);

    // Render nothing — redirect happens in useEffect
    return null;
}
