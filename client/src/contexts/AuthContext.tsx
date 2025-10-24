import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode
} from "react";
import { User } from "../types/auth";
import {
    loginUser,
    logoutUser,
    getCurrentUser,
    getUserProfile,
    registerUser
} from "../lib/appwrite";

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

    // 🔄 Load session + profile on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                const sessionUser = await getCurrentUser();
                if (sessionUser) {
                    const profile = await getUserProfile(sessionUser.$id);
                    setUser({ ...sessionUser, profile });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const session = await account.get();
                const profile = await databases.getDocument(
                    DB_ID,
                    USERS_COLLECTION_ID,
                    session.$id
                );
                setUser({ account: session, profile });
            } catch {
                setUser(null);
            }
        };

        checkSession();
    }, []);

    // 🔐 Register Function
    const register = async (
        email: string,
        password: string,
        fullName: string,
        role: string = "customer",
        country: string = "Nigeria"
    ): Promise<User | null> => {
        try {
            const newUser = await registerUser({
                email,
                password,
                fullName,
                role,
                country
            });
            const profile = await getUserProfile(newUser.$id);
            setUser({ ...newUser, profile });
            return { ...newUser, profile };
        } catch (error) {
            console.error("Registration error:", error);
            return null;
        }
    };

    // 🔓 Login Function
    const login = async (
        email: string,
        password: string
    ): Promise<User | null> => {
        try {
            await loginUser(email, password);
            const sessionUser = await getCurrentUser();
            const profile = await getUserProfile(sessionUser.$id);
            setUser({ ...sessionUser, profile });
            return { ...sessionUser, profile };
        } catch (error) {
            console.error("Login error:", error);
            return null;
        }
    };

    // 🚪 Logout Function
    const logout = async (): Promise<void> => {
        await logoutUser();
        setUser(null);
    };

    // 🔄 Refresh User Data
    const refreshUser = async () => {
        const sessionUser = await getCurrentUser();
        if (sessionUser) {
            const profile = await getUserProfile(sessionUser.$id);
            setUser({ ...sessionUser, profile });
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, register, login, logout, refreshUser }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
