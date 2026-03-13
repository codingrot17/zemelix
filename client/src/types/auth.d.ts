export type UserRole = "admin" | "seller" | "customer";

export interface User {
    id: string;
    $id?: string;
    name?: string | null;
    email?: string | null;
    emailVerification?: boolean;
    role: UserRole;
    country?: string;
    profile?: Record<string, any> | null; // DB profile document
}
