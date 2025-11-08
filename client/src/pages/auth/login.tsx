import React, { useState } from "react";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Github } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Validation helpers
    const isEmailValid = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isPasswordValid = (password: string) => password.length >= 6;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate inputs first
        if (!isEmailValid(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (!isPasswordValid(password)) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            // Await the auth context login to ensure session is established
            await login(email, password);

            // Only navigate after login completes and AuthContext has set user
            navigate("/dashboard");
        } catch (err: any) {
            // AuthContext throws errors on failure — surface a friendly message
            setError(err?.message || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Welcome Back">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {error && (
                    <div
                        role="alert"
                        className="text-red-600 text-center font-medium text-sm"
                    >
                        {error}
                    </div>
                )}

                {/* Email Input */}
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
                        aria-invalid={!!error}
                        required
                        autoComplete="email"
                        autoFocus
                    />
                </div>

                {/* Password Input with toggle */}
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
                        placeholder="Your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        aria-invalid={!!error}
                        required
                        autoComplete="current-password"
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

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={checked => setRememberMe(!!checked)}
                    />
                    <Label htmlFor="remember" className="select-none">
                        Remember me
                    </Label>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </Button>

                {/* Divider */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <span className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
                    OR
                    <span className="h-px flex-1 bg-gray-300 dark:bg-gray-700" />
                </div>

                {/* Social Login Buttons */}
                <div className="flex flex-col gap-3">
                    <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                        onClick={() => alert("Google login - stub")}
                    >
                        <FaGoogle className="h-5 w-5" /> Continue with Google
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                        onClick={() => alert("GitHub login - stub")}
                    >
                        <Github className="h-5 w-5" /> Continue with GitHub
                    </Button>
                </div>

                {/* Register Link */}
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-indigo-600 hover:underline"
                    >
                        Register here
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;
