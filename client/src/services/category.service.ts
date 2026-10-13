import {
    categoryDatabase,
    getCategoriesForType,
    searchCategories,
    type BusinessCategory
} from "@/data/businessCategories";
import type { Product } from "@/types/product";

export type { BusinessCategory };

const VIRTUAL_CATEGORY_TERMS: Record<string, string[]> = {
    "home-living": ["home", "furniture", "decor", "kitchen", "bedding", "lighting", "storage"],
};

export function listCategories(vendorType?: string): BusinessCategory[] {
    return vendorType ? getCategoriesForType(vendorType) : [];
}

export function findCategories(query: string, vendorType?: string): BusinessCategory[] {
    return searchCategories(query, vendorType);
}

function normalize(value: string): string {
    return value.toLocaleLowerCase().normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ").trim();
}

export function getCategoryByIdOrName(value: string): BusinessCategory | undefined {
    const needle = normalize(value);
    return categoryDatabase.flatMap(group => group.categories)
        .find(category => category.id === value || normalize(category.name) === needle);
}

export function categoryLabel(value: string): string {
    if (value === "home-living") return "Home & Living";
    return getCategoryByIdOrName(value)?.name ??
        value.replace(/[-_]+/g, " ").replace(/\b\w/g, char => char.toUpperCase());
}

/** Existing listings use free-form category strings. Match taxonomy IDs against
 * legacy category labels, listing text and tags without requiring a data migration.
 */
export function listingMatchesCategory(product: Product, value: string): boolean {
    const category = getCategoryByIdOrName(value);
    const label = category?.name ?? value.replace(/[-_]+/g, " ");
    const categoryValue = normalize(product.category);
    const normalizedLabel = normalize(label);

    if (categoryValue && (categoryValue === normalizedLabel ||
        categoryValue.includes(normalizedLabel) || normalizedLabel.includes(categoryValue))) return true;

    const searchable = normalize([
        product.title,
        product.shortDescription,
        product.category,
        ...(product.tags ?? [])
    ].join(" "));

    const virtualTerms = VIRTUAL_CATEGORY_TERMS[value];
    if (virtualTerms) return virtualTerms.some(term => searchable.includes(normalize(term)));

    if (category) {
        return [category.name, ...category.keywords]
            .map(normalize).filter(term => term.length >= 4)
            .some(term => searchable.includes(term));
    }

    const terms = normalizedLabel.split(" ").filter(term => term.length >= 3);
    return terms.length > 0 && terms.every(term => searchable.includes(term));
}
