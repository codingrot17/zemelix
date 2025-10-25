import {
    registerUser,
    createSession,
    deleteSession,
    getCurrentUser as appwriteGetCurrentUser,
    getUserProfile
} from "@/lib/appwrite";
import { User } from "@/types/auth";

/**
 * Register a new user account and database profile.
 * Automatically creates a session and returns basic user info.
 */
export async function register(
    email: string,
    password: string,
    fullName: string,
    role: string = "customer",
    country: string = "Nigeria"
): Promise<User | null> {
    try {
        const newUser = await registerUser(email, password, fullName);

        // Fetch current session data
        const current = await appwriteGetCurrentUser();
        if (!current) return null;

        // Fetch or auto-create profile document
        const profile = await getUserProfile(current.$id);

        return {
            id: current.$id,
            name: current.name,
            email: current.email,
            role: role,
            country: country,
            profile
        };
    } catch (error: any) {
        console.error("Registration error:", error?.message || error);
        return null;
    }
}

/**
 * Log in user safely — destroys old session if one exists.
 * Returns user + profile if successful.
 */
export async function login(
    email: string,
    password: string
): Promise<User | null> {
    try {
        await createSession(email, password);

        const authUser = await appwriteGetCurrentUser();
        if (!authUser) return null;

        const profile = await getUserProfile(authUser.$id);

        return {
            id: authUser.$id,
            name: authUser.name,
            email: authUser.email,
            role: profile?.role || "customer",
            country: profile?.country || "Nigeria",
            profile
        };
    } catch (error: any) {
        console.error("Login error:", error?.message || error);
        return null;
    }
}

/**
 * End the active Appwrite session safely.
 */
export async function logout(): Promise<void> {
    try {
        await deleteSession();
    } catch (error: any) {
        console.error("Logout failed:", error?.message || error);
    }
}

/**
 * Returns the active user (if logged in) and associated profile document.
 */
export async function getCurrentUser(): Promise<User | null> {
    try {
        const user = await appwriteGetCurrentUser();
        if (!user) return null;

        const profile = await getUserProfile(user.$id);

        return {
            id: user.$id,
            name: user.name,
            email: user.email,
            role: profile?.role || "customer",
            country: profile?.country || "Nigeria",
            profile
        };
    } catch (error: any) {
        console.error("Get current user error:", error?.message || error);
        return null;
    }
}
