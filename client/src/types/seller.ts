export interface PublicSellerProfile {
    id: string;
    businessName: string | null;
    fullName: string | null;
    logo: string | null;
    coverImage: string | null;
    slogan: string | null;
    businessDescription: string | null;
    vendorType: string | null;
    businessCategory: string | null;
    socialLinks: string | Record<string, string> | null;
}
