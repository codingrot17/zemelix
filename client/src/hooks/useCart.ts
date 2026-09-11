import { useState, useEffect, useCallback } from "react";

/**
 * Centralized, module-level cart state with event emitter.
 * This allows multiple components to call useCart() directly
 * and still share the same underlying cart data without
 * requiring an explicit React Provider.
 */

/** Cart item shape — extend if needed */
export type CartItem = {
    id: string;
    title?: string;
    price: number;
    qty: number;
    imageUrl?: string;
    [key: string]: unknown;
};

const STORAGE_KEY = "cart_zemelix_v1"; // namespaced key to avoid collisions

// Module-level state and emitter
let _cart: CartItem[] = [];
const emitter =
    typeof window !== "undefined" && "Event" in window
        ? new EventTarget()
        : null;

// Helper: persist to localStorage (safe)
function persist(cart: CartItem[]) {
    try {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        }
    } catch (err) {
        // Ignore quota errors, but log in dev
        // eslint-disable-next-line no-console
        console.warn("useCart.persist failed:", err);
    }
}

// Helper: emit change to listeners
function emitChange() {
    if (emitter) {
        emitter.dispatchEvent(new Event("cart:change"));
    }
}

// Initialize module-level cart from localStorage once (safe)
(function initFromStorage() {
    try {
        if (typeof localStorage === "undefined") return;
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            _cart = [];
            return;
        }
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            _cart = parsed
                .filter(
                    (it: unknown): it is CartItem =>
                        typeof it === "object" &&
                        it !== null &&
                        typeof (it as Record<string, unknown>).id === "string" &&
                        typeof (it as Record<string, unknown>).price === "number"
                )
                .map((it: CartItem) => ({
                    ...it,
                    qty: Math.max(1, Number(it.qty) || 1)
                }));
        } else {
            _cart = [];
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("useCart: failed to load saved cart, resetting.", err);
        _cart = [];
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
    }
})();

/** Internal mutators that operate on module-level _cart and emit changes */
function _addItem(incoming: Partial<CartItem> & { id: string; price: number }) {
    const idx = _cart.findIndex(p => p.id === incoming.id);
    if (idx >= 0) {
        _cart = _cart.map(p =>
            p.id === incoming.id
                ? { ...p, qty: (p.qty || 0) + (incoming.qty || 1) }
                : p
        );
    } else {
        const newItem: CartItem = {
            id: incoming.id,
            title: incoming.title || "",
            price: incoming.price,
            qty: incoming.qty && incoming.qty > 0 ? incoming.qty : 1,
            ...incoming
        };
        _cart = [..._cart, newItem];
    }
    persist(_cart);
    emitChange();
    return _cart;
}

function _updateQty(id: string, qty: number) {
    if (qty <= 0) {
        _cart = _cart.filter(p => p.id !== id);
    } else {
        _cart = _cart.map(p => (p.id === id ? { ...p, qty } : p));
    }
    persist(_cart);
    emitChange();
    return _cart;
}

function _remove(id: string) {
    _cart = _cart.filter(p => p.id !== id);
    persist(_cart);
    emitChange();
    return _cart;
}

function _clear() {
    _cart = [];
    persist(_cart);
    emitChange();
    return _cart;
}

/**
 * Public hook: useCart()
 * - returns a local snapshot but subscribes to module-level changes
 * - writes go through the module-level mutators so all instances sync
 */
export function useCart() {
    const [items, setItems] = useState<CartItem[]>(_cart.slice());
    const [count, setCount] = useState<number>(() =>
        _cart.reduce((s, i) => s + (i.qty || 0), 0)
    );
    const [subtotal, setSubtotal] = useState<number>(() =>
        _cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0)
    );

    // derived stats updater (local)
    const updateStatsLocal = useCallback((nextItems: CartItem[]) => {
        setCount(nextItems.reduce((s, it) => s + (it.qty || 0), 0));
        setSubtotal(
            nextItems.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0)
        );
    }, []);

    // subscribe to module-level emitter
    useEffect(() => {
        const handle = () => {
            setItems(_cart.slice());
            updateStatsLocal(_cart);
        };
        // initial sync (in case module init changed _cart after mount)
        handle();

        if (!emitter) return undefined;
        const listener = () => handle();
        emitter.addEventListener("cart:change", listener);
        return () => {
            emitter.removeEventListener("cart:change", listener);
        };
    }, [updateStatsLocal]);

    // operations that modify the module-level cart and return new snapshot
    const add = useCallback(
        (incoming: Partial<CartItem> & { id: string; price: number }) => {
            const next = _addItem(incoming);
            setItems(next.slice());
            updateStatsLocal(next);
        },
        [updateStatsLocal]
    );

    const updateQty = useCallback(
        (id: string, qty: number) => {
            const next = _updateQty(id, qty);
            setItems(next.slice());
            updateStatsLocal(next);
        },
        [updateStatsLocal]
    );

    const remove = useCallback(
        (id: string) => {
            const next = _remove(id);
            setItems(next.slice());
            updateStatsLocal(next);
        },
        [updateStatsLocal]
    );

    const clear = useCallback(() => {
        const next = _clear();
        setItems(next.slice());
        updateStatsLocal(next);
    }, [updateStatsLocal]);

    // backwards-compatible aliases
    const addToCart = add;
    const removeFromCart = remove;
    const decreaseQuantity = (id: string) => {
        const item = _cart.find(i => i.id === id);
        if (item) updateQty(id, Math.max(0, item.qty - 1));
    };

    return {
        items,
        count,
        subtotal,
        add,
        updateQty,
        remove,
        clear,
        // legacy aliases
        addToCart,
        removeFromCart,
        decreaseQuantity
    };
}
