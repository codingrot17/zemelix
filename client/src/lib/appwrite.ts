// client/src/lib/appwrite.ts
import {
    Client,
    Account,
    Databases,
    ID,
    Permission,
    Role,
    Storage
} from "appwrite";

const client = new Client()
    .setEndpoint(
        import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
    )
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// SDK instances
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Environment keys (standardized)
export const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
export const USERS_COLLECTION_ID = import.meta.env
    .VITE_APPWRITE_USER_COLLECTION_ID;
export const STORAGE_BUCKET_ID =
    import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || "default";

// ------------------------------
// Session helpers
// ------------------------------
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

export async function getCurrentUser() {
    try {
        return await account.get();
    } catch {
        return null;
    }
}

export async function createSession(email: string, password: string) {
    try {
        clearAppwriteCookies();
        // delete any existing sessions first
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
        console.warn("deleteSession:", error);
    } finally {
        clearAppwriteCookies();
    }
}

export async function validateSession() {
    try {
        const session = await account.getSession("current");
        return session;
    } catch (error: any) {
        if (error?.code === 401) {
            // session expired or invalid
            try {
                await account.deleteSessions().catch(() => {});
            } catch {}
            return null;
        }
        return null;
    }
}

// ------------------------------
// Registration & profile helpers
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
        // create session for the new user
        await createSession(email, password);
        // create default user profile document in DB
        await createUserProfile(newUser.$id, email, name);
        return newUser;
    } catch (error) {
        console.error("registerUser error:", error);
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
                featuresEnabled: [],
                dashboardLayout: null,
                $createdAt: new Date().toISOString()
            },
            [
                // owner can manage their document
                Permission.read(Role.user(userId)),
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId)),
                // optionally allow authenticated users to read public profile
                Permission.read(Role.users())
            ]
        );
    } catch (error) {
        console.error("createUserProfile error:", error);
        throw error;
    }
}

export async function getUserProfile(userId: string) {
    try {
        return await databases.getDocument(DB_ID, USERS_COLLECTION_ID, userId);
    } catch (error: any) {
        // If no profile exists, try to create one from the account
        if (error?.code === 404) {
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
// Email verification
// ------------------------------
export async function sendVerificationEmail(redirectUrl: string) {
    try {
        return await account.createVerification(redirectUrl);
    } catch (error: any) {
        console.error("sendVerificationEmail error:", error);
        throw error;
    }
}

export async function verifyEmail(userId: string, secret: string) {
    try {
        const result = await account.updateVerification(userId, secret);
        // optional attempt to refresh session
        try {
            await account.updateSession("current");
        } catch {}
        return result;
    } catch (error: any) {
        console.error("verifyEmail error:", error);
        throw error;
    }
}

// ------------------------------
// Session monitor
// ------------------------------
export function startSessionMonitor(onExpire: () => void) {
    const interval = 1000 * 60 * 10; // 10 minutes
    const refresh = async () => {
        try {
            await account.get();
            try {
                await account.updateSession("current");
            } catch (err: any) {
                if (err?.code === 401) onExpire();
            }
        } catch (err: any) {
            if (err?.code === 401) onExpire();
        }
    };
    const timer = setInterval(refresh, interval);
    return () => clearInterval(timer);
}

// ------------------------------
// Storage helpers (file upload + preview)
// ------------------------------
export async function uploadFileToBucket(file: File) {
    if (!file) throw new Error("No file provided");
    const bucket = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || "default";
    const res = await storage.createFile(bucket, ID.unique(), file);
    return res.$id;
}

// Helper: get preview URL — Appwrite SDK provides getFilePreview/getFileView methods, but in browser we can construct preview fetch
export function getFilePreviewUrl(fileId: string, width = 400, height = 400) {
    if (!fileId) return "";
    // SDK method getFilePreview can be used, but returning a URL path compatible with Appwrite's endpoints:
    const endpoint = (
        import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
    ).replace(/\/v1\/?$/, "");
    const project = import.meta.env.VITE_APPWRITE_PROJECT_ID;
    // Appwrite file preview endpoint:
    return `${endpoint}/storage/buckets/${
        import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || "default"
    }/files/${fileId}/preview?project=${project}&width=${width}&height=${height}`;
}
