/**
 * Pure helper functions for auth logic
 * No side effects, no API calls - just business rules
 */

import type { User, UserRole } from "@/types/auth";

const VALID_ROLES: UserRole[] = ["admin", "seller", "customer"];
const ROLE_ALIASES: Record<string, UserRole> = {
    vendor: "seller",
    seller: "seller",
    admin: "admin",
    customer: "customer",
    user: "customer"
};

export function normalizeRole(
    user: {
        profile?: Record<string, any> | null;
        role?: string | null;
    } | null
): UserRole {
    if (!user) return "customer";
    const raw: string | null | undefined =
        user.profile?.role ?? user.role ?? null;

    if (!raw) return "customer";
    const mapped = ROLE_ALIASES[raw.toLowerCase()];
    if (mapped) return mapped;

    if (VALID_ROLES.includes(raw as UserRole)) return raw as UserRole;

    return "customer";
}
/**
 * Check if user has any of the required roles
 */
export function hasRole(user: User | null, roles: UserRole[]): boolean {
    if (!user) return false;

    // Prioritize profile.role over top-level role
    const userRole = normalizeRole({
        profile: user.profile,
        role: user.role
    });
    return roles.includes(userRole);
}

/**
 * Check if user can upgrade to vendor
 *
 * Requirements:
 * 1. Must be logged in
 * 2. Must be a customer (not already vendor/admin)
 * 3. Must have verified email
 * 4. Must have active account status
 */
export function canUpgradeToVendor(user: any): boolean {
    if (!user) return false;

    // Must be customer
    const role = normalizeRole({ profile: user.profile, role: user.role });
    if (role !== "customer") return false;

    // Must have verified email
    if (!user.emailVerification) return false;

    // Must have active account
    const status = user.profile?.accountStatus;
    if (status && status !== "active") return false;

    return true;
}

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Check if password meets requirements
 */
export function isValidPassword(password: string): boolean {
    return typeof password === "string" && password.length >= 6;
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null): string {
    if (!user) return "Guest";
    return user.name || user.email?.split("@")[0] || "User";
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: User | null): string {
    if (!user?.name) return "U";

    return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}
