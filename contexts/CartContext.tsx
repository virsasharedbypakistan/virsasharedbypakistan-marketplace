"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

export type CartItem = {
    id: string;
    product_id: string;
    name: string;
    price: string;
    priceNum: number;
    vendor: string;
    qty: number;
    image?: string;
    stock: number;
};

type CartContextType = {
    items: CartItem[];
    count: number;
    total: number;
    loading: boolean;
    addItem: (productId: string, quantity?: number) => Promise<void>;
    removeItem: (cartItemId: string) => Promise<void>;
    updateQty: (cartItemId: string, qty: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const ensureGuestSession = useCallback(async () => {
        if (user) return true;

        try {
            const res = await fetch("/api/auth/guest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.error || "Failed to start guest checkout");
                return false;
            }

            return true;
        } catch (error) {
            console.error("Failed to start guest checkout:", error);
            alert("Failed to start guest checkout");
            return false;
        }
    }, [user]);

    const refreshCart = useCallback(async () => {
        try {
            const res = await fetch("/api/cart");
            if (res.status === 401) {
                setItems([]);
                return;
            }

            if (res.ok) {
                const data = await res.json();
                const cartItems = (data.data?.items || []).map((item: any) => ({
                    id: item.id,
                    product_id: item.products.id,
                    name: item.products.name,
                    price: `Rs ${item.effective_price.toLocaleString()}`,
                    priceNum: item.effective_price,
                    vendor: item.vendors.store_name,
                    qty: item.quantity,
                    image: item.products.thumbnail_url || item.products.images?.[0],
                    stock: item.products.stock,
                }));
                setItems(cartItems);
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        }
    }, []);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const addItem = useCallback(async (productId: string, quantity: number = 1) => {
        const hasSession = await ensureGuestSession();
        if (!hasSession) return;

        setLoading(true);
        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: productId, quantity }),
            });

            if (res.ok) {
                await refreshCart();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to add to cart");
            }
        } catch (error) {
            console.error("Failed to add to cart:", error);
            alert("Failed to add to cart");
        } finally {
            setLoading(false);
        }
    }, [ensureGuestSession, refreshCart]);

    const removeItem = useCallback(async (cartItemId: string) => {
        const hasSession = await ensureGuestSession();
        if (!hasSession) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/cart/${cartItemId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                await refreshCart();
            } else {
                alert("Failed to remove item");
            }
        } catch (error) {
            console.error("Failed to remove item:", error);
            alert("Failed to remove item");
        } finally {
            setLoading(false);
        }
    }, [ensureGuestSession, refreshCart]);

    const updateQty = useCallback(async (cartItemId: string, qty: number) => {
        if (qty < 1) return;
        const hasSession = await ensureGuestSession();
        if (!hasSession) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/cart/${cartItemId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: qty }),
            });

            if (res.ok) {
                await refreshCart();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to update quantity");
            }
        } catch (error) {
            console.error("Failed to update quantity:", error);
            alert("Failed to update quantity");
        } finally {
            setLoading(false);
        }
    }, [ensureGuestSession, refreshCart]);

    const clearCart = useCallback(async () => {
        const hasSession = await ensureGuestSession();
        if (!hasSession) return;

        setLoading(true);
        try {
            const res = await fetch("/api/cart", {
                method: "DELETE",
            });

            if (res.ok) {
                setItems([]);
            } else {
                alert("Failed to clear cart");
            }
        } catch (error) {
            console.error("Failed to clear cart:", error);
            alert("Failed to clear cart");
        } finally {
            setLoading(false);
        }
    }, [ensureGuestSession]);

    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const total = items.reduce((sum, i) => sum + i.priceNum * i.qty, 0);

    return (
        <CartContext.Provider value={{ items, count, total, loading, addItem, removeItem, updateQty, clearCart, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
