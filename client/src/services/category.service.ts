import {
    getCategoriesForType,
    searchCategories,
    type BusinessCategory
} from "@/data/businessCategories";
import { VENDOR_TYPES, type VendorType } from "@/types/vendor";

export type { BusinessCategory };

function isVendorType(value: string): value is VendorType {
    return (VENDOR_TYPES as readonly string[]).includes(value);
}

export function listCategories(vendorType?: string): BusinessCategory[] {
    return vendorType && isVendorType(vendorType)
        ? getCategoriesForType(vendorType)
        : [];
}

export function findCategories(
    query: string,
    vendorType?: string
): BusinessCategory[] {
    return searchCategories(query, vendorType);
}
