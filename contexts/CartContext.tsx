"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type CartItem = {
    id: number;
    name: string;
    price: string;
    priceNum: number;
    vendor: string;
    qty: number;
    image?: string;
};

type CartContextType = {
    items: CartItem[];
    count: number;
    total: number;
    addItem: (item: Omit<CartItem, "qty">) => void;
    removeItem: (id: number) => void;
    updateQty: (id: number, qty: number) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Hydrate from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("virsa_cart");
            if (stored) setItems(JSON.parse(stored));
        } catch { }
    }, []);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem("virsa_cart", JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((item: Omit<CartItem, "qty">) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    }, []);

    const removeItem = useCallback((id: number) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);

    const updateQty = useCallback((id: number, qty: number) => {
        if (qty < 1) return;
        setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const total = items.reduce((sum, i) => sum + i.priceNum * i.qty, 0);

    return (
        <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQty, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
