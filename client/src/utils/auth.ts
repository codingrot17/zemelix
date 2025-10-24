import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser as getAppwriteUser,
    getUserProfile
} from "@/lib/appwrite";
import { User } from "@/types/auth";

export async function register(
    email: string,
    password: string,
    fullName: string,
    role: string = "customer",
    country: string = "Nigeria"
): Promise<User | null> {
    try {
        const userAccount = await registerUser({
            email,
            password,
            fullName,
            role,
            country
        });
        const profile = await getUserProfile(userAccount.$id);
        return {
            id: userAccount.$id,
            name: userAccount.name,
            email: userAccount.email,
            role: profile?.role ?? role,
            country: profile?.country ?? country
        };
    } catch (error: any) {
        console.error("Registration error:", error?.message || error);
        return null;
    }
}

export async function login(
    email: string,
    password: string
): Promise<User | null> {
    try {
        await loginUser(email, password);
        const appwriteUser = await getAppwriteUser();
        if (!appwriteUser) return null;

        const profile = await getUserProfile(appwriteUser.$id);
        return {
            id: appwriteUser.$id,
            name: appwriteUser.name,
            email: appwriteUser.email,
            role: profile?.role ?? "customer",
            country: profile?.country ?? "Nigeria"
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
        const user = await getAppwriteUser();
        if (!user) return null;

        const profile = await getUserProfile(user.$id);
        return {
            id: user.$id,
            name: user.name,
            email: user.email,
            role: profile?.role ?? "customer",
            country: profile?.country ?? "Nigeria"
        };
    } catch {
        return null;
    }
}
