import { Client, Account, Databases, ID, Permission, Role } from "appwrite";

// ------------------------------
// 🔧 Client Setup (Safe)
// ------------------------------
const client = new Client()
    .setEndpoint(
        import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
    )
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// ✅ Keep only public values in frontend.
// ❌ Never include .setKey() or private API keys here.

export const account = new Account(client);
export const databases = new Databases(client);

// Safe environment references
const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;

// ------------------------------
// 🧠 Session Utilities (Hardened)
// ------------------------------

// Safely clear any stale cookies to prevent leaked or invalid sessions
function clearAppwriteCookies() {
    // Remove session cookies created by Appwrite in browser environment
    if (typeof document !== "undefined") {
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
            const name = cookie.split("=")[0].trim();
            if (name.startsWith("a_session_")) {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
        }
    }
}

export async function getCurrentUser() {
    try {
        return await account.get();
    } catch {
        return null;
    }
}

export async function createSession(email: string, password: string) {
    try {
        clearAppwriteCookies(); // ensure clean start
        await account.deleteSessions().catch(() => {});
        const session = await account.createEmailPasswordSession(
            email,
            password
        );
        return session;
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
    } finally {
        clearAppwriteCookies(); // ensure no leftover tokens
    }
}

export async function validateSession() {
    try {
        // Ask Appwrite for current session
        const session = await account.getSession("current");

        // If expired or invalid, it’ll throw below
        if (!session) {
            await account.deleteSessions().catch(() => {});
            return null;
        }

        return session; // valid session
    } catch (error: any) {
        // Handles expired or invalid session tokens
        if (error.code === 401) {
            console.warn("⚠️ Session expired, clearing...");
            await account.deleteSessions().catch(() => {});
            return null;
        }
        console.error("Session validation error:", error);
        return null;
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
            },
            [
                // ✅ User can manage their own document
                Permission.read(Role.user(userId)),
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId)),
                // ✅ All logged-in users can read (optional)
                Permission.read(Role.users())
            ]
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
// 📧 Email Verification (Safe + Robust)
// ------------------------------
export async function sendVerificationEmail(redirectUrl: string) {
    try {
        const session = await account.get();
        if (!session)
            throw new Error("No active session – please log in first.");
        return await account.createVerification(redirectUrl);
    } catch (error: any) {
        console.error("Verification email error:", error?.message || error);
        throw new Error("Failed to send verification email. Please try again.");
    }
}

export async function verifyEmail(userId: string, secret: string) {
    try {
        const result = await account.updateVerification(userId, secret);
        console.log("✅ Email verified successfully");

        // Optional: refresh session silently for consistent state
        try {
            await account.updateSession("current");
        } catch {
            console.warn("Session refresh skipped or user logged out");
        }

        return result;
    } catch (error: any) {
        const message =
            error?.code === 409
                ? "This email has already been verified."
                : error?.code === 401
                ? "Verification link is invalid or expired."
                : "Email verification failed. Please try again.";

        console.error("Email verification error:", message);
        throw new Error(message);
    }
}

// ------------------------------
// 🕒 Session Monitor (Safe Refresh)
// ------------------------------
export function startSessionMonitor(onExpire: () => void) {
    const interval = 1000 * 60 * 10; // every 10 minutes

    const refresh = async () => {
        try {
            const current = await account.get(); // confirm session validity
            if (!current) return onExpire();

            try {
                await account.updateSession("current");
            } catch (error: any) {
                if (error.code === 401) {
                    console.warn("⚠️ Session expired during refresh");
                    onExpire();
                }
            }
        } catch (error: any) {
            // Handles network or unknown failures gracefully
            if (error.code === 401) onExpire();
            else
                console.warn("Session check skipped:", error?.message || error);
        }
    };

    const timer = setInterval(refresh, interval);
    return () => clearInterval(timer);
}
