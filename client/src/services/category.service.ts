import {
    getCategoriesForType,
    searchCategories,
    type BusinessCategory
} from "@/data/businessCategories";

export type { BusinessCategory };

export function listCategories(vendorType?: string): BusinessCategory[] {
    return vendorType ? getCategoriesForType(vendorType) : [];
}

export function findCategories(
    query: string,
    vendorType?: string
): BusinessCategory[] {
    return searchCategories(query, vendorType);
}
