import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode
} from "react";
import { User } from "@/types/auth";
import { register, login, logout, getCurrentUser } from "@/utils/auth";
import {
    getUserProfile,
    startSessionMonitor,
    stopSessionMonitor
} from "@/lib/appwrite";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    register: (
        email: string,
        password: string,
        fullName: string,
        role?: string,
        country?: string
    ) => Promise<User | null>;
    login: (email: string, password: string) => Promise<User | null>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 🚀 Initialize user + start session monitor
    useEffect(() => {
        const initAuth = async () => {
            try {
                const current = await getCurrentUser();
                if (current) {
                    const profile = await getUserProfile(current.id);
                    const fullUser = { ...current, profile };
                    setUser(fullUser);
                    startSessionMonitor(() => {
                        console.warn("Session expired — auto logout");
                        handleLogout();
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Init auth error:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        initAuth();

        // Cleanup monitor on unmount
        return () => stopSessionMonitor();
    }, []);

    const handleRegister = async (
        email: string,
        password: string,
        fullName: string,
        role = "customer",
        country = "Nigeria"
    ) => {
        const newUser = await register(
            email,
            password,
            fullName,
            role,
            country
        );
        if (newUser) {
            setUser(newUser);
            startSessionMonitor(() => handleLogout());
        }
        return newUser;
    };

    const handleLogin = async (email: string, password: string) => {
        const loggedUser = await login(email, password);
        if (loggedUser) {
            setUser(loggedUser);
            startSessionMonitor(() => handleLogout());
        }
        return loggedUser;
    };

    const handleLogout = async () => {
        await logout();
        setUser(null);
        stopSessionMonitor();
    };

    const refreshUser = async () => {
        const refreshed = await getCurrentUser();
        if (refreshed) {
            const profile = await getUserProfile(refreshed.id);
            setUser({ ...refreshed, profile });
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                register: handleRegister,
                login: handleLogin,
                logout: handleLogout,
                refreshUser
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
