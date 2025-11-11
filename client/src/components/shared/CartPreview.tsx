import React from "react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

/**
 * CartPreview — lightweight cart drawer content.
 * Uses the shared useCart hook which syncs across the app.
 */
export const CartPreview: React.FC<{ onClose?: () => void }> = ({
    onClose
}) => {
    const { items, updateQty, remove, subtotal, clear } = useCart();

    return (
        <div className="max-w-md p-4">
            <h3 className="text-lg font-semibold mb-3">Cart</h3>

            {items.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                    Your cart is empty.
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map(it => (
                        <div key={it.id} className="flex items-center gap-3">
                            <img
                                src={it.imageUrl || "/images/placeholder.svg"}
                                alt={it.title}
                                className="h-12 w-12 rounded object-cover"
                            />
                            <div className="flex-1">
                                <div className="text-sm font-medium">
                                    {it.title}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {it.qty} × ₦{Number(it.price).toFixed(2)}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    className="p-1 text-sm rounded border"
                                    aria-label={`Decrease quantity of ${it.title}`}
                                    onClick={() =>
                                        updateQty(
                                            it.id,
                                            Math.max(1, it.qty - 1)
                                        )
                                    }
                                >
                                    –
                                </button>
                                <div className="w-6 text-center text-sm">
                                    {it.qty}
                                </div>
                                <button
                                    className="p-1 text-sm rounded border"
                                    aria-label={`Increase quantity of ${it.title}`}
                                    onClick={() => updateQty(it.id, it.qty + 1)}
                                >
                                    +
                                </button>
                                <button
                                    className="ml-2 text-xs text-red-600"
                                    aria-label={`Remove ${it.title}`}
                                    onClick={() => remove(it.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="pt-3 border-t flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground">
                                Subtotal
                            </div>
                            <div className="text-lg font-semibold">
                                ₦{Number(subtotal || 0).toFixed(2)}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button onClick={() => onClose && onClose()}>
                                Checkout
                            </Button>
                            <Button variant="ghost" onClick={() => clear()}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
