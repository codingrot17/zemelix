import { account } from "./client";

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

export async function getCurrentSession() {
    try {
        return await account.getSession("current");
    } catch (error: any) {
        if (error?.code === 401) return null;
        console.warn("Session check failed:", error?.message);
        return null;
    }
}

export async function validateSession(): Promise<boolean> {
    return (await getCurrentSession()) !== null;
}

export async function createSession(email: string, password: string) {
    try {
        clearAppwriteCookies();
        await account.deleteSessions().catch(() => {});
        return await account.createEmailPasswordSession(email, password);
    } catch (error) {
        console.error("Session creation failed:", error);
        throw error;
    }
}

export async function deleteSession() {
    try {
        await account.deleteSessions();
    } catch (error) {
        console.warn("Session deletion warning:", error);
    } finally {
        clearAppwriteCookies();
    }
}

export async function refreshSession() {
    try {
        await account.updateSession("current");
        return true;
    } catch {
        return false;
    }
}

export async function getCurrentAccount() {
    try {
        return await account.get();
    } catch (error: any) {
        if (error?.code === 401) return null;
        console.warn("Account fetch failed:", error?.message);
        return null;
    }
}

export async function registerUser(
    email: string,
    password: string,
    name: string
) {
    try {
        const newUser = await account.create(
            "unique()",
            email,
            password,
            name
        );
        await createSession(email, password);
        return newUser;
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
}

export async function sendVerificationEmail(redirectUrl: string) {
    try {
        return await account.createVerification(redirectUrl);
    } catch (error) {
        console.error("Verification email failed:", error);
        throw error;
    }
}

export async function verifyEmail(userId: string, secret: string) {
    try {
        const result = await account.updateVerification(userId, secret);
        await refreshSession().catch(() => {});
        return result;
    } catch (error) {
        console.error("Email verification failed:", error);
        throw error;
    }
}

export function startSessionMonitor(onExpire: () => void): () => void {
    const INTERVAL = 1000 * 60 * 10;

    const checkSession = async () => {
        try {
            await account.get();
            await refreshSession().catch(() => {});
        } catch (error: any) {
            if (error?.code === 401) onExpire();
        }
    };

    const timer = setInterval(checkSession, INTERVAL);
    return () => clearInterval(timer);
}
