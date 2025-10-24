import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser as appwriteGetCurrentUser
} from "@/lib/appwrite";

import { User } from "@/types/auth";

export async function register(
    email: string,
    password: string,
    fullName: string,
    role: string = "customer",
    country: string = "unknown"
): Promise<User | null> {
    try {
        const userAccount = await registerUser({ email, password, fullName, role, country });

        // Appwrite returns a user object with $id, name, email, etc.
        return {
            id: userAccount.$id,
            name: userAccount.name,
            email: userAccount.email,
            role,
            country
        };
    } catch (error: any) {
        console.error("Registration error:", error?.message || error);
        return null;
    }
}

export async function login(email: string, password: string): Promise<User | null> {
    try {
        const session = await loginUser(email, password);
        const authUser = await appwriteGetCurrentUser();

        if (!authUser) return null;

        return {
            id: authUser.$id,
            name: authUser.name,
            email: authUser.email,
            role: "customer", // This should be fetched from database in next phase
            country: "unknown"
        };
    } catch (error: any) {
        console.error("Login error:", error?.message || error);
        return null;
    }
}

export async function logout(): Promise<void> {
    try {
        await logoutUser();
    } catch (error: any) {
        console.error("Logout failed:", error?.message || error);
    }
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const user = await appwriteGetCurrentUser();
        if (!user) return null;

        return {
            id: user.$id,
            name: user.name,
            email: user.email,
            role: "customer", // This will be synced with DB in next step
            country: "unknown"
        };
    } catch {
        return null;
    }
}
