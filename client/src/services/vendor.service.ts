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
export function uploadVendorFile(file: File) {
    return uploadFile(file);
}

export async function completeVendorOnboarding(
    data: VendorOnboardingInput
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

    const execution = await functions.createExecution(
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

    if (execution.responseStatusCode < 200 || execution.responseStatusCode >= 300) {
        let message = "Vendor onboarding failed.";
        try {
            const response = JSON.parse(execution.responseBody || "{}");
            if (typeof response.error === "string" && response.error) {
                message = response.error;
            }
        } catch {
            // Keep the generic message when the function response is not JSON.
        }
        throw new Error(message);
    }

    return execution;
}
