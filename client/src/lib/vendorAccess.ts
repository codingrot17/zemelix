import type { VendorType } from "@/types/vendor";

export function getEffectiveVendorType(value?: string | null): VendorType {
    if (value === "service" || value === "service-provider") return "service-provider";
    if (value === "product-seller") return "product-seller";
    if (value === "digital-creator") return "digital-creator";
    if (value === "wholesaler") return "wholesaler";
    return "other";
}

export function isServiceProvider(value?: string | null): boolean {
    return getEffectiveVendorType(value) === "service-provider";
}

export function canUseSellerOrders(value?: string | null): boolean {
    return !isServiceProvider(value);
}
