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
