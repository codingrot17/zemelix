import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

type FavoriteButtonProps = { id: string | number; className?: string; size?: "sm" | "md"; label?: string };

export default function FavoriteButton({ id, className = "", size = "md", label }: FavoriteButtonProps) {
    const { has, toggle } = useFavorites();
    const saved = has(id);
    return (
        <button type="button" onClick={event => { event.preventDefault(); event.stopPropagation(); toggle(id); }}
            className={"inline-flex items-center justify-center rounded-full shadow transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 " + (size === "sm" ? "p-1.5" : "p-2") + " " + className}
            aria-label={label || (saved ? "Remove from favorites" : "Add to favorites")} aria-pressed={saved} title={saved ? "Remove from favorites" : "Add to favorites"}>
            <Heart className={(size === "sm" ? "w-4 h-4" : "w-5 h-5") + " transition-colors " + (saved ? "fill-pink-500 text-pink-500" : "text-gray-400")} />
        </button>
    );
}
