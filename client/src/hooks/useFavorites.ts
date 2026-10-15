import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getFavoriteIds, isFavorite, subscribeFavorites, toggleFavorite } from "@/services/favorites.service";

export function useFavorites() {
    const { user } = useAuth();
    const userId = user?.$id ?? null;
    const [ids, setIds] = useState<string[]>(() => getFavoriteIds(userId));
    useEffect(() => {
        const refresh = () => setIds(getFavoriteIds(userId));
        refresh();
        return subscribeFavorites(refresh);
    }, [userId]);
    const toggle = useCallback((id: string | number) => {
        const next = toggleFavorite(String(id), userId);
        setIds(next);
        return next.includes(String(id));
    }, [userId]);
    const has = useCallback((id: string | number) => isFavorite(String(id), userId), [userId, ids]);
    return { favoriteIds: ids, count: ids.length, has, toggle };
}
