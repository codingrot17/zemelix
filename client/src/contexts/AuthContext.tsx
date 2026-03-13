/**
 * AuthContext - Single source of truth for authentication state
 *
 * Responsibilities:
 * - Load user on mount
 * - Provide login/logout/register methods
 * - Monitor session expiry
 * - Expose verification status
 */

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback
} from "react";
import {
    getCurrentAccount,
    getUserProfile,
    createSession,
    deleteSession,
    registerUser,
    sendVerificationEmail,
    validateSession,
    startSessionMonitor
} from "@/lib/appwrite";
import { normalizeRole } from "@/lib/authHelpers";
import type { UserRole } from "@/types/auth";

// --------------------------------------------------
// TYPES
// --------------------------------------------------
interface AuthUser {
    id: string;
    $id: string;
    name: string;
    email: string;
    emailVerification: boolean;
    role: UserRole;
    profile: Record<string, any> | null;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    verificationSent: boolean;
    isVerified: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    resendVerification: () => Promise<void>;
    reloadUserProfile: () => Promise<void>;
}

// --------------------------------------------------
// CONTEXT
// --------------------------------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);
// --------------------------------------------------
// HELPER
// --------------------------------------------------
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
        // ✅ Pass the correct object shape to normalizeRole
        role: normalizeRole({ profile, role: profile?.role }),
        profile
    };
}
// --------------------------------------------------
// PROVIDER
// --------------------------------------------------
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [verificationSent, setVerificationSent] = useState(false);

    // --------------------------------------------------
    // INITIALIZATION
    // --------------------------------------------------
    useEffect(() => {
        let stopMonitor: (() => void) | null = null;

        async function initAuth() {
            try {
                // 1. Check if session exists
                const isValid = await validateSession();
                if (!isValid) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                // 2. Fetch account
                const account = await getCurrentAccount();
                if (!account) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                // 3. Fetch profile
                const profile = await getUserProfile(account.$id);
                // 4. Build user object
                setUser(buildAuthUser(account, profile));

                // 5. Start session monitor
                stopMonitor = startSessionMonitor(handleSessionExpired);
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

    // --------------------------------------------------
    // SESSION EXPIRY HANDLER
    // --------------------------------------------------
    const handleSessionExpired = useCallback(() => {
        setUser(null);
    }, []);

    // --------------------------------------------------
    // LOGIN
    // --------------------------------------------------
    const login = useCallback(async (email: string, password: string) => {
        // 1. Create session
        await createSession(email, password);

        // 2. Fetch account
        const account = await getCurrentAccount();
        if (!account) throw new Error("Failed to get account after login");

        // 3. Fetch profile
        const profile = await getUserProfile(account.$id);
        setUser(buildAuthUser(account, profile));
    }, []);

    // --------------------------------------------------
    // REGISTER
    // --------------------------------------------------
    const register = useCallback(
        async (email: string, password: string, name: string) => {
            // 1. Register user (creates account + profile + session)
            await registerUser(email, password, name);

            // 2. Send verification email
            const redirectUrl =
                import.meta.env.VITE_APPWRITE_VERIFICATION_REDIRECT_URL ||
                `${window.location.origin}/verify`;
            await sendVerificationEmail(redirectUrl);
            setVerificationSent(true);

            // 3. Fetch fresh data
            const account = await getCurrentAccount();
            if (!account)
                throw new Error("Failed to get account after registration");

            const profile = await getUserProfile(account.$id);

            setUser(buildAuthUser(account, profile));
        },
        []
    );

    // --------------------------------------------------
    // LOGOUT
    // --------------------------------------------------
    const logout = useCallback(async () => {
        try {
            await deleteSession();
        } catch (error) {
            console.warn("Logout warning:", error);
        } finally {
            setUser(null);
            setVerificationSent(false);
        }
    }, []);

    // --------------------------------------------------
    // RESEND VERIFICATION
    // --------------------------------------------------
    const resendVerification = useCallback(async () => {
        const redirectUrl =
            import.meta.env.VITE_APPWRITE_VERIFICATION_REDIRECT_URL ||
            `${window.location.origin}/verify`;
        await sendVerificationEmail(redirectUrl);
        setVerificationSent(true);
    }, []);

    // --------------------------------------------------
    // REFRESH USER
    // --------------------------------------------------
    const refreshUser = useCallback(async () => {
        try {
            const account = await getCurrentAccount();
            if (!account) {
                setUser(null);
                return;
            }

            const profile = await getUserProfile(account.$id);

            setUser(buildAuthUser(account, profile));
        } catch (error) {
            console.warn("Refresh user error:", error);
        }
    }, []);

    // --------------------------------------------------
    // CONTEXT VALUE
    // --------------------------------------------------
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

// --------------------------------------------------
// HOOK
// --------------------------------------------------
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}

// --------------------------------------------------
// RE-EXPORT HELPERS
// --------------------------------------------------
export { canUpgradeToVendor, hasRole } from "@/lib/authHelpers";
