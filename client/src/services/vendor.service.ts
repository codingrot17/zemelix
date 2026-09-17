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

    return functions.createExecution(
        VENDOR_PROMOTION_FUNCTION_ID,
        JSON.stringify(data),
        false
    );
}
