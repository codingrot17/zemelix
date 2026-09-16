import type { UserRole } from "@/types/auth";

export type Permission =
    | "product:create"
    | "product:read:own"
    | "product:update:own"
    | "product:delete:own"
    | "vendor:update:own"
    | "profile:update:own";

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
    admin: [
        "product:create",
        "product:read:own",
        "product:update:own",
        "product:delete:own",
        "vendor:update:own",
        "profile:update:own",
    ],
    seller: [
        "product:create",
        "product:read:own",
        "product:update:own",
        "product:delete:own",
        "vendor:update:own",
        "profile:update:own",
    ],
    vendor: [
        "product:create",
        "product:read:own",
        "product:update:own",
        "product:delete:own",
        "vendor:update:own",
        "profile:update:own",
    ],
    customer: ["profile:update:own"],
};

export function hasPermission(
    role: UserRole | null | undefined,
    permission: Permission
): boolean {
    return role ? ROLE_PERMISSIONS[role].includes(permission) : false;
}

export function ownsResource(
    currentUserId: string | null | undefined,
    ownerId: string | null | undefined
): boolean {
    return Boolean(currentUserId && ownerId && currentUserId === ownerId);
}
