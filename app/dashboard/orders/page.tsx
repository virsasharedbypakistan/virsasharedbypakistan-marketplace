"use client";

import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle2, ChevronRight, Search, Filter, X, MapPin, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Order = {
    id: string;
    order_number: string;
    created_at: string;
    status: string;
    total_amount: number;
    shipping_full_name: string;
    shipping_city: string;
    payment_status: string;
};

export default function CustomerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/orders?status=${filterStatus}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data.data?.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [filterStatus]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "delivered": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "shipped": return "bg-blue-50 text-blue-600 border-blue-100";
            case "processing": return "bg-amber-50 text-amber-600 border-amber-100";
            case "pending": return "bg-gray-50 text-gray-600 border-gray-100";
            default: return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "delivered": return <CheckCircle2 className="w-4 h-4 mr-1.5" />;
            case "shipped": return <Truck className="w-4 h-4 mr-1.5" />;
            case "processing":
            case "pending": return <Package className="w-4 h-4 mr-1.5" />;
            default: return null;
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.shipping_full_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Orders</h1>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search orders..."
                            className="pl-9 pr-4 py-2 w-full sm:w-56 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {["all", "pending", "processing", "shipped", "delivered"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilterStatus(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${filterStatus === f
                                    ? "bg-virsa-primary text-white shadow-sm"
                                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                    <div className="inline-block w-8 h-8 border-4 border-virsa-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading orders...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                            <Package className="w-16 h-16 text-gray-200 mb-4" />
                            <p className="text-gray-500 font-medium">No orders found</p>
                        </div>
                    )}
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Order Placed</p>
                                        <p className="text-sm font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Total</p>
                                        <p className="text-sm font-medium text-gray-900">Rs {order.total_amount.toFixed(2)}</p>
                                    </div>
                                    <div className="sm:hidden w-full"></div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Order #</p>
                                        <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={`/dashboard/orders/${order.id}`}
                                        className="text-sm font-bold text-virsa-primary hover:underline"
                                    >
                                        View Details
                                    </Link>
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border capitalize ${getStatusStyle(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-virsa-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Delivery Address</p>
                                        <p className="text-sm text-gray-700">{order.shipping_full_name}, {order.shipping_city}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
