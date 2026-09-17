import { functions } from "@/lib/appwrite/client";
import { uploadFile } from "@/lib/appwrite/storage";

const VENDOR_PROMOTION_FUNCTION_ID =
    import.meta.env.VITE_APPWRITE_VENDOR_PROMOTION_FUNCTION_ID;

export type VendorOnboardingInput = {
    vendorType: string;
    businessCategory: string;
    businessName: string;
    businessDescription: string;
    slogan: string | null;
    logo: string | null;
    coverImage: string | null;
    primaryColor: string;
    socialLinks: string | Record<string, string> | null;
};

/**
 * Compatibility shape for the current VendorWizard.
 * Trusted fields are intentionally not forwarded to the browser-invoked
 * function; the function sets those values server-side.
 */
export type VendorOnboardingData = VendorOnboardingInput & {
    role: "seller";
    vendorStatus: "pending";
    storeStatus: "closed";
    onboardingStep: 99;
    currency: "NGN";
    subscriptionPlan: "free";
    accountStatus: "active";
};

export function uploadVendorFile(file: File) {
    return uploadFile(file);
}

export async function completeVendorOnboarding(
    data: VendorOnboardingData
) {
    if (!VENDOR_PROMOTION_FUNCTION_ID) {
        throw new Error(
            "VITE_APPWRITE_VENDOR_PROMOTION_FUNCTION_ID is required"
        );
    }

    const {
        vendorType,
        businessCategory,
        businessName,
        businessDescription,
        slogan,
        logo,
        coverImage,
        primaryColor,
        socialLinks,
    } = data;

    return functions.createExecution(
        VENDOR_PROMOTION_FUNCTION_ID,
        JSON.stringify({
            vendorType,
            businessCategory,
            businessName,
            businessDescription,
            slogan,
            logo,
            coverImage,
            primaryColor,
            socialLinks,
        }),
        false
    );
}
