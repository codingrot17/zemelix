import {
    registerUser,
    createSession,
    deleteSession,
    getCurrentUser as appwriteGetCurrentUser,
    getUserProfile
} from "@/lib/appwrite";
import { User, UserRole } from "@/types/auth";

/**
 * Register a new user account and database profile.
 * Automatically creates a session and returns basic user info.
 */
export async function register(
    email: string,
    password: string,
    name?: string
): Promise<User> {
    // registerUser should return the Appwrite user object (newUser)
    const newUser = await registerUser(email, password, name);
    // createUserProfile is handled inside lib/appwrite registerUser (looks like)
    // return a normalized User shape expected by the app
    return {
        id: String(newUser.$id),
        name: newUser.name ?? name ?? null,
        email: newUser.email ?? null,
        role: "customer", // default role for newly registered users; app profile may override later
        country: "Nigeria",
        profile: null
    };
}

/**
 * Get the current logged in user, normalized to our User type (or null).
 */
export async function getCurrentUser(): Promise<User | null> {
    try {
        const user = await appwriteGetCurrentUser();
        if (!user) return null;

        const profile = await getUserProfile(user.$id).catch(() => null);

        // profile?.role may be a string from DB; explicitly cast/narrow it
        const rawRole = (profile && (profile.role as string)) || "customer";
        const role = (
            ["admin", "seller", "customer"].includes(rawRole)
                ? (rawRole as UserRole)
                : "customer"
        ) as UserRole;

        return {
            id: String(user.$id),
            name: user.name ?? null,
            email: user.email ?? null,
            role,
            country: profile?.country ?? "Nigeria",
            profile: profile ?? null
        };
    } catch (error: any) {
        console.error("Get current user error:", error?.message || error);
        return null;
    }
}
