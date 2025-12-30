// client/src/pages/auth/login.tsx
import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isValidEmail, isValidPassword } from "@/lib/authHelpers";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Get redirect path from URL or default to dashboard
    const redirectTo = searchParams.get("redirect") || "/dashboard";

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Client-side validation
    const validateForm = (): boolean => {
        if (!email.trim()) {
            setError("Email is required");
            return false;
        }

        if (!isValidEmail(email)) {
            setError("Please enter a valid email address");
            return false;
        }

        if (!password) {
            setError("Password is required");
            return false;
        }

        if (!isValidPassword(password)) {
            setError("Password must be at least 6 characters");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate
        if (!validateForm()) return;

        setLoading(true);

        try {
            // Login via AuthContext
            await login(email, password);

            // Navigate to intended destination
            navigate(redirectTo, { replace: true });
        } catch (err: any) {
            // Display user-friendly error
            const message = err?.message || "Invalid email or password";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Welcome Back">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Error Alert */}
                {error && (
                    <div
                        role="alert"
                        className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-700 dark:text-red-300">
                            {error}
                        </span>
                    </div>
                )}

                {/* Email */}
                <div>
                    <Label htmlFor="email" className="mb-1.5">
                        Email Address
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={loading}
                        autoComplete="email"
                        autoFocus
                        className="h-11"
                    />
                </div>

                {/* Password */}
                <div>
                    <Label htmlFor="password" className="mb-1.5">
                        Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={loading}
                            autoComplete="current-password"
                            className="h-11 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={checked =>
                                setRememberMe(!!checked)
                            }
                            disabled={loading}
                        />
                        <Label
                            htmlFor="remember"
                            className="text-sm font-normal cursor-pointer"
                        >
                            Remember me
                        </Label>
                    </div>

                    <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </Button>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                            New to Zemelix?
                        </span>
                    </div>
                </div>

                {/* Register Link */}
                <Link to="/register">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11"
                    >
                        Create an account
                    </Button>
                </Link>
            </form>
        </AuthLayout>
    );
}
