import { updateUserProfile } from "@/lib/appwrite/database";
import { uploadFile } from "@/lib/appwrite/storage";

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

export function completeVendorOnboarding(
    userId: string,
    data: VendorOnboardingData
) {
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

    return updateUserProfile(userId, {
        vendorType,
        businessCategory,
        businessName,
        businessDescription,
        slogan,
        logo,
        coverImage,
        primaryColor,
        socialLinks,
        role: "seller",
        vendorStatus: "pending",
        storeStatus: "closed",
        onboardingStep: 99,
        currency: "NGN",
        subscriptionPlan: "free",
        accountStatus: "active",
    });
}
