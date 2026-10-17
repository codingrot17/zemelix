import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { isValidPassword } from "@/lib/authHelpers";
import { resetPassword } from "@/services/auth.service";

export default function ResetPasswordPage() {
    const [params] = useSearchParams();
    const userId = params.get("userId") ?? "";
    const secret = params.get("secret") ?? "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [complete, setComplete] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        if (!userId || !secret) {
            setError("This reset link is incomplete. Request a new password reset email.");
            return;
        }
        if (!isValidPassword(password)) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await resetPassword(userId, secret, password);
            setComplete(true);
        } catch {
            setError("This reset link may have expired or already been used. Request a new reset email and try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout title="Choose a new password">
            {complete ? (
                <div className="space-y-4" role="status" aria-live="polite">
                    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200"><CheckCircle className="mt-0.5 h-5 w-5 shrink-0" /><p>Your password has been changed. You can now sign in with your new password.</p></div>
                    <Link to="/login" className="block text-center text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">Go to sign in</Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <p className="text-sm text-muted-foreground">Choose a new password for your Zemelix account.</p>
                    {error && <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
                    <div className="space-y-1.5"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={loading} className="h-11" /></div>
                    <div className="space-y-1.5"><Label htmlFor="confirm-new-password">Confirm new password</Label><Input id="confirm-new-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={loading} className="h-11" /></div>
                    <Button type="submit" className="h-11 w-full" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating password…</> : "Update password"}</Button>
                    <p className="text-center text-sm"><Link to="/forgot-password" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">Request another reset link</Link></p>
                </form>
            )}
        </AuthLayout>
    );
}
