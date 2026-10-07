import {
    HiOutlineHome,HiOutlineUsers,HiOutlineClipboardList,HiOutlineChartPie,HiOutlineCog,
    HiOutlineTag,HiOutlineCollection,HiOutlineBell,HiOutlineCurrencyDollar,
    HiOutlineDocumentReport,HiOutlineShoppingCart,HiOutlineUserCircle
} from "react-icons/hi";
import type { UserRole } from "@/types/auth";
import { isServiceProvider } from "@/lib/vendorAccess";

export const sidebarNavConfig = {
 admin:[{label:"Dashboard",to:"/dashboard",icon:HiOutlineHome},{label:"Users",to:"/dashboard/admin/users",icon:HiOutlineUsers},{label:"Orders",to:"/dashboard/admin/orders",icon:HiOutlineClipboardList},{label:"Analytics",to:"/dashboard/admin/analytics",icon:HiOutlineChartPie},{label:"Products",to:"/dashboard/admin/products",icon:HiOutlineCollection},{label:"Reports",to:"/dashboard/admin/reports",icon:HiOutlineDocumentReport},{label:"Marketing",to:"/dashboard/admin/marketing",icon:HiOutlineTag},{label:"Notifications",to:"/dashboard/admin/notifications",icon:HiOutlineBell},{label:"Finance",to:"/dashboard/admin/finance",icon:HiOutlineCurrencyDollar},{label:"Settings",to:"/dashboard/admin/settings",icon:HiOutlineCog}],
 seller:[{label:"Dashboard",to:"/dashboard",icon:HiOutlineHome},{label:"My Products",to:"/dashboard/seller/products",icon:HiOutlineCollection},{label:"Store Profile",to:"/dashboard/seller/profile",icon:HiOutlineUsers},{label:"Analytics",to:"/dashboard/seller/analytics",icon:HiOutlineChartPie},{label:"Notifications",to:"/dashboard/seller/notifications",icon:HiOutlineBell},{label:"Settings",to:"/dashboard/seller/settings",icon:HiOutlineCog}],
 customer:[{label:"Dashboard",to:"/dashboard",icon:HiOutlineHome},{label:"My Orders",to:"/dashboard/user/orders",icon:HiOutlineShoppingCart},{label:"My Bookings",to:"/dashboard/user/bookings",icon:HiOutlineClipboardList},{label:"Favorites",to:"/dashboard/user/favorites",icon:HiOutlineTag},{label:"Profile",to:"/dashboard/user/profile",icon:HiOutlineUserCircle},{label:"Notifications",to:"/dashboard/user/notifications",icon:HiOutlineBell},{label:"Wallet",to:"/dashboard/user/wallet",icon:HiOutlineCurrencyDollar},{label:"Settings",to:"/dashboard/user/settings",icon:HiOutlineCog}]
} as const;

export function getSidebarNav(role: UserRole, vendorType?: string | null) {
    if (role !== "seller") return sidebarNavConfig[role] ?? [];
    if (isServiceProvider(vendorType)) {
        return [
            sidebarNavConfig.seller[0],
            { label:"My Services", to:"/dashboard/seller/services", icon:HiOutlineCollection },
            { label:"Bookings", to:"/dashboard/seller/bookings", icon:HiOutlineClipboardList },
            ...sidebarNavConfig.seller.slice(2)
        ];
    }

    return [
        sidebarNavConfig.seller[0],
        sidebarNavConfig.seller[1],
        { label:"Orders", to:"/dashboard/seller/orders", icon:HiOutlineClipboardList },
        ...sidebarNavConfig.seller.slice(2)
    ];
}
