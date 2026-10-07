import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isServiceProvider } from "@/lib/vendorAccess";

export default function VendorTransactionRoute({ kind }: { kind: "orders" | "bookings" }) {
    const { user } = useAuth();
    const provider = isServiceProvider(user?.profile?.vendorType);
    if (kind === "orders" && provider) return <Navigate to="/dashboard/seller/bookings" replace />;
    if (kind === "bookings" && !provider) return <Navigate to="/dashboard/seller/orders" replace />;
    return <Outlet />;
}
