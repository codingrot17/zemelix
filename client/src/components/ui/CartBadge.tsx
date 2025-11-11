import React from "react";

interface CartBadgeProps {
    count: number;
}

export const CartBadge: React.FC<CartBadgeProps> = ({ count }) => {
    if (count <= 0) return null;

    return (
        <span
            className="
        absolute -top-1 -right-1 
        flex items-center justify-center
        w-4 h-4 text-[10px] font-bold text-white 
        bg-red-600 rounded-full
        shadow-md
        dark:bg-red-500
      "
        >
            {count > 9 ? "9+" : count}
        </span>
    );
};
