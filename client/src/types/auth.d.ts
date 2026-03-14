export type UserRole = "admin" | "seller" | "customer" | "vendor";

export interface User {
    id: string;
    $id?: string;
    name?: string | null;
    email?: string | null;
    emailVerification?: boolean;
    role: UserRole;
    country?: string;
    profile?: Record<string, any> | null; // DB profile document
    vendorType?: string | null;
    businessCategory?: string | null;
    businessName?: string | null;
    businessDescription?: string | null;
    socialLinks?: Record<string, string> | null;
    primaryColor?: string | null;
    logo?: string | null;
    coverImage?: string | null;
    slogan?: string | null;
    onboardingStep?: number | null;
}
