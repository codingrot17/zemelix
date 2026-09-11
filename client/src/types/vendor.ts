export interface VendorProfile {
    vendorType?: string | null;
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
