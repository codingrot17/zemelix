import { Client, Account, Databases, ID } from "appwrite";

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const USERS_COLLECTION_ID = import.meta.env
    .VITE_APPWRITE_USER_COLLECTION_ID;

async function clearActiveSession() {
    try {
        const current = await account.getSession("current").catch(() => null);
        if (current) await account.deleteSession("current");
    } catch {}
}

// ✅ Refresh session token (extends expiry)
export async function refreshSession() {
    try {
        const current = await account.getSession("current").catch(() => null);
        if (current) {
            const refreshed = await account.updateSession("current");
            console.info("🔄 Session refreshed:", refreshed.$id);
            return refreshed;
        }
    } catch (error) {
        console.warn("⚠️ Session refresh failed:", error);
        return null;
    }
    return null;
}

// 🕓 Monitor session expiry (every 5 mins)
let monitorInterval: NodeJS.Timeout | null = null;

export function startSessionMonitor(onExpire: () => void) {
    if (monitorInterval) clearInterval(monitorInterval);

    monitorInterval = setInterval(
        async () => {
            try {
                const session = await account
                    .getSession("current")
                    .catch(() => null);
                if (!session) {
                    console.warn("⚠️ Session expired — logging out.");
                    onExpire();
                    return;
                }

                const expiryTime = new Date(session.expire);
                const timeLeft = expiryTime.getTime() - Date.now();

                // If less than 10 minutes left, refresh
                if (timeLeft < 10 * 60 * 1000) {
                    await refreshSession();
                }
            } catch (err) {
                console.warn("Session monitor error:", err);
                onExpire();
            }
        },
        5 * 60 * 1000
    ); // every 5 minutes
}

export function stopSessionMonitor() {
    if (monitorInterval) clearInterval(monitorInterval);
    monitorInterval = null;
}

// 🔐 Register / Login / etc.
export async function registerUser({
    email,
    password,
    fullName,
    role = "customer",
    country = "Nigeria"
}) {
    try {
        await clearActiveSession();
        const user = await account.create(
            ID.unique(),
            email,
            password,
            fullName
        );
        await account.createEmailPasswordSession(email, password);

        await databases.createDocument(DB_ID, USERS_COLLECTION_ID, user.$id, {
            email,
            fullName,
            role,
            country,
            accountStatus: "active",
            verificationStatus: "unverified",
            subscriptionPlan: "free",
            storeStatus: "closed",
            currency: "NGN",
            $createdAt: new Date().toISOString()
        });

        return user;
    } catch (error) {
        console.error("Appwrite Registration Error:", error);
        throw error;
    }
}

export async function loginUser(email: string, password: string) {
    await clearActiveSession();
    return await account.createEmailPasswordSession(email, password);
}

export async function getCurrentUser() {
    try {
        const session = await account.getSession("current");
        if (!session) return null;
        return await account.get();
    } catch {
        return null;
    }
}

export async function getUserProfile(userId: string) {
    return await databases.getDocument(DB_ID, USERS_COLLECTION_ID, userId);
}

export async function logoutUser() {
    await clearActiveSession();
}
