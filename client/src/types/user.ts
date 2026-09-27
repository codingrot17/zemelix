import type { VendorProfile } from "./vendor";

export interface UserProfile extends VendorProfile {
    email?: string | null;
    fullName?: string | null;
    role?: string | null;
    accountStatus?: string | null;
    country?: string | null;
    phoneNumber?: string | null;
    verificationStatus?: string | null;
    documents?: string[];
    storeStatus?: string | null;
    currency?: string | null;
    featuresEnabled?: string[];
    dashboardLayout?: Record<string, unknown> | null;
    subscriptionPlan?: string | null;
    vendorStatus?: string | null;
}
