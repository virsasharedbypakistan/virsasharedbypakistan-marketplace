"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, ShoppingBag, Tag, Settings, Star, CreditCard, Store, AlertTriangle, Check, Trash2, X } from "lucide-react";
import { useNotifications, NotifRole, Notification } from "@/contexts/NotificationContext";

const TYPE_ICON: Record<Notification["type"], React.ReactNode> = {
    order: <ShoppingBag className="w-4 h-4" />,
    promo: <Tag className="w-4 h-4" />,
    system: <Settings className="w-4 h-4" />,
    review: <Star className="w-4 h-4" />,
    payment: <CreditCard className="w-4 h-4" />,
    vendor: <Store className="w-4 h-4" />,
    alert: <AlertTriangle className="w-4 h-4" />,
};

const TYPE_COLOR: Record<Notification["type"], string> = {
    order: "bg-blue-50 text-blue-600",
    promo: "bg-amber-50 text-amber-600",
    system: "bg-gray-100 text-gray-600",
    review: "bg-yellow-50 text-yellow-600",
    payment: "bg-emerald-50 text-emerald-600",
    vendor: "bg-purple-50 text-purple-600",
    alert: "bg-red-50 text-red-600",
};

export default function NotificationBell({ role }: { role: NotifRole }) {
    const { forRole, unreadCount, markRead, markAllRead, remove } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const items = forRole(role).slice(0, 8);
    const count = unreadCount(role);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const notifPageMap: Record<NotifRole, string> = {
        customer: "/dashboard/notifications",
        vendor: "/vendor/dashboard/notifications",
        admin: "/admin/dashboard/notifications",
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-virsa-primary"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-virsa-danger text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 leading-none">
                        {count > 9 ? "9+" : count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-virsa-primary" />
                            <span className="font-bold text-gray-900 text-sm">Notifications</span>
                            {count > 0 && (
                                <span className="bg-virsa-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count} new</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {count > 0 && (
                                <button onClick={() => markAllRead(role)} className="text-xs text-virsa-primary font-bold hover:underline flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Mark all read
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto max-h-80">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                                <Bell className="w-10 h-10 mb-3 opacity-30" />
                                <p className="text-sm font-medium">You're all caught up!</p>
                            </div>
                        ) : (
                            items.map((n) => (
                                <div
                                    key={n.id}
                                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/80 transition-colors group ${!n.read ? "bg-virsa-primary/[0.02]" : ""}`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${TYPE_COLOR[n.type]}`}>
                                        {TYPE_ICON[n.type]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {n.link ? (
                                            <Link href={n.link} onClick={() => { markRead(n.id); setOpen(false); }}>
                                                <p className={`text-sm leading-snug mb-0.5 ${!n.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>{n.title}</p>
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                                <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                                            </Link>
                                        ) : (
                                            <div onClick={() => markRead(n.id)} className="cursor-default">
                                                <p className={`text-sm leading-snug mb-0.5 ${!n.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>{n.title}</p>
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                                <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        {!n.read && (
                                            <button onClick={() => markRead(n.id)} title="Mark as read" className="w-6 h-6 rounded-full bg-virsa-primary/10 hover:bg-virsa-primary hover:text-white text-virsa-primary flex items-center justify-center transition-colors">
                                                <Check className="w-3 h-3" />
                                            </button>
                                        )}
                                        <button onClick={() => remove(n.id)} title="Remove" className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-500 hover:text-white text-gray-400 flex items-center justify-center transition-colors">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                    {!n.read && <div className="w-2 h-2 rounded-full bg-virsa-primary flex-shrink-0 mt-2" />}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                        <Link
                            href={notifPageMap[role]}
                            onClick={() => setOpen(false)}
                            className="text-sm font-bold text-virsa-primary hover:text-virsa-primary/80 transition-colors flex items-center justify-center gap-1 py-1"
                        >
                            View all notifications →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
