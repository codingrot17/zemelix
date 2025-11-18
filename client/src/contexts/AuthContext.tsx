import React, { createContext, useContext, useEffect, useState } from "react";
import {
    getCurrentUser,
    createSession,
    deleteSession,
    registerUser,
    getUserProfile,
    sendVerificationEmail,
    startSessionMonitor,
    validateSession,
    DB_ID,
    USERS_COLLECTION_ID
} from "@/lib/appwrite";

interface AuthContextType {
    user: any | null; // shape: { id, name, email, emailVerification, role, profile }
    loading: boolean;
    verificationSent: boolean;
    isVerified: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<any>;
    logout: () => Promise<void>;
    resendVerification: () => Promise<void>;
    reloadUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [verificationSent, setVerificationSent] = useState<boolean>(false);

    useEffect(() => {
        let stopMonitor: (() => void) | null = null;

        const initAuth = async () => {
            try {
                const valid = await validateSession();
                if (!valid) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                const current = await getCurrentUser();
                if (!current) {
                    setUser(null);
                    setLoading(false);
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

    // -------------------
    // Auth actions
    // -------------------
    const handleLogin = async (email: string, password: string) => {
        try {
            await createSession(email, password);
            const current = await getCurrentUser();
            const profile = await getUserProfile(current.$id);

            setUser({
                id: current.$id,
                name: current.name,
                email: current.email,
                emailVerification: current.emailVerification,
                role: profile.role || "customer",
                profile
            });
        } catch (err) {
            console.error("Login error:", err);
            throw err;
        }
    };

    const handleRegister = async (
        email: string,
        password: string,
        name: string
    ) => {
        try {
            const newUser = await registerUser(email, password, name);
            // send verification email with redirect (adjust path if necessary)
            await sendVerificationEmail(window.location.origin + "/verify");
            setVerificationSent(true);
            return newUser;
        } catch (err) {
            console.error("Register error:", err);
            throw err;
        }
    };

    const handleLogout = async () => {
        try {
            await deleteSession();
        } catch (err) {
            console.warn("Logout error:", err);
        } finally {
            setUser(null);
        }
    };

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

    const reloadUserProfile = async () => {
        try {
            const current = await getCurrentUser();
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
        } catch (err) {
            console.warn("Failed to reload user profile:", err);
        }
    };

    // Provide the context
    const value: AuthContextType = {
        user,
        loading,
        verificationSent,
        isVerified,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        resendVerification,
        reloadUserProfile
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

// export small helper util
export const canUpgradeToVendor = (user: any): boolean => {
    if (!user) return false;

    // Only customers can upgrade
    if (user.role !== "customer") return false;

    // Must be email verified
    if (!user.emailVerification) return false;

    // Must have an active profile
    const status = user.profile?.accountStatus;
    if (status !== "active") return false;

    return true;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
