export type VendorWizardStep = 0 | 1 | 2 | 3;

export interface VendorFormData {
    vendorType: string;
    businessName: string;
    businessCategory: string;
    businessDescription: string;
    slogan: string;
    primaryColor: string;
    socialLinks: {
        website: string;
        facebook: string;
        instagram: string;
        twitter: string;
    };
}
