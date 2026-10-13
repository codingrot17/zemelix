import type { Product } from "@/types/product";

export interface ListingCategory {
    name: string;
    slug: string;
    count: number;
    productCount: number;
    serviceCount: number;
}

export function normalizeCategory(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
}

export function slugifyCategory(value: string): string {
    return normalizeCategory(value).replace(/\s+/g, "-");
}

export function getListingCategories(products: Product[]): ListingCategory[] {
    const grouped = new Map<string, ListingCategory>();

    for (const product of products) {
        const name = product.category?.trim() || "Other";
        const key = normalizeCategory(name);
        if (!key) continue;

        const current = grouped.get(key) ?? {
            name,
            slug: slugifyCategory(name),
            count: 0,
            productCount: 0,
            serviceCount: 0
        };
        current.count += 1;
        if (product.vendorType === "service") current.serviceCount += 1;
        else current.productCount += 1;
        grouped.set(key, current);
    }

    return [...grouped.values()].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
}

export function matchesCategory(product: Product, categoryOrSlug: string): boolean {
    return slugifyCategory(product.category || "Other") === slugifyCategory(categoryOrSlug);
}

export function matchesListingSearch(product: Product, query: string): boolean {
    const needle = normalizeCategory(query);
    if (!needle) return true;

    const fields = [
        product.title,
        product.shortDescription,
        product.longDescription ?? "",
        product.category,
        product.sellerName,
        ...(product.tags ?? [])
    ];
    return fields.some(field => normalizeCategory(field).includes(needle));
}
