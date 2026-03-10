"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

export type WishlistItem = {
    id: string;
    product_id: string;
    name: string;
    price: string;
    priceNum: number;
    originalPrice?: string;
    vendor: string;
    badge?: string | null;
    image?: string;
};

type WishlistContextType = {
    items: WishlistItem[];
    count: number;
    loading: boolean;
    toggle: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    remove: (wishlistItemId: string) => Promise<void>;
    refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const refreshWishlist = useCallback(async () => {
        if (!user) {
            setItems([]);
            return;
        }

        try {
            const res = await fetch("/api/wishlist");
            if (res.ok) {
                const data = await res.json();
                const wishlistItems = (data.data || []).map((item: any) => ({
                    id: item.id,
                    product_id: item.products.id,
                    name: item.products.name,
                    price: `Rs ${(item.products.sale_price || item.products.price).toLocaleString()}`,
                    priceNum: item.products.sale_price || item.products.price,
                    originalPrice: item.products.sale_price ? `Rs ${item.products.price.toLocaleString()}` : undefined,
                    vendor: item.products.vendors.store_name,
                    image: item.products.thumbnail_url || item.products.images?.[0],
                }));
                setItems(wishlistItems);
            }
        } catch (error) {
            console.error("Failed to fetch wishlist:", error);
        }
    }, [user]);

    useEffect(() => {
        refreshWishlist();
    }, [refreshWishlist]);

    const toggle = useCallback(async (productId: string) => {
        if (!user) {
            alert("Please login to add items to wishlist");
            return;
        }

        const existing = items.find(i => i.product_id === productId);
        
        setLoading(true);
        try {
            if (existing) {
                // Remove from wishlist
                const res = await fetch(`/api/wishlist/${existing.id}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    await refreshWishlist();
                }
            } else {
                // Add to wishlist
                const res = await fetch("/api/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ product_id: productId }),
                });
                if (res.ok) {
                    await refreshWishlist();
                }
            }
        } catch (error) {
            console.error("Failed to toggle wishlist:", error);
        } finally {
            setLoading(false);
        }
    }, [user, items, refreshWishlist]);

    const isInWishlist = useCallback((productId: string) => {
        return items.some((i) => i.product_id === productId);
    }, [items]);

    const remove = useCallback(async (wishlistItemId: string) => {
        if (!user) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/wishlist/${wishlistItemId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                await refreshWishlist();
            }
        } catch (error) {
            console.error("Failed to remove from wishlist:", error);
        } finally {
            setLoading(false);
        }
    }, [user, refreshWishlist]);

    const count = items.length;

    return (
        <WishlistContext.Provider value={{ items, count, loading, toggle, isInWishlist, remove, refreshWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
    return ctx;
}
