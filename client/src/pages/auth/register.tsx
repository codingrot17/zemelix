// client/src/pages/auth/register.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isValidEmail, isValidPassword } from "@/lib/authHelpers";

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Validation
    const validateForm = (): boolean => {
        if (!name.trim()) {
            setError("Name is required");
            return false;
        }

        if (name.trim().length < 2) {
            setError("Name must be at least 2 characters");
            return false;
        }

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

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        if (!termsAccepted) {
            setError("You must accept the Terms and Conditions");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        // Validate
        if (!validateForm()) return;

        setLoading(true);

        try {
            // Register via AuthContext
            await register(email, password, name);

            setSuccess(true);

            // Navigate to dashboard after 2 seconds
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        } catch (err: any) {
            const message =
                err?.message || "Registration failed. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Create Your Account">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

                {/* Success Alert */}
                {success && (
                    <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="text-green-700 dark:text-green-300 font-medium">
                                Account created successfully!
                            </p>
                            <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                                Check your email for verification link.
                                Redirecting...
                            </p>
                        </div>
                    </div>
                )}

                {/* Name */}
                <div>
                    <Label htmlFor="name" className="mb-1.5">
                        Full Name
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={loading}
                        autoComplete="name"
                        autoFocus
                        className="h-10"
                    />
                </div>

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
                        className="h-10"
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
                            placeholder="Create a password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={loading}
                            autoComplete="new-password"
                            className="h-10 pr-10"
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

                {/* Confirm Password */}
                <div>
                    <Label htmlFor="confirmPassword" className="mb-1.5">
                        Confirm Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            autoComplete="new-password"
                            className="h-10 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            aria-label={
                                showConfirmPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Terms */}
                <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={checked => setTermsAccepted(!!checked)}
                        disabled={loading}
                        className="mt-1"
                    />
                    <Label
                        htmlFor="terms"
                        className="text-sm font-normal leading-relaxed cursor-pointer"
                    >
                        I agree to the{" "}
                        <Link
                            to="/terms"
                            target="_blank"
                            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
                        >
                            Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                            to="/privacy"
                            target="_blank"
                            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
                        >
                            Privacy Policy
                        </Link>
                    </Label>
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    className="w-full h-11 mt-6"
                    disabled={loading || success}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : success ? (
                        <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Account created!
                        </>
                    ) : (
                        "Create Account"
                    )}
                </Button>

                {/* Login Link */}
                <div className="text-center pt-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                        >
                            Sign in
                        </Link>
                    </span>
                </div>
            </form>
        </AuthLayout>
    );
}
