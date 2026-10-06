import React, { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSellerOrder } from "@/services/order.service";
import { getCurrentAccount } from "@/lib/appwrite/account";
import { getUserProfile, updateUserProfile } from "@/lib/appwrite/database";
import { Loader2, MessageCircle } from "lucide-react";

function buildWhatsAppUrl(phone: string, items: Array<{ title?: string; qty: number; price: number }>): string {
    const cleaned = phone.replace(/\D/g, "");
    const number = cleaned.startsWith("0") ? "234" + cleaned.slice(1) : cleaned;
    const lines = items.map(item => `• ${item.title || "Product"} × ${item.qty} — ₦${(item.price * item.qty).toLocaleString()}`);
    const message = encodeURIComponent(["Hi! I'd like to order:", ...lines, "", "Please confirm availability and the next steps."].join("\n"));
    return `https://wa.me/${number}?text=${message}`;
}

export const CartPreview: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const { items, sellerGroups, updateQty, remove, subtotal, clear } = useCart();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sellerLinks, setSellerLinks] = useState<Array<{ sellerName: string; url: string }>>([]);

    const handleCheckout = async () => {
        setCheckoutLoading(true);
        setError(null);
        try {
            const account = await getCurrentAccount();
            if (!account?.$id) throw new Error("Please sign in before contacting sellers.");
            const profile = await getUserProfile(account.$id);
            const customerName = name.trim() || profile?.fullName?.trim() || account.name?.trim() || "";
            const customerEmail = email.trim() || profile?.email?.trim() || account.email?.trim() || "";
            const customerPhone = phone.trim() || profile?.phoneNumber?.trim() || account.phone?.trim() || "";
            if (!customerName) throw new Error("Please enter your name.");
            if (!customerPhone) throw new Error("Please enter your phone number.");
            if (!/^\+?[0-9\s()-]{7,20}$/.test(customerPhone)) throw new Error("Enter a valid phone number.");
            if (!profile?.phoneNumber?.trim() && !account.phone?.trim()) await updateUserProfile(account.$id, { phoneNumber: customerPhone });

            const links: Array<{ sellerName: string; url: string }> = [];
            for (const group of sellerGroups) {
                const sellerPhone = String(group.items[0]?.sellerWhatsapp || "").trim();
                if (!sellerPhone) throw new Error("A seller in your cart does not have a WhatsApp number configured.");
                await createSellerOrder({
                    checkoutSessionId: crypto.randomUUID(),
                    sellerId: group.sellerId,
                    customerName,
                    customerEmail: customerEmail || null,
                    customerPhone,
                    items: group.items.map(item => ({
                        productId: item.id,
                        productTitle: item.title || "Product",
                        quantity: item.qty,
                        unitPrice: Number(item.price),
                        imageUrl: item.imageUrl || null
                    }))
                });
                links.push({ sellerName: String(group.items[0]?.sellerName || "Seller"), url: buildWhatsAppUrl(sellerPhone, group.items) });
            }
            setSellerLinks(links);
            clear();
        } catch (err) {
            console.error("Failed to create WhatsApp cart leads.", err);
            setError(err instanceof Error ? err.message : "Could not start the seller chats. Please try again.");
        } finally { setCheckoutLoading(false); }
    };

    if (sellerLinks.length > 0) return (
        <div className="max-w-md p-4">
            <h3 className="text-lg font-semibold mb-2">Your seller chats are ready</h3>
            <p className="text-sm text-muted-foreground mb-4">One lead was created for each seller. Open each chat to send your request.</p>
            <div className="space-y-2">
                {sellerLinks.map(link => (
                    <Button key={link.url} className="w-full justify-center gap-2" onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}>
                        <MessageCircle className="w-4 h-4" /> Chat with {link.sellerName}
                    </Button>
                ))}
            </div>
            <Button variant="ghost" className="w-full mt-2" onClick={() => { setSellerLinks([]); onClose?.(); }}>Done</Button>
        </div>
    );

    return (
        <div className="max-w-md p-4">
            <h3 className="text-lg font-semibold mb-3">Cart</h3>
            {items.length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">Your cart is empty.</div> : (
                <div className="space-y-4">
                    <div className="space-y-3">
                        {items.map(it => (
                            <div key={it.id} className="flex items-center gap-3">
                                <img src={it.imageUrl || "/images/placeholder.svg"} alt={it.title} className="h-12 w-12 rounded object-cover" />
                                <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{it.title}</div><div className="text-xs text-muted-foreground">{it.qty} × ₦{Number(it.price).toLocaleString()}</div></div>
                                <div className="flex items-center gap-2">
                                    <button className="p-1 text-sm rounded border" aria-label={"Decrease quantity of " + it.title} onClick={() => updateQty(it.id, Math.max(1, it.qty - 1))}>–</button>
                                    <div className="w-6 text-center text-sm">{it.qty}</div>
                                    <button className="p-1 text-sm rounded border" aria-label={"Increase quantity of " + it.title} onClick={() => updateQty(it.id, it.qty + 1)}>+</button>
                                    <button className="ml-2 text-xs text-red-600" aria-label={"Remove " + it.title} onClick={() => remove(it.id)}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4 space-y-3">
                        <p className="text-sm font-semibold">WhatsApp checkout</p>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" aria-label="Your full name" />
                        <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)" type="email" aria-label="Email" />
                        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 801 234 5678" type="tel" aria-label="Phone number" />
                        {sellerGroups.length > 1 && <p className="text-xs text-muted-foreground">Your cart contains {sellerGroups.length} sellers. Zemelix will create one lead per seller.</p>}
                        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
                        <div className="flex items-center justify-between"><div><div className="text-sm text-muted-foreground">Subtotal</div><div className="text-lg font-semibold">₦{Number(subtotal || 0).toLocaleString()}</div></div>
                            <Button onClick={handleCheckout} disabled={checkoutLoading} className="gap-2">{checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}{checkoutLoading ? "Creating leads…" : "Chat with sellers"}</Button>
                        </div>
                        <Button variant="ghost" className="w-full" onClick={() => clear()} disabled={checkoutLoading}>Clear</Button>
                    </div>
                </div>
            )}
        </div>
    );
};