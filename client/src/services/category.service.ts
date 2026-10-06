import {
    getCategoriesForType,
    searchCategories,
    type BusinessCategory
} from "@/data/businessCategories";
import type { VendorType } from "@/types/vendor";

export type { BusinessCategory };

export function listCategories(vendorType?: VendorType): BusinessCategory[] {
    return vendorType ? getCategoriesForType(vendorType) : [];
}

export function findCategories(
    query: string,
    vendorType?: VendorType
): BusinessCategory[] {
    return searchCategories(query, vendorType);
}
