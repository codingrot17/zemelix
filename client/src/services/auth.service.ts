import type { UserProfile } from "@/types/user";
import {
    getCurrentAccount,
    createSession as createAppwriteSession,
    deleteSession as deleteAppwriteSession,
    deleteAllSessions as deleteAllAppwriteSessions,
    registerUser as registerAppwriteUser,
    sendVerificationEmail as sendAppwriteVerificationEmail,
    validateSession as validateAppwriteSession,
    startSessionMonitor as startAppwriteSessionMonitor,
    verifyEmail as verifyAppwriteEmail,
    requestPasswordRecovery as requestAppwritePasswordRecovery,
    completePasswordRecovery as completeAppwritePasswordRecovery
} from "@/lib/appwrite/account";
import { getUserProfile } from "@/lib/appwrite/database";

export async function verifyEmail(userId: string, secret: string) {
    return verifyAppwriteEmail(userId, secret);
}
export async function getAuthenticatedAccount() { return getCurrentAccount(); }
export async function getAuthenticatedUserProfile(userId: string): Promise<UserProfile | null> {
    return getUserProfile(userId);
}
export async function loginUser(email: string, password: string) {
    return createAppwriteSession(email, password);
}
export async function logoutUser() { return deleteAppwriteSession(); }
export async function logoutAllDevices() { return deleteAllAppwriteSessions(); }
export async function registerAuthUser(email: string, password: string, name: string) {
    return registerAppwriteUser(email, password, name);
}
export async function sendVerification(redirectUrl: string) {
    return sendAppwriteVerificationEmail(redirectUrl);
}
export async function requestPasswordReset(email: string, redirectUrl: string) {
    return requestAppwritePasswordRecovery(email, redirectUrl);
}
export async function resetPassword(userId: string, secret: string, password: string) {
    return completeAppwritePasswordRecovery(userId, secret, password, password);
}
export async function isSessionValid() { return validateAppwriteSession(); }
export function startAuthSessionMonitor(onExpired: () => void) {
    return startAppwriteSessionMonitor(onExpired);
}
