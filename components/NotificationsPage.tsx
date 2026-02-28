"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ShoppingBag, Tag, Settings, Star, CreditCard, Store, AlertTriangle, Check, Trash2, ChevronRight, Filter, X } from "lucide-react";
import { useNotifications, Notification } from "@/contexts/NotificationContext";

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

const TYPE_LABEL: Record<Notification["type"], string> = {
    order: "Order", promo: "Promo", system: "System",
    review: "Review", payment: "Payment", vendor: "Vendor", alert: "Alert",
};

type Props = {
    role: "customer" | "vendor" | "admin";
    pageTitle: string;
    backLink: string;
};

export default function NotificationsPage({ role, pageTitle, backLink }: Props) {
    const { forRole, unreadCount, markRead, markAllRead, remove } = useNotifications();
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [typeFilter, setTypeFilter] = useState<Notification["type"] | "all">("all");

    const all = forRole(role);
    const unread = unreadCount(role);
    const visible = all
        .filter(n => filter === "all" || !n.read)
        .filter(n => typeFilter === "all" || n.type === typeFilter);

    const types = Array.from(new Set(all.map(n => n.type)));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href={backLink} className="text-xs text-gray-500 hover:text-virsa-primary transition-colors flex items-center gap-1">
                            <ChevronRight className="w-3 h-3 rotate-180" /> Back
                        </Link>
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Bell className="w-6 h-6 text-virsa-primary" />
                        {pageTitle}
                        {unread > 0 && (
                            <span className="bg-virsa-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread} unread</span>
                        )}
                    </h1>
                </div>
                {unread > 0 && (
                    <button
                        onClick={() => markAllRead(role)}
                        className="flex items-center gap-2 px-4 py-2 bg-virsa-primary text-white text-sm font-bold rounded-xl hover:bg-virsa-primary/90 transition-colors shadow-sm"
                    >
                        <Check className="w-4 h-4" /> Mark All as Read
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setFilter("all")} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === "all" ? "bg-white shadow text-virsa-primary" : "text-gray-500 hover:text-gray-900"}`}>All ({all.length})</button>
                    <button onClick={() => setFilter("unread")} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === "unread" ? "bg-white shadow text-virsa-primary" : "text-gray-500 hover:text-gray-900"}`}>Unread ({unread})</button>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                    <Filter className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Filter:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setTypeFilter("all")} className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${typeFilter === "all" ? "bg-virsa-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>All Types</button>
                    {types.map(type => (
                        <button key={type} onClick={() => setTypeFilter(type)} className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all flex items-center gap-1 ${typeFilter === type ? "bg-virsa-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                            {TYPE_LABEL[type]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notification List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Bell className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-bold text-gray-600">No notifications here</p>
                        <p className="text-sm mt-1">Check back later or change your filters.</p>
                        {(filter !== "all" || typeFilter !== "all") && (
                            <button onClick={() => { setFilter("all"); setTypeFilter("all"); }} className="mt-4 text-sm text-virsa-primary font-bold hover:underline flex items-center gap-1">
                                <X className="w-4 h-4" /> Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    visible.map((n, idx) => (
                        <div
                            key={n.id}
                            className={`flex items-start gap-4 px-5 py-4 transition-colors group hover:bg-gray-50/80 ${!n.read ? "bg-virsa-primary/[0.025] border-l-4 border-l-virsa-primary" : "border-l-4 border-l-transparent"} ${idx < visible.length - 1 ? "border-b border-gray-50" : ""}`}
                        >
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${TYPE_COLOR[n.type]}`}>
                                {TYPE_ICON[n.type]}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            {!n.read && <span className="w-2 h-2 rounded-full bg-virsa-primary flex-shrink-0" />}
                                            <span className={`text-sm ${!n.read ? "font-extrabold text-gray-900" : "font-bold text-gray-700"}`}>{n.title}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[n.type]}`}>{TYPE_LABEL[n.type]}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">{n.message}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[11px] text-gray-400">{n.time}</span>
                                            {n.link && (
                                                <Link href={n.link} onClick={() => markRead(n.id)} className="text-[11px] font-bold text-virsa-primary hover:underline flex items-center gap-0.5">
                                                    View details <ChevronRight className="w-3 h-3" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        {!n.read && (
                                            <button onClick={() => markRead(n.id)} title="Mark as read" className="w-8 h-8 rounded-xl bg-virsa-primary/10 hover:bg-virsa-primary hover:text-white text-virsa-primary flex items-center justify-center transition-colors">
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <button onClick={() => remove(n.id)} title="Delete" className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-500 hover:text-white text-gray-400 flex items-center justify-center transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
