I help me review all this source codes related to the authentication for any errors or bugs.

// .env
VITE_APPWRITE_ENDPOINT = "https://cloud.appwrite.io/v1"
VITE_APPWRITE_PROJECT_ID = "68bf9ed10019dexxxx"
VITE_APPWRITE_DATABASE_ID="68f4252f000aebfxxxxx"
VITE_APPWRITE_USER_COLLECTION_ID="user"

// src/contexts/AuthContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode
} from "react";
import {
    account,
    databases,
    DB_ID,
    USERS_COLLECTION_ID,
    loginUser,
    logoutUser,
    getCurrentUser
} from "@/lib/appwrite";
import { Models } from "appwrite";

interface AppUserProfile extends Models.Document {
    $id: string;
    fullName: string;
    role: "customer" | "vendor" | "admin";
    accountStatus: string;
    vendorType?: string;
    businessName?: string;
}

interface AuthContextType {
    user: AppUserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<AppUserProfile | null>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AppUserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // 🔄 Restore session on app load
    useEffect(() => {
        const fetchUserSession = async () => {
            try {
                const session = await getCurrentUser(); // Fetch authenticated Appwrite account
                if (session) {
                    await loadUserProfile(session.$id);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error restoring session:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUserSession();
    }, []);

    // 📄 Load user profile from database
    const loadUserProfile = async ($id: string) => {
        try {
            const profile = await databases.getDocument(
                DB_ID,
                USERS_COLLECTION_ID,
                $id
            );
            setUser(profile as AppUserProfile);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
        }
    };

    // 🔐 Login function (Account + Database Profile)
    const login = async (
        email: string,
        password: string
    ): Promise<AppUserProfile | null> => {
        try {
            await loginUser(email, password); // Create session
            const accountData = await account.get(); // Get account data
            await loadUserProfile(accountData.$id); // Load associated profile
            return user;
        } catch (error) {
            console.error("Login failed:", error);
            return null;
        }
    };

    // 🚪 Logout user
    const logout = async (): Promise<void> => {
        try {
            await logoutUser();
            setUser(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // 🔄 Refresh user data
    const refreshUser = async () => {
        try {
            const accountData = await account.get();
            await loadUserProfile(accountData.$id);
        } catch (error) {
            console.error("Error refreshing user:", error);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, logout, refreshUser }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 🔧 Custom Hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

// src/lib/appwrite.ts
import { Client, Account, Databases, ID } from "appwrite";

/**
 * Initialize Appwrite Client
 */
const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // Your Appwrite endpoint
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // Your Appwrite project ID

export const account = new Account(client);
export const databases = new Databases(client);

// ✅ Constants from environment variables
export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const USERS_COLLECTION_ID = import.meta.env
    .VITE_APPWRITE_USER_COLLECTION_ID;

/**
 * ✅ Register User
 * Handles both Appwrite authentication + database profile creation
 */
export async function registerUser({
    email,
    password,
    fullName,
    role = "customer", // default user role
    country = "unknown"
}: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
    country?: string;
}) {
    try {
        // Step 1: Create User Account in Appwrite auth
        const userAccount = await account.create(
            ID.unique(),
            email,
            password,
            fullName
        );

        // Step 2: Automatically login user
        await account.createEmailPasswordSession(email, password);

        // Step 3: Store profile in database (key = same user ID)
        await databases.createDocument(
            DB_ID,
            USERS_COLLECTION_ID,
            userAccount.$id,
            {
                fullName,
                email,
                role,
                country,
                accountStatus: "active",
                vendorType: null,
                businessName: "",
                verificationStatus: "unverified",
                createdAt: new Date().toISOString()
            }
        );

        return userAccount;
    } catch (error: any) {
        console.error("Appwrite Registration Error:", error?.message || error);
        throw error;
    }
}

/**
 * 🔐 Login User
 */
export async function loginUser(email: string, password: string) {
    try {
        return await account.createEmailPasswordSession(email, password);
    } catch (error: any) {
        console.error("Login Error:", error?.message || error);
        throw error;
    }
}

/**
 * 👤 Get current authenticated user
 * (from Appwrite Authentication service)
 */
export async function getCurrentUser() {
    try {
        const user = await account.get();
        return user;
    } catch {
        return null;
    }
}

/**
 * 🚪 Logout user
 */
export async function logoutUser() {
    await account.deleteSessions();
}


// src/utils/auth.ts
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser as appwriteGetCurrentUser
} from "@/lib/appwrite";

import { User } from "@/types/auth";

export async function register(
    email: string,
    password: string,
    fullName: string,
    role: string = "customer",
    country: string = "unknown"
): Promise<User | null> {
    try {
        const userAccount = await registerUser({ email, password, fullName, role, country });

        // Appwrite returns a user object with $id, name, email, etc.
        return {
            id: userAccount.$id,
            name: userAccount.name,
            email: userAccount.email,
            role,
            country
        };
    } catch (error: any) {
        console.error("Registration error:", error?.message || error);
        return null;
    }
}

export async function login(email: string, password: string): Promise<User | null> {
    try {
        const session = await loginUser(email, password);
        const authUser = await appwriteGetCurrentUser();

        if (!authUser) return null;

        return {
            id: authUser.$id,
            name: authUser.name,
            email: authUser.email,
            role: "customer", // This should be fetched from database in next phase
            country: "unknown"
        };
    } catch (error: any) {
        console.error("Login error:", error?.message || error);
        return null;
    }
}

export async function logout(): Promise<void> {
    try {
        await logoutUser();
    } catch (error: any) {
        console.error("Logout failed:", error?.message || error);
    }
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const user = await appwriteGetCurrentUser();
        if (!user) return null;

        return {
            id: user.$id,
            name: user.name,
            email: user.email,
            role: "customer", // This will be synced with DB in next step
            country: "unknown"
        };
    } catch {
        return null;
    }
}


// src/pages/auth/register.tsx
import React, { useState } from "react";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { register } from "@/utils/auth"; // Import from new Appwrite auth utils

const SignupPage: React.FC = () => {
    const navigate = useNavigate();

    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Basic validation helpers
    const isEmailValid = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isPasswordValid = (password: string) => password.length >= 6;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) return setError("Please enter your full name.");
        if (!isEmailValid(email))
            return setError("Please enter a valid email address.");
        if (!isPasswordValid(password))
            return setError("Password must be at least 6 characters.");
        if (password !== confirmPassword)
            return setError("Passwords do not match.");
        if (!termsAccepted)
            return setError("You must accept the terms and conditions.");

        setLoading(true);
        const user = await register(email, password, name);

        setLoading(false);
        if (user) {
            navigate("/dashboard");
        } else {
            setError("Registration failed. Please try again.");
        }
    };

    return (
        <AuthLayout title="Create your account">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {error && (
                    <div
                        role="alert"
                        className="text-red-600 text-center font-medium text-sm"
                    >
                        {error}
                    </div>
                )}

                {/* Name */}
                <div>
                    <Label htmlFor="name" className="mb-1 block font-semibold">
                        Full Name
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        autoComplete="name"
                        autoFocus
                    />
                </div>

                {/* Email */}
                <div>
                    <Label htmlFor="email" className="mb-1 block font-semibold">
                        Email Address
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>

                {/* Password */}
                <div className="relative">
                    <Label
                        htmlFor="password"
                        className="mb-1 block font-semibold"
                    >
                        Password
                    </Label>
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-7 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                        aria-label={
                            showPassword ? "Hide password" : "Show password"
                        }
                    >
                        {showPassword ? (
                            <EyeOff size={20} />
                        ) : (
                            <Eye size={20} />
                        )}
                    </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                    <Label
                        htmlFor="confirmPassword"
                        className="mb-1 block font-semibold"
                    >
                        Confirm Password
                    </Label>
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(v => !v)}
                        className="absolute right-3 top-7 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                        aria-label={
                            showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                        }
                    >
                        {showConfirmPassword ? (
                            <EyeOff size={20} />
                        ) : (
                            <Eye size={20} />
                        )}
                    </button>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={checked => setTermsAccepted(!!checked)}
                    />
                    <Label htmlFor="terms" className="select-none">
                        I agree to the{" "}
                        <a
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline"
                        >
                            Terms and Conditions
                        </a>
                    </Label>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        "Sign Up"
                    )}
                </Button>

