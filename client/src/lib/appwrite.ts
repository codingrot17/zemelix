import {
    Client,
    Account,
    Databases,
    ID,
    Permission,
    Role,
    Storage
} from "appwrite";

// --------------------------------------------------
// CLIENT SETUP
// --------------------------------------------------
const client = new Client()
    .setEndpoint(
        import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
    )
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// SDK Instances
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Environment keys
export const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID;
export const USERS_COLLECTION_ID = import.meta.env
    .VITE_APPWRITE_USER_COLLECTION_ID;
export const STORAGE_BUCKET_ID =
    import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || "default";

// Re-export ID so other files can import it
export { ID };

// --------------------------------------------------
// COOKIE CLEAR HELPER
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
// AUTH HELPERS
// --------------------------------------------------
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
        console.warn("deleteSession:", error);
    } finally {
        clearAppwriteCookies();
    }
}

export async function validateSession() {
    try {
        return await account.getSession("current");
    } catch (error: any) {
        if (error?.code === 401) {
            try {
                await account.deleteSessions().catch(() => {});
            } catch {}
            return null;
        }
        return null;
    }
}

// --------------------------------------------------
// USER REGISTRATION + PROFILE
// --------------------------------------------------
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
                accountStatus: "active",
                country: "Nigeria",

                // Default profile fields
                phoneNumber: "",
                vendorType: "other",
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
                Permission.delete(Role.user(userId)),
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

// --------------------------------------------------
// EMAIL VERIFICATION
// --------------------------------------------------
export async function sendVerificationEmail(redirectUrl: string) {
    try {
        return await account.createVerification(redirectUrl);
    } catch (error) {
        console.error("sendVerificationEmail error:", error);
        throw error;
    }
}

export async function verifyEmail(userId: string, secret: string) {
    try {
        const result = await account.updateVerification(userId, secret);
        try {
            await account.updateSession("current");
        } catch {}
        return result;
    } catch (error) {
        console.error("verifyEmail error:", error);
        throw error;
    }
}

// --------------------------------------------------
// SESSION MONITOR
// --------------------------------------------------
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

// --------------------------------------------------
// STORAGE HELPERS
// --------------------------------------------------
export async function uploadFileToBucket(file: File) {
    if (!file) throw new Error("No file provided");

    const bucket = STORAGE_BUCKET_ID;
    const res = await storage.createFile(bucket, ID.unique(), file);

    return res.$id;
}

export function getFilePreviewUrl(fileId: string, width = 400, height = 400) {
    if (!fileId) return "";

    const endpoint = (
        import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
    ).replace(/\/v1\/?$/, "");
    const project = import.meta.env.VITE_APPWRITE_PROJECT_ID;

    return `${endpoint}/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/preview?project=${project}&width=${width}&height=${height}`;
}
