import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Heart, Loader2, RefreshCw, ShoppingBag, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { getProduct } from "@/services/product.service";
import type { Product } from "@/types/product";

export default function UserFavorites() {
    const navigate = useNavigate();
    const { favoriteIds, toggle } = useFavorites();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const results = await Promise.all(favoriteIds.map(async id => {
                try { return await getProduct(id); } catch { return null; }
            }));
            setProducts(results.filter((item): item is Product => item !== null && item.status !== "archived" && item.status !== "draft"));
        } catch (err) {
            console.error("Failed to load favorites.", err);
            setError("Your favorites could not be loaded. Please try again.");
        } finally { setLoading(false); }
    }, [favoriteIds.join("|")]);

    useEffect(() => { void load(); }, [load]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Favorites</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Listings you have saved for later.</p></div>
                <Button variant="outline" onClick={() => void load()} disabled={loading} className="w-full sm:w-auto"><RefreshCw className={"mr-2 h-4 w-4 " + (loading ? "animate-spin" : "")} />Refresh</Button>
            </div>
            {error && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{error}</div>}
            {loading ? <div className="py-16 text-center text-gray-500"><Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />Loading favorites…</div>
                : products.length === 0 ? <div className="rounded-xl border bg-white px-6 py-14 text-center dark:border-gray-700 dark:bg-gray-900"><Heart className="mx-auto mb-3 h-10 w-10 text-pink-400" /><h2 className="font-semibold text-gray-900 dark:text-white">No favorites saved yet</h2><p className="mx-auto mt-1 max-w-md text-sm text-gray-500">Tap the heart on any product or service to save it here. Your saved listings will stay on this device.</p><Button className="mt-5" onClick={() => navigate("/collections")}><ShoppingBag className="mr-2 h-4 w-4" />Browse marketplace</Button></div>
                : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{products.map(product => <article key={product.id} className="overflow-hidden rounded-xl border bg-white dark:border-gray-700 dark:bg-gray-900"><button type="button" onClick={() => navigate("/product/" + product.id)} className="block w-full text-left"><img src={product.imageUrl || "/images/placeholder.svg"} alt={product.title} className="h-48 w-full object-cover" loading="lazy" /><div className="p-4"><div className="mb-2 flex items-start justify-between gap-2"><h2 className="line-clamp-2 font-semibold text-gray-900 dark:text-white">{product.title}</h2><span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs capitalize text-gray-600 dark:bg-gray-800 dark:text-gray-300">{product.vendorType === "service" ? "Service" : "Product"}</span></div><p className="text-lg font-bold text-indigo-600 dark:text-indigo-300">₦{Number(product.price).toLocaleString()}</p><p className="mt-1 line-clamp-2 text-sm text-gray-500">{product.shortDescription}</p></div></button><div className="flex items-center justify-between border-t px-4 py-3 dark:border-gray-700"><Button variant="outline" size="sm" onClick={() => navigate("/product/" + product.id)}>View listing</Button><Button variant="ghost" size="sm" onClick={() => { toggle(product.id); setProducts(current => current.filter(item => item.id !== product.id)); }}><Trash2 className="mr-2 h-4 w-4" />Remove</Button></div></article>)}</div>}
        </div>
    );
}
