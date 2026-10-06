export const VENDOR_TYPES = [
    "product-seller",
    "service-provider",
    "digital-creator",
    "wholesaler",
    "other"
] as const;

export type VendorType = (typeof VENDOR_TYPES)[number];

export const LISTING_TYPES = [
    "physical-product",
    "service",
    "digital-product",
    "wholesale-product",
    "other-offer"
] as const;

export type ListingType = (typeof LISTING_TYPES)[number];

export const TRANSACTION_MODELS = [
    "retail-order",
    "booking-request",
    "digital-purchase",
    "wholesale-order",
    "quote-request"
] as const;

export type TransactionModel = (typeof TRANSACTION_MODELS)[number];

export interface VendorCapabilities {
    listingTypes: readonly ListingType[];
    transactionModels: readonly TransactionModel[];
    supportsInventory: boolean;
    supportsBookings: boolean;
    supportsDigitalDelivery: boolean;
    supportsWholesalePricing: boolean;
}

/**
 * Vendor type describes the business model selected during onboarding.
 * It is intentionally separate from the legacy Product.vendorType field,
 * which currently describes seller/service listing behavior.
 */
export const vendorCapabilities: Record<VendorType, VendorCapabilities> = {
    "product-seller": {
        listingTypes: ["physical-product"],
        transactionModels: ["retail-order"],
        supportsInventory: true,
        supportsBookings: false,
        supportsDigitalDelivery: false,
        supportsWholesalePricing: false
    },
    "service-provider": {
        listingTypes: ["service"],
        transactionModels: ["booking-request"],
        supportsInventory: false,
        supportsBookings: true,
        supportsDigitalDelivery: false,
        supportsWholesalePricing: false
    },
    "digital-creator": {
        listingTypes: ["digital-product"],
        transactionModels: ["digital-purchase"],
        supportsInventory: false,
        supportsBookings: false,
        supportsDigitalDelivery: true,
        supportsWholesalePricing: false
    },
    wholesaler: {
        listingTypes: ["wholesale-product"],
        transactionModels: ["wholesale-order", "quote-request"],
        supportsInventory: true,
        supportsBookings: false,
        supportsDigitalDelivery: false,
        supportsWholesalePricing: true
    },
    other: {
        listingTypes: ["other-offer"],
        transactionModels: ["quote-request"],
        supportsInventory: false,
        supportsBookings: false,
        supportsDigitalDelivery: false,
        supportsWholesalePricing: false
    }
};

export function getVendorCapabilities(
    vendorType: VendorType
): VendorCapabilities {
    return vendorCapabilities[vendorType];
}

export interface VendorProfile {
    vendorType?: VendorType | null;
    businessCategory?: string | null;
    businessName?: string | null;
    businessDescription?: string | null;
    socialLinks?: string | Record<string, string> | null;
    primaryColor?: string | null;
    logo?: string | null;
    coverImage?: string | null;
    slogan?: string | null;
    onboardingStep?: number | null;
}
