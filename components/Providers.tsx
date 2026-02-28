"use client";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            <WishlistProvider>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </WishlistProvider>
        </CartProvider>
    );
}
