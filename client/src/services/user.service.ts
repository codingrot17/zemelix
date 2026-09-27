import { updateUserProfile } from "@/lib/appwrite/database";

export type VendorProfileUpdate = {
    role: "vendor";
    vendorType: string | null;
    businessCategory: string | null;
    businessName: string | null;
    businessDescription: string | null;
    logo: string | null;
    coverImage: string | null;
    primaryColor: string | null;
    socialLinks: string | Record<string, string> | null;
    slogan: string | null;
    vendorStatus: "pending";
    storeStatus: "closed";
    verificationStatus: "unverified";
    onboardingStep: 99;
};

export async function updateVendorProfile(userId: string, data: VendorProfileUpdate) {
    return updateUserProfile(userId, data);
}