                {/* Login Link */}
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-indigo-600 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default SignupPage;

// console error
cloud.appwrite.io/v1…b2523002a0093404b:1 
 Failed to load resource: the server responded with a status of 404 ()
AuthContext.tsx? [sm]:72 Error fetching user profile: AppwriteException: Document with the requested ID could not be found.
    at _Client.<anonymous> (http://localhost:5173/node_modules/.vite/deps/appwrite.js?v=b642c8a2:548:15)
    at Generator.next (<anonymous>)
    at fulfilled (http://localhost:5173/node_modules/.vite/deps/appwrite.js?v=b642c8a2:13:24)
cloud.appwrite.io/v1…b2523002a0093404b:1 
 Failed to load resource: the server responded with a status of 404 ()
AuthContext.tsx? [sm]:72 Error fetching user profile: AppwriteException: Document with the requested ID could not be found.
    at _Client.<anonymous> (http://localhost:5173/node_modules/.vite/deps/appwrite.js?v=b642c8a2:548:15)
    at Generator.next (<anonymous>)
    at fulfilled (http://localhost:5173/node_modules/.vite/deps/appwrite.js?v=b642c8a2:13:24)
appwrite.ts? [sm]:47 Appwrite is using localStorage for session management. Increase your security by adding a custom domain as your API endpoint.
appwrite.ts? [sm]:50 
 POST https://cloud.appwrite.io/v1/databases/68f4252…/collections/user/documents 400
appwrite.ts? [sm]:69 Appwrite Registration Error: Invalid document structure: Unknown attribute: "email"
auth.ts? [sm]:29 Registration error: Invalid document structure: Unknown
attribute: "email