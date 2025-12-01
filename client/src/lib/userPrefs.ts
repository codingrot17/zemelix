import type { Preferences } from "./types";
import { account } from "@/lib/appwrite";

/**
 * Update current user's Appwrite prefs.
 * Only keys provided will be merged.
 *
 * Returns the full updated account object.
 */
export async function updateUserPrefs(prefs: Partial<Preferences>) {
    try {
        // Appwrite Account.updatePrefs merges keys automatically.
        // Cast required because some SDK versions lack typings for updatePrefs.
        const updated = await (account as any).updatePrefs(prefs);
        return updated;
    } catch (err) {
        console.error("updateUserPrefs error:", err);
        throw err;
    }
}

/**
 * Get the current logged-in account with fresh prefs.
 * Returns null if there is no active session.
 *
 * Used by AuthProvider.refreshUser() and onboarding flows.
 */
export async function getCurrentAccount() {
    try {
        const acc = await account.get();

        // Normalize missing fields so UI never breaks
        return {
            ...acc,
            prefs: {
                role: acc.prefs?.role ?? "customer",
                country: acc.prefs?.country ?? "",
                onboardingComplete: acc.prefs?.onboardingComplete ?? false,
                businessName: acc.prefs?.businessName ?? "",
                businessCategory: acc.prefs?.businessCategory ?? "",
                approvedVendor: acc.prefs?.approvedVendor ?? false,
                accountStatus: acc.prefs?.accountStatus ?? "active",
                ...acc.prefs
            }
        };
    } catch (err) {
        console.warn("getCurrentAccount:", err);
        return null;
    }
}
