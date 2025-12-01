import React, { createContext, useContext, useEffect, useState } from "react";
import {
    getCurrentUser,
    createSession,
    deleteSession,
    registerUser,
    getUserProfile,
    sendVerificationEmail,
    startSessionMonitor,
    validateSession
} from "@/lib/appwrite";

import { getCurrentAccount } from "@/lib/userPrefs";

interface AuthContextType {
    user: any | null;
    loading: boolean;
    verificationSent: boolean;
    isVerified: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<any>;
    logout: () => Promise<void>;
    resendVerification: () => Promise<void>;
    reloadUserProfile: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [verificationSent, setVerificationSent] = useState<boolean>(false);

    // -------------------------------------------------
    // INITIAL BOOTSTRAP (validate session + load account)
    // -------------------------------------------------
    useEffect(() => {
        let stopMonitor: (() => void) | null = null;

        const initAuth = async () => {
            try {
                const valid = await validateSession();
                if (!valid) {
                    setUser(null);
                    return;
                }

                const current = await getCurrentAccount();
                if (!current) {
                    setUser(null);
                    return;
                }

                const profile = await getUserProfile(current.$id);

                setUser({
                    id: current.$id,
                    $id: current.$id,
                    name: current.name,
                    email: current.email,
                    emailVerification: current.emailVerification,
                    role: profile.role || "customer",
                    profile
                });

                stopMonitor = startSessionMonitor(handleLogout);
            } catch (err) {
                console.error("Auth init error:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
        return () => stopMonitor && stopMonitor();
    }, []);

    // -----------------------
    // LOGIN
    // -----------------------
    const handleLogin = async (email: string, password: string) => {
        try {
            await createSession(email, password);
            const acc = await getCurrentAccount();
            const profile = await getUserProfile(acc.$id);

            setUser({
                id: acc.$id,
                $id: acc.$id,
                name: acc.name,
                email: acc.email,
                emailVerification: acc.emailVerification,
                role: profile.role || "customer",
                profile
            });
        } catch (err) {
            console.error("Login error:", err);
            throw err;
        }
    };

    // -----------------------
    // REGISTER
    // -----------------------
    const handleRegister = async (
        email: string,
        password: string,
        name: string
    ) => {
        try {
            const newUser = await registerUser(email, password, name);
            await sendVerificationEmail(window.location.origin + "/verify");
            setVerificationSent(true);
            return newUser;
        } catch (err) {
            console.error("Register error:", err);
            throw err;
        }
    };

    // -----------------------
    // LOGOUT
    // -----------------------
    const handleLogout = async () => {
        try {
            await deleteSession();
        } catch (err) {
            console.warn("Logout error:", err);
        } finally {
            setUser(null);
        }
    };

    // -----------------------
    // RESEND VERIFICATION
    // -----------------------
    const resendVerification = async () => {
        try {
            await sendVerificationEmail(window.location.origin + "/verify");
            setVerificationSent(true);
        } catch (err) {
            console.error("resendVerification error:", err);
            throw err;
        }
    };

    const isVerified = !!user?.emailVerification;

    // -----------------------
    // HARD PROFILE RELOAD
    // -----------------------
    const reloadUserProfile = async () => {
        try {
            const acc = await getCurrentAccount();
            if (!acc) {
                setUser(null);
                return;
            }

            const profile = await getUserProfile(acc.$id);

            setUser({
                id: acc.$id,
                $id: acc.$id,
                name: acc.name,
                email: acc.email,
                emailVerification: acc.emailVerification,
                role: profile.role || "customer",
                profile
            });
        } catch (err) {
            console.warn("Failed to reload user profile:", err);
        }
    };

    // -----------------------
    // NEW: FULL REFRESH (prefs + profile)
    // -----------------------
    const refreshUser = async () => {
        try {
            const acc = await getCurrentAccount();
            if (!acc) {
                setUser(null);
                return;
            }

            const profile = await getUserProfile(acc.$id);

            setUser({
                id: acc.$id,
                $id: acc.$id,
                name: acc.name,
                email: acc.email,
                emailVerification: acc.emailVerification,
                role: profile.role || "customer",
                profile
            });
        } catch (err) {
            console.warn("refreshUser failed:", err);
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        verificationSent,
        isVerified,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        resendVerification,
        reloadUserProfile,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

// -----------------------------------------------------
// VENDOR UPGRADE UTIL
// -----------------------------------------------------
export const canUpgradeToVendor = (user: any): boolean => {
    if (!user) return false;

    if (user.role !== "customer") return false;
    if (!user.emailVerification) return false;

    const status = user.profile?.accountStatus;
    if (status !== "active") return false;

    return true;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
