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

interface AuthContextType {
    user: any;
    loading: boolean;
    verificationSent: boolean;
    isVerified: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<any>;
    logout: () => Promise<void>;
    resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [verificationSent, setVerificationSent] = useState(false);

    // -----------------------------------
    // 🔄 Initialize and validate session
    // -----------------------------------
    useEffect(() => {
        let stopMonitor: (() => void) | null = null;

        const initAuth = async () => {
            try {
                // ✅ Step 1: Validate current session
                const validSession = await validateSession();

                if (!validSession) {
                    // No active or valid session → logout state
                    setUser(null);
                    setLoading(false);
                    return;
                }

                // ✅ Step 2: Fetch user data
                const current = await getCurrentUser();
                if (!current) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                const profile = await getUserProfile(current.$id);

                setUser({
                    id: current.$id,
                    name: current.name,
                    email: current.email,
                    emailVerification: current.emailVerification,
                    role: profile.role || "customer",
                    profile
                });

                // ✅ Step 3: Start periodic session monitor
                stopMonitor = startSessionMonitor(handleLogout);
            } catch (error) {
                console.error("Auth init error:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
        return () => stopMonitor && stopMonitor();
    }, []);

    // -----------------------------------
    // 🔐 Auth Actions
    // -----------------------------------
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
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

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
        } catch (error) {
            console.error("Register error:", error);
            throw error;
        }
    };

    const handleLogout = async () => {
        await deleteSession();
        setUser(null);
    };

    const resendVerification = async () => {
        try {
            await sendVerificationEmail(window.location.origin + "/verify");
            setVerificationSent(true);
        } catch (error) {
            console.error("Resend verification error:", error);
        }
    };

    const isVerified = !!user?.emailVerification;

    // -----------------------------------
    // 🧩 Context Provider
    // -----------------------------------
    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                verificationSent,
                isVerified,
                login: handleLogin,
                register: handleRegister,
                logout: handleLogout,
                resendVerification
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// ✅ Custom hook for easy use
export const useAuth = () => useContext(AuthContext)!;
