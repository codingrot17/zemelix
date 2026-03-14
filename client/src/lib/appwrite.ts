/**
 * Appwrite SDK wrapper - handles all API communication
 * This is the ONLY place that directly call Appwrite SDKs
 */

import {
    Client,
    Account,
    Databases,
    ID,
    Permission,
    Role,
    Storage,
    Query
} from "appwrite";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------
const ENDPOINT =
    import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!PROJECT_ID) {
    throw new Error("VITE_APPWRITE_PROJECT_ID is required");
}

export const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
export const USERS_COLLECTION_ID = import.meta.env
    .VITE_APPWRITE_USER_COLLECTION_ID;
export const STORAGE_BUCKET_ID =
    import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || "default";

// --------------------------------------------------
// CLIENT SETUP
// --------------------------------------------------
const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query };

// --------------------------------------------------
// COOKIE MANAGEMENT
// --------------------------------------------------
function clearAppwriteCookies() {
    if (typeof document === "undefined") return;

    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const name = cookie.split("=")[0].trim();
        if (name.startsWith("a_session_")) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
    }
}

// --------------------------------------------------
// SESSION MANAGEMENT
// --------------------------------------------------

/**
 * Get current session - returns null if no active session
 */
export async function getCurrentSession() {
    try {
        return await account.getSession("current");
    } catch (error: any) {
        // 401 = not authenticated, normal case
        if (error?.code === 401) return null;
        console.warn("Session check failed:", error?.message);
        return null;
    }
}

/**
 * Validate if current session is active
 */
export async function validateSession(): Promise<boolean> {
    const session = await getCurrentSession();
    return session !== null;
}

/**
 * Create new email/password session
 */
export async function createSession(email: string, password: string) {
    try {
        // Clear any stale sessions first
        clearAppwriteCookies();
        await account.deleteSessions().catch(() => {});

        return await account.createEmailPasswordSession(email, password);
    } catch (error) {
        console.error("Session creation failed:", error);
        throw error;
    }
}

/**
 * Delete all sessions and clear cookies
 */
export async function deleteSession() {
    try {
        await account.deleteSessions();
    } catch (error) {
        console.warn("Session deletion warning:", error);
    } finally {
        clearAppwriteCookies();
    }
}

/**
 * Refresh current session
 */
export async function refreshSession() {
    try {
        await account.updateSession("current");
        return true;
    } catch {
        return false;
    }
}

// --------------------------------------------------
// ACCOUNT MANAGEMENT
// --------------------------------------------------

/**
 * Get current logged-in account
 * Returns null if not authenticated
 */
export async function getCurrentAccount() {
    try {
        const acc = await account.get();
        return acc;
    } catch (error: any) {
        if (error?.code === 401) return null;
        console.warn("Account fetch failed:", error?.message);
        return null;
    }
}

/**
 * Register new user account
 */
export async function registerUser(
    email: string,
    password: string,
    name: string
) {
    try {
        // 1. Create Appwrite account
        const newUser = await account.create(
            ID.unique(),
            email,
            password,
            name
        );

        // 2. Auto-login
        await createSession(email, password);

        // 3. Create user profile in database
        await createUserProfile(newUser.$id, email, name);

        return newUser;
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
}

// --------------------------------------------------
// USER PROFILE (DATABASE)
// --------------------------------------------------

/**
 * Create user profile document in database
 */
export async function createUserProfile(
    userId: string,
    email: string,
    name: string
) {
    if (!DB_ID || !USERS_COLLECTION_ID) {
        console.warn("Database not configured, skipping profile creation");
        return null;
    }

    try {
        return await databases.createDocument(
            DB_ID,
            USERS_COLLECTION_ID,
            userId, // Use userId as documentId
            {
                email,
                fullName: name || "",
                role: "customer",
                accountStatus: "active",
                country: "Nigeria",
                phoneNumber: "",
                vendorType: null,
                businessCategory: null,
                verificationStatus: "unverified",
                documents: [],
                businessName: null,
                businessDescription: null,
                logo: null,
                coverImage: null,
                slogan: null,
                storeStatus: "closed",
                currency: "NGN",
                featuresEnabled: [],
                dashboardLayout: null,
                subscriptionPlan: "free",
                vendorStatus: "draft",
                onboardingStep: null,
                socialLinks: null,
                primaryColor: null,
                $createdAt: new Date().toISOString()
            },
            [
                Permission.read(Role.user(userId)),
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId))
            ]
        );
    } catch (error: any) {
        console.error("Profile creation failed:", error);
        throw error;
    }
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string) {
    if (!DB_ID || !USERS_COLLECTION_ID) {
        console.warn("Database not configured");
        return null;
    }

    try {
        return await databases.getDocument(DB_ID, USERS_COLLECTION_ID, userId);
    } catch (error: any) {
        // Profile doesn't exist - create it
        if (error?.code === 404) {
            const acc = await getCurrentAccount();
            if (acc) {
                return await createUserProfile(acc.$id, acc.email, acc.name);
            }
        }
        throw error;
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    data: Record<string, any>
) {
    if (!DB_ID || !USERS_COLLECTION_ID) {
        throw new Error("Database not configured");
    }

    return await databases.updateDocument(
        DB_ID,
        USERS_COLLECTION_ID,
        userId,
        data
    );
}

// --------------------------------------------------
// EMAIL VERIFICATION
// --------------------------------------------------

/**
 * Send verification email
 */
export async function sendVerificationEmail(redirectUrl: string) {
    try {
        return await account.createVerification(redirectUrl);
    } catch (error) {
        console.error("Verification email failed:", error);
        throw error;
    }
}

/**
 * Verify email with secret
 */
export async function verifyEmail(userId: string, secret: string) {
    try {
        const result = await account.updateVerification(userId, secret);
        // Try to refresh session to update emailVerification status
        await refreshSession().catch(() => {});
        return result;
    } catch (error) {
        console.error("Email verification failed:", error);
        throw error;
    }
}

// --------------------------------------------------
// SESSION MONITOR
// --------------------------------------------------

/**
 * Start monitoring session expiry
 * Returns cleanup function
 */
export function startSessionMonitor(onExpire: () => void): () => void {
    const INTERVAL = 1000 * 60 * 10; // 10 minutes

    const checkSession = async () => {
        try {
            await account.get();
            // Try to refresh session
            await refreshSession().catch(() => {});
        } catch (error: any) {
            if (error?.code === 401) {
                onExpire();
            }
        }
    };

    const timer = setInterval(checkSession, INTERVAL);
    return () => clearInterval(timer);
}

// --------------------------------------------------
// FILE STORAGE
// --------------------------------------------------

/**
 * Upload file to storage bucket
 */
export async function uploadFile(file: File): Promise<string> {
    if (!file) throw new Error("No file provided");

    const res = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), file);
    return res.$id;
}

/**
 * Get file preview URL
 */
export function getFilePreviewUrl(
    fileId: string,
    width = 400,
    height = 400
): string {
    if (!fileId) return "";

    const endpoint = ENDPOINT.replace(/\/v1\/?$/, "");
    return `${endpoint}/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/preview?project=${PROJECT_ID}&width=${width}&height=${height}`;
}

/**
 * Delete file from storage
 */
export async function deleteFile(fileId: string) {
    return await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
}
