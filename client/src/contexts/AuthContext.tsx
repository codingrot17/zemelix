/**
 * AuthContext - Single source of truth for authentication state
 */

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback
} from "react";
import {
    getAuthenticatedAccount,
    getAuthenticatedUserProfile,
    loginUser,
    logoutUser,
    registerAuthUser,
    sendVerification,
    isSessionValid,
    startAuthSessionMonitor
} from "@/services/auth.service";
import { normalizeRole } from "@/lib/authHelpers";
import type { AuthUser } from "@/types/auth";

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    verificationSent: boolean;
    isVerified: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    resendVerification: () => Promise<void>;
    refreshUser: () => Promise<void>;
    reloadUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildAuthUser(
    account: {
        $id: string;
        name: string;
        email: string;
        emailVerification: boolean;
    },
    profile: Record<string, any> | null
): AuthUser {
    return {
        id: account.$id,
        $id: account.$id,
        name: account.name,
        email: account.email,
        emailVerification: account.emailVerification,
        role: normalizeRole({ profile, role: profile?.role }),
        profile,
        vendorType: profile?.vendorType ?? null,
        businessCategory: profile?.businessCategory ?? null,
        businessName: profile?.businessName ?? null,
        businessDescription: profile?.businessDescription ?? null,
        socialLinks: profile?.socialLinks ?? null,
        primaryColor: profile?.primaryColor ?? null,
        logo: profile?.logo ?? null,
        coverImage: profile?.coverImage ?? null,
        slogan: profile?.slogan ?? null,
        onboardingStep: profile?.onboardingStep ?? null
    };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [verificationSent, setVerificationSent] = useState(false);

    useEffect(() => {
        let stopMonitor: (() => void) | null = null;

        async function initAuth() {
            try {
                const isValid = await isSessionValid();
                if (!isValid) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                const account = await getAuthenticatedAccount();
                if (!account) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                const profile = await getAuthenticatedUserProfile(account.$id);
                setUser(buildAuthUser(account, profile));
                stopMonitor = startAuthSessionMonitor(handleSessionExpired);
            } catch (error) {
                console.error("Auth init error:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        initAuth();
        return () => {
            if (stopMonitor) stopMonitor();
        };
    }, []);

    const handleSessionExpired = useCallback(() => {
        setUser(null);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        await loginUser(email, password);
        const account = await getAuthenticatedAccount();
        if (!account) throw new Error("Failed to get account after login");
        const profile = await getAuthenticatedUserProfile(account.$id);
        setUser(buildAuthUser(account, profile));
    }, []);

    const register = useCallback(
        async (email: string, password: string, name: string) => {
            await registerAuthUser(email, password, name);
            const redirectUrl =
                import.meta.env.VITE_APPWRITE_VERIFICATION_REDIRECT_URL ||
                `${window.location.origin}/verify`;
            await sendVerification(redirectUrl);
            setVerificationSent(true);
            const account = await getAuthenticatedAccount();
            if (!account)
                throw new Error("Failed to get account after registration");
            const profile = await getAuthenticatedUserProfile(account.$id);
            setUser(buildAuthUser(account, profile));
        },
        []
    );

    const logout = useCallback(async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.warn("Logout warning:", error);
        } finally {
            setUser(null);
            setVerificationSent(false);
        }
    }, []);

    const resendVerification = useCallback(async () => {
        const redirectUrl =
            import.meta.env.VITE_APPWRITE_VERIFICATION_REDIRECT_URL ||
            `${window.location.origin}/verify`;
        await sendVerification(redirectUrl);
        setVerificationSent(true);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const account = await getAuthenticatedAccount();
            if (!account) {
                setUser(null);
                return;
            }
            const profile = await getAuthenticatedUserProfile(account.$id);
            setUser(buildAuthUser(account, profile));
        } catch (error) {
            console.warn("Refresh user error:", error);
        }
    }, []);

    const value: AuthContextType = {
        user,
        loading,
        verificationSent,
        isVerified: user?.emailVerification ?? false,
        login,
        register,
        logout,
        resendVerification,
        refreshUser,
        reloadUserProfile: refreshUser
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}

export type { AuthUser } from "@/types/auth";
export { canUpgradeToVendor, hasRole } from "@/lib/authHelpers";
