"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type NotifRole = "customer" | "vendor" | "admin";

export type Notification = {
    id: string;
    role: NotifRole;
    type: "order" | "promo" | "system" | "review" | "payment" | "vendor" | "alert";
    title: string;
    message: string;
    time: string;
    read: boolean;
    link?: string;
};

const MOCK: Notification[] = [
    // Customer notifications
    { id: "c1", role: "customer", type: "order", title: "Order Shipped!", message: "Your order #ORD-8821 has been shipped. Expected delivery: March 2.", time: "2m ago", read: false, link: "/dashboard/orders" },
    { id: "c2", role: "customer", type: "order", title: "Order Delivered", message: "Order #ORD-8810 has been delivered. Enjoy your purchase!", time: "1h ago", read: false, link: "/dashboard/orders" },
    { id: "c3", role: "customer", type: "promo", title: "Flash Sale — 40% Off!", message: "Today only: Electronics category on mega discount. Don't miss out!", time: "3h ago", read: false, link: "/products" },
    { id: "c4", role: "customer", type: "review", title: "Review Requested", message: "How was your recent order from Tech Haven PK? Leave a review.", time: "1d ago", read: true, link: "/dashboard/reviews" },
    { id: "c5", role: "customer", type: "system", title: "Password Changed", message: "Your account password was changed successfully. If this wasn't you, contact support.", time: "2d ago", read: true },
    { id: "c6", role: "customer", type: "promo", title: "Exclusive Deal for You", message: "You have a special 15% off coupon waiting. Use code VIRSA15.", time: "3d ago", read: true, link: "/products" },

    // Vendor notifications
    { id: "v1", role: "vendor", type: "order", title: "New Order Received!", message: "Order #ORD-9921 for 'Premium Headphones Pro' just arrived. Process it now.", time: "5m ago", read: false, link: "/vendor/dashboard/orders" },
    { id: "v2", role: "vendor", type: "order", title: "Order Cancelled", message: "Customer cancelled order #ORD-9904. Check your dashboard for details.", time: "40m ago", read: false, link: "/vendor/dashboard/orders" },
    { id: "v3", role: "vendor", type: "payment", title: "Payment Released", message: "Rs 12,400 has been transferred to your bank account (HBL ****1234).", time: "2h ago", read: false, link: "/vendor/dashboard/earnings" },
    { id: "v4", role: "vendor", type: "review", title: "New 5-Star Review", message: "Ahmad K. left a 5-star review on your Mechanical Keyboard listing.", time: "5h ago", read: true, link: "/vendor/dashboard" },
    { id: "v5", role: "vendor", type: "system", title: "Product Approved", message: "Your product 'Smart Watch Series X' has been approved and is now live.", time: "1d ago", read: true, link: "/vendor/dashboard/products" },
    { id: "v6", role: "vendor", type: "alert", title: "Low Stock Alert", message: "USB-C Hub is running low — only 3 items left. Consider restocking.", time: "2d ago", read: true, link: "/vendor/dashboard/products" },

    // Admin notifications
    { id: "a1", role: "admin", type: "vendor", title: "New Vendor Application", message: "StyleMates Boutique has submitted a new vendor application. Review now.", time: "10m ago", read: false, link: "/admin/dashboard/vendors" },
    { id: "a2", role: "admin", type: "alert", title: "Vendor Suspended", message: "Vendor 'QuickShip Co.' was auto-suspended due to 3 fraud reports.", time: "1h ago", read: false, link: "/admin/dashboard/vendors" },
    { id: "a3", role: "admin", type: "payment", title: "Withdrawal Request", message: "Tech Haven PK has requested a withdrawal of Rs 85,000. Approve or Reject.", time: "2h ago", read: false, link: "/admin/dashboard/withdrawals" },
    { id: "a4", role: "admin", type: "order", title: "Dispute Opened", message: "Customer filed a dispute on order #ORD-7741. Action required.", time: "4h ago", read: true, link: "/admin/dashboard/orders" },
    { id: "a5", role: "admin", type: "system", title: "System Backup Complete", message: "Nightly database backup completed successfully at 2:00 AM.", time: "8h ago", read: true },
    { id: "a6", role: "admin", type: "vendor", title: "New Vendor Registered", message: "Home Luxe Store just completed vendor registration and is pending review.", time: "1d ago", read: true, link: "/admin/dashboard/vendors" },
];

type NotifCtx = {
    all: Notification[];
    forRole: (role: NotifRole) => Notification[];
    unreadCount: (role: NotifRole) => number;
    markRead: (id: string) => void;
    markAllRead: (role: NotifRole) => void;
    remove: (id: string) => void;
};

const NotificationContext = createContext<NotifCtx | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifs, setNotifs] = useState<Notification[]>(MOCK);

    const forRole = useCallback((role: NotifRole) => notifs.filter(n => n.role === role), [notifs]);
    const unreadCount = useCallback((role: NotifRole) => notifs.filter(n => n.role === role && !n.read).length, [notifs]);
    const markRead = useCallback((id: string) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n)), []);
    const markAllRead = useCallback((role: NotifRole) => setNotifs(ns => ns.map(n => n.role === role ? { ...n, read: true } : n)), []);
    const remove = useCallback((id: string) => setNotifs(ns => ns.filter(n => n.id !== id)), []);

    return (
        <NotificationContext.Provider value={{ all: notifs, forRole, unreadCount, markRead, markAllRead, remove }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
    return ctx;
}
