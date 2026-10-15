import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProduct } from "@/services/product.service";
import { getPublicSellerProfile } from "@/services/seller.service";
import { createSellerOrder } from "@/services/order.service";
import { createBookingRequest } from "@/services/booking.service";
import { listReviewsForListing } from "@/services/review.service";
import type { Review } from "@/services/review.service";
import { getCurrentAccount } from "@/lib/appwrite/account";
import { getUserProfile, updateUserProfile } from "@/lib/appwrite/database";
import { getFileViewUrl } from "@/lib/appwrite/storage";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/product";
import {
    ArrowLeft,
    Star,
    MessageCircle,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareListingButton from "@/components/shared/ShareListingButton";
import FavoriteButton from "@/components/shared/FavoriteButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
    BadgeChip,
    ListingTypeChip,
    StockLabel,
    ListingActionButton
} from "@/components/shared/ListingPrimitives";

function buildWhatsAppUrl(phone: string, title: string): string {
    const cleaned = phone.replace(/\D/g, "");
    const number = cleaned.startsWith("0") ? "234" + cleaned.slice(1) : cleaned;
    const msg = encodeURIComponent(
        `Hi! I'm interested in: *${title}* — is it still available?`
    );
    return `https://wa.me/${number}?text=${msg}`;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
                <Star
                    key={s}
                    className={`w-4 h-4 ${
                        s <= Math.round(rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                    }`}
                />
            ))}
            <span className="text-sm text-gray-500 ml-1">
                {rating > 0 ? rating.toFixed(1) : "No ratings yet"}
            </span>
        </div>
    );
}

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { add } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [sellerCoverUrl, setSellerCoverUrl] = useState("");
    const [sellerBrandColor, setSellerBrandColor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [added, setAdded] = useState(false);
    const [whatsappLoading, setWhatsappLoading] = useState(false);
    const [whatsappError, setWhatsappError] = useState<string | null>(null);
    const [whatsappPhone, setWhatsappPhone] = useState("");
    const [whatsappPhoneRequired, setWhatsappPhoneRequired] = useState(false);
    const [bookingOpen, setBookingOpen] = useState(false);
    const [bookingDateTime, setBookingDateTime] = useState("");
    const [bookingPhone, setBookingPhone] = useState("");
    const [bookingPhoneLocked, setBookingPhoneLocked] = useState(false);
    const [bookingMode, setBookingMode] = useState("In person");
    const [bookingLocation, setBookingLocation] = useState("");
    const [bookingNotes, setBookingNotes] = useState("");
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        if (!id) {
            setError("Product not found.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function loadProduct() {
            setLoading(true);
            setError(null);
            setSellerCoverUrl("");
            setSellerBrandColor(null);

            try {
                const result = await getProduct(id);
                if (cancelled) return;

                setProduct(result);

                if (result.sellerId) {
                    try {
                        const profile = await getPublicSellerProfile(result.sellerId);
                        if (!cancelled) {
                            if (profile?.coverImage) {
                                setSellerCoverUrl(getFileViewUrl(profile.coverImage));
                            }
                            if (profile?.primaryColor && /^#[0-9A-Fa-f]{6}$/.test(profile.primaryColor)) {
                                setSellerBrandColor(profile.primaryColor);
                            }
                        }
                    } catch (sellerError) {
                        console.error("Failed to load seller profile.", sellerError);
                    }
                }
            } catch (err) {
                console.error("Failed to load product.", err);
                if (!cancelled) {
                    setProduct(null);
                    setError("Product not found.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadProduct();

        return () => {
            cancelled = true;
        };
    }, [id]);

 
    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setReviewsLoading(true);
        listReviewsForListing(id)
            .then(items => { if (!cancelled) setReviews(items); })
            .catch(err => { console.error("Failed to load listing reviews.", err); if (!cancelled) setReviews([]); })
            .finally(() => { if (!cancelled) setReviewsLoading(false); });
        return () => { cancelled = true; };
    }, [id]);

    const handleAction = () => {
        if (!product) return;
        if (product.vendorType === "service") {
            setBookingError(null);
            setBookingSuccess(false);
            setBookingOpen(true);
            return;
        }
        add({
            id: product.id,
            sellerId: product.sellerId,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
            sellerWhatsapp: product.sellerWhatsapp,

            sellerName: product.sellerName,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleWhatsAppClick = async (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.preventDefault();
        event.stopPropagation();

        if (!product?.sellerWhatsapp || !product.sellerId || whatsappLoading) return;

        setWhatsappLoading(true);
        setWhatsappError(null);

        try {
            const account = await getCurrentAccount();
            if (!account?.$id) {
                throw new Error("Please sign in before contacting a seller.");
            }

            const profile = await getUserProfile(account.$id);
            const customerName = profile?.fullName?.trim() || account.name?.trim() || "";
            const customerPhone = profile?.phoneNumber?.trim() || account.phone?.trim() || whatsappPhone.trim();
            const customerEmail = profile?.email?.trim() || account.email?.trim() || "";

            if (!customerName) {
                throw new Error("Please add your name to your profile before contacting a seller.");
            }

            if (!customerPhone) {
                setWhatsappPhoneRequired(true);
                throw new Error("Enter your phone number to continue to WhatsApp.");
            }

            if (!/^\+?[0-9\s()-]{7,20}$/.test(customerPhone)) {
                throw new Error("Enter a valid phone number.");
            }

            if (!profile?.phoneNumber?.trim() && !account.phone?.trim()) {
                await updateUserProfile(account.$id, { phoneNumber: customerPhone });
                setWhatsappPhoneRequired(false);
            }

            await createSellerOrder({
                checkoutSessionId: crypto.randomUUID(),
                sellerId: product.sellerId,
                customerName,
                customerEmail: customerEmail || null,
                customerPhone,
                items: [
                    {
                        productId: product.id,
                        productTitle: product.title,
                        quantity: 1,
                        unitPrice: Number(product.price),
                        imageUrl: product.imageUrl || null
                    }
                ]
            });

            window.location.assign(
                buildWhatsAppUrl(product.sellerWhatsapp, product.title)
            );
        } catch (err) {
            console.error("Failed to create WhatsApp lead.", err);
            setWhatsappError(
                err instanceof Error
                    ? err.message
                    : "Could not start the WhatsApp chat. Please try again."
            );
        } finally {
            setWhatsappLoading(false);
        }
    };

    const openBooking = async () => {
        setBookingError(null);
        setBookingSuccess(false);
        setBookingOpen(true);
        try {
            const account = await getCurrentAccount();
            if (!account?.$id) return;
            const profile = await getUserProfile(account.$id);
            const savedPhone = profile?.phoneNumber?.trim() || account.phone?.trim() || "";
            setBookingPhone(savedPhone);
            setBookingPhoneLocked(Boolean(savedPhone));
        } catch (err) {
            console.error("Failed to prefill booking contact.", err);
        }
    };

    const buildBookingWhatsAppUrl = (phone: string) => {
        const cleaned = phone.replace(/\\D/g, "");
        const number = cleaned.startsWith("0") ? "234" + cleaned.slice(1) : cleaned;
        const date = new Date(bookingDateTime).toLocaleString();
        const message = [
            `Hi! I just submitted a booking request for *${product?.title ?? "your service"}* on Zemelix.`,
            `Preferred time: ${date}`,
            `Mode: ${bookingMode}`,
            bookingLocation.trim() ? `Location: ${bookingLocation.trim()}` : "",
            bookingNotes.trim() ? `Notes: ${bookingNotes.trim()}` : "",
        ].filter(Boolean).join("\\n");
        return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    };

    const handleBookingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!product || product.vendorType !== "service" || !product.sellerId) return;
        setBookingSubmitting(true);
        setBookingError(null);
        try {
            const account = await getCurrentAccount();
            if (!account?.$id) throw new Error("Please sign in before requesting a booking.");
            const profile = await getUserProfile(account.$id);
            const customerName = profile?.fullName?.trim() || account.name?.trim() || "";
            const customerPhone = bookingPhone.trim() || profile?.phoneNumber?.trim() || account.phone?.trim() || "";
            const customerEmail = profile?.email?.trim() || account.email?.trim() || "";
            if (!customerName) throw new Error("Please add your name to your profile first.");
            if (!customerPhone) throw new Error("Please enter your phone number.");
            if (!/^\+?[0-9\s()-]{7,20}$/.test(customerPhone)) throw new Error("Enter a valid phone number.");
            if (!profile?.phoneNumber?.trim() && !account.phone?.trim()) {
                await updateUserProfile(account.$id, { phoneNumber: customerPhone });
                setBookingPhoneLocked(true);
            }
            if (!bookingDateTime) throw new Error("Choose a preferred date and time.");
            const localDate = new Date(bookingDateTime);
            if (Number.isNaN(localDate.getTime()) || localDate.getTime() <= Date.now()) {
                throw new Error("Choose a future date and time.");
            }
            await createBookingRequest({
                serviceId: product.id,
                providerId: product.sellerId,
                requestedDateTime: localDate.toISOString(),
                customerName,
                customerPhone,
                customerEmail: customerEmail || null,
                serviceMode: bookingMode,
                serviceLocation: bookingLocation.trim() || null,
                notes: bookingNotes.trim() || null,
            });
            setBookingSuccess(true);
            setBookingOpen(false);
            if (product.sellerWhatsapp) window.location.assign(buildBookingWhatsAppUrl(product.sellerWhatsapp));
            setBookingDateTime("");
            setBookingPhone("");
            setBookingLocation("");
            setBookingNotes("");
        } catch (err) {
            console.error("Failed to create booking request.", err);
            setBookingError(err instanceof Error ? err.message : "Unable to send the booking request.");
        } finally {
            setBookingSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading…
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                <p className="text-red-500 mb-4">
                    {error ?? "This listing is unavailable."}
                </p>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    const isService = product.vendorType === "service";
    const outOfStock = !isService && product.stock === 0;
    const sellerInitials = product.sellerName
        .split(" ")
        .map(n => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div className="relative">
                    <div
                        className={`rounded-2xl overflow-hidden shadow-md border-2 ${
                            isService
                                ? "border-teal-200 dark:border-teal-800"
                                : "border-indigo-100 dark:border-indigo-900"
                        }`}
                    >
                        <img
                            src={product.imageUrl || "/images/placeholder.svg"}
                            alt={product.title}
                            className="w-full aspect-square object-cover"
                        />
                        {isService && (
                            <div className="absolute inset-0 bg-teal-900/5 pointer-events-none rounded-2xl" />
                        )}
                    </div>

                    {product.badge && (
                        <div className="absolute top-4 left-4">
                            <BadgeChip badge={product.badge} />
                        </div>
                    )}

                    <FavoriteButton id={product.id} className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-800/90" />

                    {outOfStock && (
                        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                            <span className="bg-white text-gray-800 font-bold px-4 py-2 rounded-full text-sm">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                            {product.category}
                        </span>
                        <ListingTypeChip vendorType={product.vendorType} />
                        {product.tags?.slice(0, 3).map(tag => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full text-xs"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-snug">
                        {product.title}
                    </h1>

                    <StarRating rating={reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0} />
                    <p className="text-xs text-gray-500 dark:text-gray-400">{reviews.length} {reviews.length === 1 ? "verified review" : "verified reviews"}</p>

                    <p
                        className={`text-3xl font-bold ${
                            isService
                                ? "text-teal-600 dark:text-teal-400"
                                : "text-indigo-600 dark:text-indigo-300"
                        }`}
                    >
                        ₦{Number(product.price).toLocaleString()}
                    </p>

                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                        {product.shortDescription}
                    </p>
                    {product.longDescription && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                            {product.longDescription}
                        </p>
                    )}

                    <StockLabel
                        vendorType={product.vendorType}
                        stock={product.stock}
                    />

                    <div
                        className={`p-4 rounded-xl border ${
                            isService
                                ? "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800"
                                : "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
                        }`}
                        style={sellerBrandColor ? { borderColor: sellerBrandColor } : undefined}
                    >
                        <p
                            className="text-xs font-semibold uppercase mb-3"
                            style={{ color: sellerBrandColor ?? undefined }}
                        >
                            {isService ? "Service Provider" : "Sold by"}
                        </p>

                        {sellerCoverUrl && (
                            <div className="mb-3 h-20 overflow-hidden rounded-lg">
                                <img
                                    src={sellerCoverUrl}
                                    alt=""
                                    aria-hidden="true"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {product.sellerId ? (
                            <Link
                                to={`/seller/${product.sellerId}`}
                                className="flex items-center gap-3 w-fit max-w-full cursor-pointer"
                                aria-label={`View ${product.sellerName} store`}
                            >
                                {product.sellerAvatar ? (
                                    <img
                                        src={product.sellerAvatar}
                                        alt={product.sellerName}
                                        className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700 object-cover shadow"
                                    />
                                ) : (
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow ${
                                            isService ? "bg-teal-500" : "bg-indigo-500"
                                        }`}
                                    >
                                        {sellerInitials}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {product.sellerName}
                                    </p>
                                    <ListingTypeChip
                                        vendorType={product.vendorType}
                                        size="xs"
                                    />
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                {product.sellerAvatar ? (
                                    <img
                                        src={product.sellerAvatar}
                                        alt={product.sellerName}
                                        className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700 object-cover shadow"
                                    />
                                ) : (
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow ${
                                            isService ? "bg-teal-500" : "bg-indigo-500"
                                        }`}
                                    >
                                        {sellerInitials}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {product.sellerName}
                                    </p>
                                    <ListingTypeChip
                                        vendorType={product.vendorType}
                                        size="xs"
                                    />
                                </div>
                            </div>
                        )}

                        {!isService && product.sellerWhatsapp && (
                                <>
                                    {whatsappPhoneRequired && (
                                        <div className="mt-3 space-y-2">
                                            <label htmlFor="whatsapp-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your phone number</label>
                                            <input id="whatsapp-phone" type="tel" value={whatsappPhone} onChange={event => setWhatsappPhone(event.target.value)} placeholder="+234 801 234 5678" autoComplete="tel" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500"/>
                                        </div>
                                    )}
                                    <button type="button" className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleWhatsAppClick} aria-busy={whatsappLoading} disabled={whatsappLoading}>
                                        {whatsappLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                                        {whatsappLoading ? "Starting chat…" : whatsappPhoneRequired ? "Continue to WhatsApp" : "Chat on WhatsApp"}
                                    </button>
                                    {whatsappError && <p className="mt-2 text-sm text-red-500" role="alert">{whatsappError}</p>}
                                </>
                        )}

                    <div className="flex gap-3 mt-2">
                        <ListingActionButton
                            vendorType={product.vendorType}
                            outOfStock={outOfStock}
                            added={added}
                            onClick={handleAction}
                            size="default"
                            className="flex-1"
                        />
                        <ShareListingButton
                            item={{ id: product.id, title: product.title, description: product.shortDescription || product.longDescription, price: product.price, imageUrl: product.imageUrl, listingType: isService ? "service" : "product" }}
                            compact
                            className="shrink-0"
                        />
                    </div>
                </div>
            </div>
            </div>

            <section className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8" aria-labelledby="reviews-heading">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div>
                        <h2 id="reviews-heading" className="text-xl font-bold text-gray-900 dark:text-white">Customer reviews</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reviews are tied to confirmed purchases or completed bookings.</p>
                    </div>
                    {reviews.length > 0 && <div className="flex items-center gap-2 text-sm"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><strong>{(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}</strong><span className="text-gray-500">({reviews.length})</span></div>}
                </div>
                {reviewsLoading ? (
                    <p className="text-sm text-gray-500">Loading reviews…</p>
                ) : reviews.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-sm text-gray-500">No reviews yet. Be the first eligible customer to share your experience.</div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map(review => (
                            <article key={review.$id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                                <div className="flex items-center gap-1 mb-2" aria-label={`${review.rating} out of 5 stars`}>
                                    {[1,2,3,4,5].map(star => <Star key={star} className={`w-4 h-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}
                                    <span className="ml-2 text-xs text-gray-500">Verified {review.listingType === "service" ? "booking" : "purchase"}</span>
                                </div>
                                {review.reviewText && <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{review.reviewText}</p>}
                                {review.vendorReply && <div className="mt-3 ml-3 border-l-2 border-indigo-300 pl-3"><p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Vendor response</p><p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{review.vendorReply}</p></div>}
                                <p className="mt-3 text-xs text-gray-400">{review.$createdAt ? new Date(review.$createdAt).toLocaleDateString() : ""}</p>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <Dialog open={bookingOpen} onOpenChange={open => { if (!bookingSubmitting) setBookingOpen(open); }}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Request a booking</DialogTitle><DialogDescription>Choose a preferred time. The provider will confirm the request.</DialogDescription></DialogHeader>
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <label className="block text-sm font-medium">Phone number
                            <input type="tel" required value={bookingPhone} disabled={bookingPhoneLocked} onChange={e=>setBookingPhone(e.target.value)} placeholder="e.g. 08012345678" autoComplete="tel" className="mt-1 w-full rounded-lg border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm disabled:opacity-70"/>
                        </label>
                        <label className="block text-sm font-medium">Preferred date & time
                            <input type="datetime-local" required value={bookingDateTime} onChange={e=>setBookingDateTime(e.target.value)} className="mt-1 w-full rounded-lg border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm"/>
                        </label>
                        <label className="block text-sm font-medium">Service mode
                            <select value={bookingMode} onChange={e=>setBookingMode(e.target.value)} className="mt-1 w-full rounded-lg border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm"><option>In person</option><option>Online</option><option>Phone</option><option>Provider location</option></select>
                        </label>
                        <label className="block text-sm font-medium">Location (optional)
                            <input value={bookingLocation} onChange={e=>setBookingLocation(e.target.value)} placeholder="Address or meeting details" className="mt-1 w-full rounded-lg border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm"/>
                        </label>
                        <label className="block text-sm font-medium">Notes (optional)
                            <textarea value={bookingNotes} onChange={e=>setBookingNotes(e.target.value)} rows={3} placeholder="Tell the provider anything they should know." className="mt-1 w-full rounded-lg border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm"/>
                        </label>
                        {bookingError && <p className="text-sm text-red-600" role="alert">{bookingError}</p>}
                        <div className="flex flex-col sm:flex-row gap-2"><Button type="submit" disabled={bookingSubmitting} className="w-full sm:w-auto">{bookingSubmitting ? "Sending…" : "Send booking request"}</Button><Button type="button" variant="outline" disabled={bookingSubmitting} onClick={()=>setBookingOpen(false)} className="w-full sm:w-auto">Cancel</Button></div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
