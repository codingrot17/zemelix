import type { VendorProfile } from "@/types/vendor";
import type { UserProfile } from "@/types/user";

export type UserRole = "admin" | "seller" | "customer" | "vendor";

export interface User extends VendorProfile {
    id: string;
    $id?: string;
    name?: string | null;
    email?: string | null;
    emailVerification?: boolean;
    role: UserRole;
    country?: string;
    profile?: UserProfile | null;
}

export interface AuthUser extends User {
    id: string;
    $id: string;
    name: string;
    email: string;
    emailVerification: boolean;
    profile: UserProfile | null;
}
