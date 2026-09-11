import type { VendorProfile } from "@/types/vendor";

export type UserRole = "admin" | "seller" | "customer" | "vendor";

export interface User extends VendorProfile {
    id: string;
    $id?: string;
    name?: string | null;
    email?: string | null;
    emailVerification?: boolean;
    role: UserRole;
    country?: string;
    profile?: Record<string, any> | null;
}

export interface AuthUser extends User {
    id: string;
    $id: string;
    name: string;
    email: string;
    emailVerification: boolean;
    profile: Record<string, any> | null;
}
