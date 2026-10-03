import { functions } from "@/lib/appwrite/client";
import type { PublicSellerProfile } from "@/types/seller";

const PUBLIC_SELLER_PROFILE_FUNCTION_ID =
    import.meta.env.VITE_APPWRITE_PUBLIC_SELLER_PROFILE_FUNCTION_ID;

type PublicSellerProfileResponse = {
    ok?: boolean;
    seller?: {
        id?: unknown;
        businessName?: unknown;
        fullName?: unknown;
        logo?: unknown;
        coverImage?: unknown;
        slogan?: unknown;
        businessDescription?: unknown;
        vendorType?: unknown;
        businessCategory?: unknown;
        socialLinks?: unknown;
    };
    error?: unknown;
};

function toNullableString(value: unknown): string | null {
    return typeof value === "string" ? value : value == null ? null : String(value);
}

function toSocialLinks(
    value: unknown
): string | Record<string, string> | null {
    if (value === null || value === undefined) return null;
    if (typeof value === "string") return value;
    if (typeof value !== "object" || Array.isArray(value)) return null;

    const entries = Object.entries(value).filter(
        ([, item]) => typeof item === "string"
    );

    return Object.fromEntries(entries);
}

function parsePublicSellerProfile(
    value: unknown
): PublicSellerProfile {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Invalid public seller profile response.");
    }

    const seller = value as PublicSellerProfileResponse["seller"];

    if (!seller || typeof seller.id !== "string" || !seller.id) {
        throw new Error("Invalid public seller profile response.");
    }

    return {
        id: seller.id,
        businessName: toNullableString(seller.businessName),
        fullName: toNullableString(seller.fullName),
        logo: toNullableString(seller.logo),
        coverImage: toNullableString(seller.coverImage),
        slogan: toNullableString(seller.slogan),
        businessDescription: toNullableString(seller.businessDescription),
        vendorType: toNullableString(seller.vendorType),
        businessCategory: toNullableString(seller.businessCategory),
        socialLinks: toSocialLinks(seller.socialLinks),
    };
}

export async function getPublicSellerProfile(
    sellerId: string
): Promise<PublicSellerProfile | null> {
    if (!PUBLIC_SELLER_PROFILE_FUNCTION_ID) {
        throw new Error(
            "VITE_APPWRITE_PUBLIC_SELLER_PROFILE_FUNCTION_ID is required"
        );
    }

    if (!sellerId.trim()) {
        throw new Error("sellerId is required.");
    }

    const execution = await functions.createExecution(
        PUBLIC_SELLER_PROFILE_FUNCTION_ID,
        JSON.stringify({ sellerId }),
        false
    );

    let response: PublicSellerProfileResponse = {};
    try {
        response = JSON.parse(execution.responseBody || "{}");
    } catch {
        throw new Error("Invalid response from public seller profile service.");
    }

    if (execution.responseStatusCode === 404) {
        return null;
    }

    if (
        execution.responseStatusCode < 200 ||
        execution.responseStatusCode >= 300 ||
        response.ok !== true
    ) {
        const message =
            typeof response.error === "string" && response.error
                ? response.error
                : "Failed to load public seller profile.";
        throw new Error(message);
    }

    return parsePublicSellerProfile(response.seller);
}
