/**
 * Shared UI atoms for product/service rendering across the entire app.
 * Import from "@/components/shared/ListingPrimitives"
 */

import React from "react";
import { ShoppingCart, Bookmark, Package, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type VendorType = "seller" | "service";

export type BadgeVariant = "Hot" | "Trending" | "Featured" | "New" | string;

// ─── BadgeChip ─────────────────────────────────────────────────────────────────
/**
 * Consistent badge pill used on every card and detail page.
 * Colors are fixed per badge value — no inline overrides needed.
 */
const BADGE_STYLES: Record<string, string> = {
    Hot:      "bg-red-500 text-white",
    Trending: "bg-emerald-500 text-white",
    Featured: "bg-indigo-600 text-white",
    New:      "bg-pink-500 text-white",
};

export function BadgeChip({
    badge,
    className,
}: {
    badge: BadgeVariant;
    className?: string;
}) {
    const style = BADGE_STYLES[badge] ?? "bg-gray-500 text-white";
    return (
        <span
            className={cn(
                "inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide shadow-sm",
                style,
                className
            )}
        >
            {badge}
        </span>
    );
}

// ─── ListingTypeChip ───────────────────────────────────────────────────────────
/**
 * Small chip that distinguishes Product vs Service visually.
 * Used on cards, detail pages, and tables.
 */
export function ListingTypeChip({
    vendorType,
    size = "sm",
}: {
    vendorType: VendorType | string;
    size?: "xs" | "sm";
}) {
    const isService = vendorType === "service";
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full font-semibold",
                size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
                isService
                    ? "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
            )}
        >
            {isService ? (
                <Clock className="w-3 h-3" />
            ) : (
                <Package className="w-3 h-3" />
            )}
            {isService ? "Service" : "Product"}
        </span>
    );
}

// ─── StockLabel ────────────────────────────────────────────────────────────────
/**
 * Shows "X in stock" for products, "X slots left" for services.
 * Turns red when quantity is low (≤ 5).
 */
export function StockLabel({
    vendorType,
    stock,
}: {
    vendorType: VendorType | string;
    stock: number;
}) {
    const isService = vendorType === "service";
    const isLow = stock <= 5;
    return (
        <span
            className={cn(
                "text-xs font-medium",
                isLow
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400"
            )}
        >
            {isService
                ? `${stock} slot${stock !== 1 ? "s" : ""} left`
                : `${stock} in stock`}
        </span>
    );
}

// ─── SellerStrip ───────────────────────────────────────────────────────────────
/**
 * Consistent seller info row: avatar + name + type chip.
 * Used on ProductCard and FeaturedListingsCarousel items.
 */
export function SellerStrip({
    name,
    avatar,
    vendorType,
    className,
}: {
    name: string;
    avatar?: string | null;
    vendorType: VendorType | string;
    className?: string;
}) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {avatar ? (
                <img
                    src={avatar}
                    alt={name}
                    className="w-6 h-6 rounded-full border object-cover flex-shrink-0"
                />
            ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {initials}
                </div>
            )}
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {name}
            </span>
            <ListingTypeChip vendorType={vendorType} size="xs" />
        </div>
    );
}

// ─── ActionButton ──────────────────────────────────────────────────────────────
/**
 * CTA button that adapts label + color based on vendorType.
 * Product → indigo "Add to Cart"
 * Service → teal "Book Now"
 */
export function ListingActionButton({
    vendorType,
    outOfStock,
    added,
    onClick,
    size = "sm",
    className,
}: {
    vendorType: VendorType | string;
    outOfStock?: boolean;
    added?: boolean;
    onClick?: () => void;
    size?: "sm" | "default";
    className?: string;
}) {
    const isService = vendorType === "service";

    const base =
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition focus:outline-none focus:ring-2";
    const sizeClass =
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

    const colorClass = outOfStock
        ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700"
        : added
        ? "bg-green-500 text-white"
        : isService
        ? "bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-400"
        : "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-400";

    return (
        <button
            className={cn(base, sizeClass, colorClass, className)}
            onClick={onClick}
            disabled={outOfStock}
            type="button"
        >
            {added ? (
                "Added ✓"
            ) : outOfStock ? (
                "Out of Stock"
            ) : isService ? (
                <>
                    <Bookmark className="w-3.5 h-3.5" />
                    Book Now
                </>
            ) : (
                <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to Cart
                </>
            )}
        </button>
    );
}