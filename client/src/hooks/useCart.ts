import { useState, useEffect, useCallback } from "react";

// We'll store the cart globally using localStorage for persistence.
export function useCart() {
    const [cart, setCart] = useState<any[]>([]);
    const [count, setCount] = useState(0);
    const [total, setTotal] = useState(0);

    // Load cart from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("cart");
        if (saved) {
            const parsed = JSON.parse(saved);
            setCart(parsed);
            updateStats(parsed);
        }
    }, []);

    // Sync cart state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
        updateStats(cart);
    }, [cart]);

    // 🔁 Shared update function
    const updateStats = useCallback((cartItems: any[]) => {
        const totalItems = cartItems.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0
        );
        const totalAmount = cartItems.reduce(
            (sum, item) => sum + item.price * (item.quantity || 1),
            0
        );
        setCount(totalItems);
        setTotal(totalAmount);
    }, []);

    // Add item to cart
    const addToCart = useCallback(
        (item: any) => {
            setCart(prev => {
                const existing = prev.find(p => p.id === item.id);
                if (existing) {
                    return prev.map(p =>
                        p.id === item.id
                            ? { ...p, quantity: (p.quantity || 1) + 1 }
                            : p
                    );
                }
                return [...prev, { ...item, quantity: 1 }];
            });
        },
        [setCart]
    );

    // Remove item completely
    const removeFromCart = useCallback(
        (id: string) => {
            setCart(prev => prev.filter(item => item.id !== id));
        },
        [setCart]
    );

    // Decrease item quantity
    const decreaseQuantity = useCallback(
        (id: string) => {
            setCart(prev =>
                prev
                    .map(item =>
                        item.id === id
                            ? { ...item, quantity: (item.quantity || 1) - 1 }
                            : item
                    )
                    .filter(item => item.quantity > 0)
            );
        },
        [setCart]
    );

    // Clear cart
    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    return {
        cart,
        count,
        total,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        clearCart
    };
}
