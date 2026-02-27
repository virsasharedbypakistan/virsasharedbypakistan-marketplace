"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type WishlistItem = {
    id: number;
    name: string;
    price: string;
    priceNum: number;
    originalPrice?: string;
    vendor: string;
    badge?: string | null;
};

type WishlistContextType = {
    items: WishlistItem[];
    count: number;
    toggle: (item: WishlistItem) => void;
    isInWishlist: (id: number) => boolean;
    remove: (id: number) => void;
    clear: () => void;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<WishlistItem[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("virsa_wishlist");
            if (stored) setItems(JSON.parse(stored));
        } catch { }
    }, []);

    useEffect(() => {
        localStorage.setItem("virsa_wishlist", JSON.stringify(items));
    }, [items]);

    const toggle = useCallback((item: WishlistItem) => {
        setItems((prev) => {
            const exists = prev.find((i) => i.id === item.id);
            if (exists) return prev.filter((i) => i.id !== item.id);
            return [...prev, item];
        });
    }, []);

    const isInWishlist = useCallback((id: number) => items.some((i) => i.id === id), [items]);

    const remove = useCallback((id: number) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

    const clear = useCallback(() => setItems([]), []);

    const count = items.length;

    return (
        <WishlistContext.Provider value={{ items, count, toggle, isInWishlist, remove, clear }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
    return ctx;
}
