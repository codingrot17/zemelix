import { updateUserProfile } from "@/lib/appwrite/database";
import { uploadFile } from "@/lib/appwrite/storage";

export type VendorOnboardingData = {
    role: "seller";
    vendorType: string;
    businessCategory: string;
    businessName: string;
    businessDescription: string;
    slogan: string | null;
    logo: string | null;
    coverImage: string | null;
    primaryColor: string;
    socialLinks: Record<string, string> | null;
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

export function completeVendorOnboarding(
    userId: string,
    data: VendorOnboardingData
) {
    return updateUserProfile(userId, data);
}
