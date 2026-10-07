import { useState } from "react";
import { Loader2, LogOut, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function UserSettings() {
    const { user, logout } = useAuth();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    async function handleLogout() {
        setSaving(true);
        try { await logout(); } catch (error) { console.error("Failed to log out.", error); setMessage("Unable to log out right now."); } finally { setSaving(false); }
    }

    return <div className="max-w-2xl space-y-6">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account session and basic preferences.</p></div>
        {message && <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{message}</div>}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-6 space-y-5">
            <div><h2 className="font-semibold">Account</h2><p className="text-sm text-gray-500 mt-1">{user?.email}</p></div>
            <div className="pt-4 border-t"><Button variant="outline" onClick={() => void handleLogout()} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}Sign out</Button></div>
        </div>
    </div>;
}
