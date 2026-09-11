import {
    getCurrentAccount,
    getUserProfile,
    createSession as createAppwriteSession,
    deleteSession as deleteAppwriteSession,
    registerUser as registerAppwriteUser,
    sendVerificationEmail as sendAppwriteVerificationEmail,
    validateSession as validateAppwriteSession,
    startSessionMonitor as startAppwriteSessionMonitor,
    verifyEmail as verifyAppwriteEmail
} from "@/lib/appwrite/account";

export async function verifyEmail(userId: string, secret: string) {
    return verifyAppwriteEmail(userId, secret);
}

export async function getAuthenticatedAccount() {
    return getCurrentAccount();
}

export async function getAuthenticatedUserProfile(userId: string) {
    return getUserProfile(userId);
}

export async function loginUser(email: string, password: string) {
    return createAppwriteSession(email, password);
}

export async function logoutUser() {
    return deleteAppwriteSession();
}

export async function registerAuthUser(
    email: string,
    password: string,
    name: string
) {
    return registerAppwriteUser(email, password, name);
}

export async function sendVerification(redirectUrl: string) {
    return sendAppwriteVerificationEmail(redirectUrl);
}

export async function isSessionValid() {
    return validateAppwriteSession();
}

export function startAuthSessionMonitor(onExpired: () => void) {
    return startAppwriteSessionMonitor(onExpired);
}
