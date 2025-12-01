export type UserRole = "admin" | "vendor" | "customer";

export interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: UserRole;
    country?: string;
    profile?: Record<string, any> | null; // DB profile document
}
