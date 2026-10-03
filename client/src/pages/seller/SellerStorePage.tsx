import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Loader2, Store } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/shared/ProductCard";
import { getFileViewUrl } from "@/lib/appwrite/storage";
import { getPublicSellerProfile } from "@/services/seller.service";
import { listProducts } from "@/services/product.service";
import type { Product } from "@/types/product";
import type { PublicSellerProfile } from "@/types/seller";

function validBrandColor(value: string | null): string | null {
    return value && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : null;
}

function socialEntries(
    value: PublicSellerProfile["socialLinks"]
): Array<[string, string]> {
    if (!value) return [];
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value) as unknown;
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
                return [];
            }
            value = Object.fromEntries(
                Object.entries(parsed).filter(
                    ([, item]) => typeof item === "string"
                )
            );
        } catch {
            return [];
        }
    }

    return Object.entries(value).filter(([, url]) =>
        /^https?:\/\//i.test(url)
    );
}

export default function SellerStorePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [seller, setSeller] = useState<PublicSellerProfile | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("Seller not found.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function loadStore() {
            setLoading(true);
            setError(null);

            try {
                const profile = await getPublicSellerProfile(id);
                if (cancelled) return;

                if (!profile) {
                    setError("Seller not found.");
                    setSeller(null);
                    setProducts([]);
                    return;
                }

                const sellerProducts = await listProducts({
                    sellerId: id,
                    activeOnly: true,
                    limit: 50
                });

                if (!cancelled) {
                    setSeller(profile);
                    setProducts(sellerProducts);
                }
            } catch (err) {
                console.error("Failed to load seller store.", err);
                if (!cancelled) {
                    setSeller(null);
                    setProducts([]);
                    setError("Unable to load this seller right now.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadStore();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const logoUrl = useMemo(
        () => (seller?.logo ? getFileViewUrl(seller.logo) : ""),
        [seller?.logo]
    );
    const coverUrl = useMemo(
        () => (seller?.coverImage ? getFileViewUrl(seller.coverImage) : ""),
        [seller?.coverImage]
    );
    const socialLinks = useMemo(
        () => socialEntries(seller?.socialLinks ?? null),
        [seller?.socialLinks]
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading seller…
            </div>
        );
    }

    if (error || !seller) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                <p className="text-red-500 mb-4">{error ?? "Seller not found."}</p>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    const displayName =
        seller.businessName?.trim() || seller.fullName?.trim() || "Seller";
    const brandColor = validBrandColor(seller.primaryColor);
    const initials = displayName
        .split(" ")
        .map(part => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            <section
                className="overflow-hidden rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm"
                style={brandColor ? { borderColor: brandColor } : undefined}
            >
                <div className="relative h-44 sm:h-56 bg-gray-100 dark:bg-zinc-800">
                    {coverUrl ? (
                        <img
                            src={coverUrl}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Store className="w-12 h-12" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/10" />
                </div>

                <div className="px-5 sm:px-8 pb-7">
                    <div className="-mt-10 relative flex flex-col sm:flex-row sm:items-end gap-4">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={displayName}
                                className="w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-zinc-900 shadow-md bg-white"
                            />
                        ) : (
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-xl font-bold border-4 border-white dark:border-zinc-900 shadow-md"
                                style={{ backgroundColor: brandColor ?? undefined }}
                            >
                                {initials}
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <p
                                className="text-xs font-semibold uppercase tracking-wide"
                                style={{ color: brandColor ?? undefined }}
                            >
                                {seller.vendorType || "Seller"}
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                {displayName}
                            </h1>
                        </div>
                    </div>

                    {seller.slogan && (
                        <p className="mt-5 text-lg text-gray-700 dark:text-gray-200">
                            {seller.slogan}
                        </p>
                    )}

                    {seller.businessDescription && (
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                            {seller.businessDescription}
                        </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {seller.businessCategory && (
                            <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-xs font-medium text-gray-600 dark:text-gray-300">
                                {seller.businessCategory}
                            </span>
                        )}
                        {socialLinks.map(([label, url]) => (
                            <a
                                key={label}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition"
                            >
                                {label}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mt-10">
                <div className="flex items-end justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Listings
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {products.length} active listing{products.length === 1 ? "" : "s"}
                        </p>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-10 text-center text-gray-500 dark:text-gray-400">
                        This seller has no active listings yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
