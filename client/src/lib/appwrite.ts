
import { Client, Account, Databases, ID } from "appwrite";

// ------------------------------
// 🔧 Client Setup
// ------------------------------
const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;

// ------------------------------
// 🧠 Session Utilities
// ------------------------------
export async function getCurrentUser() {
    try {
        return await account.get();
    } catch {
        return null;
    }
}

export async function createSession(email: string, password: string) {
    try {
        // Ensure clean session before creating new one
        await account.deleteSessions().catch(() => {});
        return await account.createEmailPasswordSession(email, password);
    } catch (error) {
        console.error("Session creation error:", error);
        throw error;
    }
}

export async function deleteSession() {
    try {
        await account.deleteSessions();
    } catch (error) {
        console.warn("No active session:", error);
    }
}

// ------------------------------
// 👤 Registration & Profile
// ------------------------------
export async function registerUser(
    email: string,
    password: string,
    name: string
) {
    try {
        const newUser = await account.create(
            ID.unique(),
            email,
            password,
            name
        );
        await createSession(email, password);
        await createUserProfile(newUser.$id, email, name);
        return newUser;
    } catch (error) {
        console.error("Appwrite registration error:", error);
        throw error;
    }
}

// Automatically creates user profile if missing
export async function createUserProfile(
    userId: string,
    email: string,
    name: string
) {
    try {
        return await databases.createDocument(
            DB_ID,
            USERS_COLLECTION_ID,
            userId,
            {
                email,
                fullName: name || "",
                role: "customer",
                country: "Nigeria",
                accountStatus: "active",
                verificationStatus: "unverified",
                subscriptionPlan: "free",
                storeStatus: "closed",
                currency: "NGN",
                $createdAt: new Date().toISOString()
            }
        );
    } catch (error) {
        console.error("Profile creation error:", error);
        throw error;
    }
}

export async function getUserProfile(userId: string) {
    try {
        return await databases.getDocument(DB_ID, USERS_COLLECTION_ID, userId);
    } catch (error: any) {
        if (error.code === 404) {
            console.warn("User profile not found, creating a new one...");
            const current = await account.get();
            return await createUserProfile(
                current.$id,
                current.email,
                current.name
            );
        }
        throw error;
    }
}

// ------------------------------
// 📧 Email Verification
// ------------------------------
export async function sendVerificationEmail(redirectUrl: string) {
    try {
        return await account.createVerification(redirectUrl);
    } catch (error) {
        console.error("Verification email error:", error);
        throw error;
    }
}

export async function verifyEmail(userId: string, secret: string) {
    try {
        const result = await account.updateVerification(userId, secret);
        console.log("✅ Email verified successfully");
        return result;
    } catch (error) {
        console.error("Email verification error:", error);
        throw error;
    }
}

// ------------------------------
// 🕒 Session Monitor
// ------------------------------
export function startSessionMonitor(onExpire: () => void) {
    const interval = 1000 * 60 * 10; // every 10 minutes

    const refresh = async () => {
        const current = await getCurrentUser();
        if (!current) return onExpire();

        try {
            await account.updateSession("current");
        } catch (error: any) {
            if (error.code === 401) onExpire();
        }
    };

    const timer = setInterval(refresh, interval);
    return () => clearInterval(timer);
}
