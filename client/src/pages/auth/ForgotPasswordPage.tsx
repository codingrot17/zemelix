import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { isValidEmail } from "@/lib/authHelpers";
import { requestPasswordReset } from "@/services/auth.service";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        if (!email.trim() || !isValidEmail(email.trim())) {
            setError("Enter a valid email address.");
            return;
        }
        setLoading(true);
        try {
            const redirectUrl = `${window.location.origin}/reset-password`;
            await requestPasswordReset(email.trim(), redirectUrl);
        } catch {
            // Avoid revealing whether an email address has a Zemelix account.
        } finally {
            setSubmitted(true);
            setLoading(false);
        }
    }

    return (
        <AuthLayout title="Reset your password">
            {submitted ? (
                <div className="space-y-4" role="status" aria-live="polite">
                    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p>If an account matches that email address, we’ve sent a password reset link. Check your inbox and spam folder.</p>
                    </div>
                    <Link to="/login" className="block text-center text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">Return to sign in</Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <p className="text-sm text-muted-foreground">Enter the email address associated with your account and we’ll send a reset link if it matches an account.</p>
                    {error && <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
                    <div className="space-y-1.5">
                        <Label htmlFor="recovery-email">Email address</Label>
                        <Input id="recovery-email" type="email" autoComplete="email" autoFocus required value={email} onChange={e => setEmail(e.target.value)} disabled={loading} placeholder="you@example.com" className="h-11" />
                    </div>
                    <Button type="submit" className="h-11 w-full" disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending request…</> : "Send reset link"}
                    </Button>
                    <p className="text-center text-sm"><Link to="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">Back to sign in</Link></p>
                </form>
            )}
        </AuthLayout>
    );
}
