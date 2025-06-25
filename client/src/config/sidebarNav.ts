import {
    HiOutlineHome,
    HiOutlineUsers,
    HiOutlineClipboardList,
    HiOutlineChartPie,
    HiOutlineCog,
    HiOutlineTag,
    HiOutlineCollection,
    HiOutlineBell,
    HiOutlineCurrencyDollar,
    HiOutlineDocumentReport,
    HiOutlineShoppingCart,
    HiOutlineUserCircle,
  } from "react-icons/hi";
  
  export const sidebarNavConfig = {
    admin: [
      { label: "Dashboard", to: "/dashboard", icon: HiOutlineHome },
      { label: "Users", to: "/dashboard/admin/users", icon: HiOutlineUsers },
      { label: "Orders", to: "/dashboard/admin/orders", icon: HiOutlineClipboardList },
      { label: "Analytics", to: "/dashboard/admin/analytics", icon: HiOutlineChartPie },
      { label: "Products", to: "/dashboard/admin/products", icon: HiOutlineCollection },
      { label: "Reports", to: "/dashboard/admin/reports", icon: HiOutlineDocumentReport },
      { label: "Marketing", to: "/dashboard/admin/marketing", icon: HiOutlineTag },
      { label: "Notifications", to: "/dashboard/admin/notifications", icon: HiOutlineBell },
      { label: "Finance", to: "/dashboard/admin/finance", icon: HiOutlineCurrencyDollar },
      { label: "Settings", to: "/dashboard/admin/settings", icon: HiOutlineCog },
    ],
    seller: [
      { label: "Dashboard", to: "/dashboard", icon: HiOutlineHome },
      { label: "My Products", to: "/dashboard/seller/products", icon: HiOutlineCollection },
      { label: "Orders", to: "/dashboard/seller/orders", icon: HiOutlineClipboardList },
      { label: "Store Profile", to: "/dashboard/seller/profile", icon: HiOutlineUsers },
      { label: "Analytics", to: "/dashboard/seller/analytics", icon: HiOutlineChartPie },
      { label: "Notifications", to: "/dashboard/seller/notifications", icon: HiOutlineBell },
      { label: "Settings", to: "/dashboard/seller/settings", icon: HiOutlineCog },
    ],
    customer: [
      { label: "Dashboard", to: "/dashboard", icon: HiOutlineHome },
      { label: "My Orders", to: "/dashboard/user/orders", icon: HiOutlineShoppingCart },
      { label: "Favorites", to: "/dashboard/user/favorites", icon: HiOutlineTag },
      { label: "Profile", to: "/dashboard/user/profile", icon: HiOutlineUserCircle },
      { label: "Notifications", to: "/dashboard/user/notifications", icon: HiOutlineBell },
      { label: "Wallet", to: "/dashboard/user/wallet", icon: HiOutlineCurrencyDollar },
      { label: "Settings", to: "/dashboard/user/settings", icon: HiOutlineCog },
    ],
  };
  