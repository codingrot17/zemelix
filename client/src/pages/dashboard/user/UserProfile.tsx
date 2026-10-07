import { useState } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function UserProfile() {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name ?? "");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    async function save() {
        if (!user?.$id || !name.trim()) return;
        setSaving(true);
        setMessage("");
        try {
            await user.updateName(name.trim());
            setMessage("Profile updated successfully.");
        } catch (error) {
            console.error("Failed to update profile.", error);
            setMessage("Unable to update your profile right now.");
        } finally {
            setSaving(false);
        }
    }

    return <div className="max-w-2xl space-y-6">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Profile</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Manage the personal details attached to your Zemelix account.</p></div>
        {message && <div className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700"><AlertCircle className="w-4 h-4" />{message}</div>}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-6 space-y-5">
            <div><label className="block text-sm font-medium mb-2">Full name</label><input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-md border px-3 py-2 bg-transparent" /></div>
            <div><label className="block text-sm font-medium mb-2">Email</label><input value={user?.email ?? ""} disabled className="w-full rounded-md border px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-500" /><p className="text-xs text-gray-500 mt-1">Email changes are not available from this MVP profile form.</p></div>
            <Button onClick={() => void save()} disabled={saving || !name.trim()}>{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save changes</Button>
        </div>
    </div>;
}
