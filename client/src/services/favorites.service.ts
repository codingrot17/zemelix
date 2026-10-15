import type { Product } from "@/types/product";

const LEGACY_KEY = "wishlist";
const EVENT_NAME = "zemelix:favorites-changed";

function storageKey(userId?: string | null) {
    return "zemelix:favorites:" + (userId || "guest");
}

function readIds(key: string): string[] {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(key) || "[]");
        if (!Array.isArray(parsed)) return [];
        return Array.from(new Set(parsed.filter((id): id is string => typeof id === "string" || typeof id === "number").map(String)));
    } catch { return []; }
}

export function getFavoriteIds(userId?: string | null): string[] {
    const key = storageKey(userId);
    let ids = readIds(key);
    if (userId) {
        const guest = readIds(storageKey(null));
        const legacy = readIds(LEGACY_KEY);
        if (guest.length || legacy.length) {
            ids = Array.from(new Set([...ids, ...guest, ...legacy]));
            try { localStorage.setItem(key, JSON.stringify(ids)); localStorage.removeItem(storageKey(null)); localStorage.removeItem(LEGACY_KEY); } catch { /* storage may be disabled */ }
        }
    }
    return ids;
}

export function isFavorite(id: string, userId?: string | null): boolean {
    return getFavoriteIds(userId).includes(String(id));
}

export function toggleFavorite(id: string, userId?: string | null): string[] {
    const key = storageKey(userId);
    const current = getFavoriteIds(userId);
    const normalizedId = String(id);
    const next = current.includes(normalizedId)
        ? current.filter(item => item !== normalizedId)
        : [...current, normalizedId];
    try {
        localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { userId: userId || null } }));
    } catch { throw new Error("Favorites could not be saved on this device. Check your browser storage settings."); }
    return next;
}

export function subscribeFavorites(callback: () => void): () => void {
    const listener = () => callback();
    window.addEventListener(EVENT_NAME, listener);
    window.addEventListener("storage", listener);
    return () => { window.removeEventListener(EVENT_NAME, listener); window.removeEventListener("storage", listener); };
}

export type FavoriteListing = Product;
