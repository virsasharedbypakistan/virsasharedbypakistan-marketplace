"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

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

type NotifCtx = {
    all: Notification[];
    forRole: (role: NotifRole) => Notification[];
    unreadCount: (role: NotifRole) => number;
    markRead: (id: string) => void;
    markAllRead: (role: NotifRole) => void;
    remove: (id: string) => void;
    refreshNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotifCtx | null>(null);

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifs, setNotifs] = useState<Notification[]>([]);
    const { user } = useAuth();

    const refreshNotifications = useCallback(async () => {
        if (!user) {
            setNotifs([]);
            return;
        }

        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const response = await res.json();
                // API returns { data: { data: [...], pagination: {...}, unreadCount: ... } }
                const notificationsData = response.data?.data || response.data || [];
                
                if (!Array.isArray(notificationsData)) {
                    console.error("Notifications data is not an array:", notificationsData);
                    return;
                }
                
                const notifications = notificationsData.map((item: any) => ({
                    id: item.id,
                    role: user.role as NotifRole,
                    type: item.type || "system",
                    title: item.title,
                    message: item.message,
                    time: formatRelativeTime(item.created_at),
                    read: item.is_read,
                    link: item.link || undefined,
                }));
                setNotifs(notifications);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }, [user]);

    useEffect(() => {
        refreshNotifications();
    }, [refreshNotifications]);

    const forRole = useCallback((role: NotifRole) => notifs.filter(n => n.role === role), [notifs]);
    const unreadCount = useCallback((role: NotifRole) => notifs.filter(n => n.role === role && !n.read).length, [notifs]);
    
    const markRead = useCallback(async (id: string) => {
        // Optimistically update UI
        setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
        
        // Update on server
        try {
            await fetch(`/api/notifications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_read: true }),
            });
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            // Revert on error
            await refreshNotifications();
        }
    }, [refreshNotifications]);
    
    const markAllRead = useCallback(async (role: NotifRole) => {
        // Optimistically update UI
        setNotifs(ns => ns.map(n => n.role === role ? { ...n, read: true } : n));
        
        // Update on server - mark all unread notifications for this role
        try {
            const unreadIds = notifs.filter(n => n.role === role && !n.read).map(n => n.id);
            await Promise.all(
                unreadIds.map(id =>
                    fetch(`/api/notifications/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ is_read: true }),
                    })
                )
            );
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
            // Revert on error
            await refreshNotifications();
        }
    }, [notifs, refreshNotifications]);
    
    const remove = useCallback(async (id: string) => {
        // Optimistically update UI
        setNotifs(ns => ns.filter(n => n.id !== id));
        
        // Delete on server
        try {
            await fetch(`/api/notifications/${id}`, {
                method: "DELETE",
            });
        } catch (error) {
            console.error("Failed to remove notification:", error);
            // Revert on error
            await refreshNotifications();
        }
    }, [refreshNotifications]);

    return (
        <NotificationContext.Provider value={{ all: notifs, forRole, unreadCount, markRead, markAllRead, remove, refreshNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
    return ctx;
}
