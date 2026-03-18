"use client";

import { useState, useEffect } from "react";
import { Package, Truck, RefreshCcw, HandPlatter, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";

type OrderItem = {
    id: string;
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    thumbnail_url: string | null;
    vendor_name: string;
};

type Order = {
    id: string;
    order_number: string;
    created_at: string;
    status: string;
    total_amount: number;
    items: OrderItem[];
};

export default function CustomerDashboardPage() {
    const { addItem } = useCart();
    const [stats, setStats] = useState({ total: 0, pending: 0, shipped: 0, delivered: 0 });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const [buyAgainModal, setBuyAgainModal] = useState<{ open: boolean; item: OrderItem | null }>({ open: false, item: null });
    const [reviewModal, setReviewModal] = useState<{ open: boolean; item: OrderItem | null }>({ open: false, item: null });
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [reviewDone, setReviewDone] = useState(false);
    const [buyDone, setBuyDone] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch("/api/orders?limit=5");
                if (res.ok) {
                    const data = await res.json();
                    const orders = Array.isArray(data.data) ? data.data : [];
                    setRecentOrders(orders);

                    // Calculate stats
                    const allOrdersRes = await fetch("/api/orders");
                    if (allOrdersRes.ok) {
                        const allData = await allOrdersRes.json();
                        const allOrders = Array.isArray(allData.data) ? allData.data : [];
                        setStats({
                            total: allOrders.length,
                            pending: allOrders.filter((o: Order) => o.status === "pending").length,
                            shipped: allOrders.filter((o: Order) => o.status === "shipped").length,
                            delivered: allOrders.filter((o: Order) => o.status === "delivered").length,
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleBuyAgain = async (item: OrderItem) => {
        await addItem(item.product_id, item.quantity);
        setBuyDone(true);
    };

    const handleSubmitReview = async () => {
        if (!reviewModal.item || !reviewText.trim()) return;

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: reviewModal.item.product_id,
                    rating: reviewRating,
                    title: reviewText.split(".")[0].substring(0, 100),
                    comment: reviewText,
                }),
            });

            if (res.ok) {
                setReviewDone(true);
            } else {
                alert("Failed to submit review");
            }
        } catch (error) {
            console.error("Failed to submit review:", error);
            alert("Failed to submit review");
        }
    };

    const statsDisplay = [
        { name: "Total Orders", value: stats.total.toString(), icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Pending", value: stats.pending.toString(), icon: HandPlatter, color: "text-amber-600", bg: "bg-amber-50" },
        { name: "Shipped", value: stats.shipped.toString(), icon: Truck, color: "text-emerald-600", bg: "bg-emerald-50" },
        { name: "Delivered", value: stats.delivered.toString(), icon: RefreshCcw, color: "text-rose-600", bg: "bg-rose-50" },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Overview</h1>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 animate-pulse">
                            <div className="h-12 w-12 bg-gray-200 rounded-xl mb-3" />
                            <div className="h-6 bg-gray-200 rounded w-16 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-24" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsDisplay.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden mt-8">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                    <Link href="/dashboard/orders" className="text-sm font-medium text-virsa-primary hover:underline">
                        View All
                    </Link>
                </div>

                <div className="divide-y divide-gray-50">
                    {recentOrders.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p className="font-medium">No orders yet</p>
                        </div>
                    ) : (
                        recentOrders.map((order) => (
                            <div key={order.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-gray-900">Order #{order.order_number}</span>
                                        <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        order.status === "delivered"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : order.status === "shipped"
                                            ? "bg-blue-50 text-blue-600"
                                            : "bg-amber-50 text-amber-600"
                                    }`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>

                                {order.items.slice(0, 1).map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 border border-gray-200 overflow-hidden relative">
                                            <Image src={item.thumbnail_url || "/product_headphones.png"} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">Sold by: {item.vendor_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">Rs {item.price.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                                {order.items.length > 1 && (
                                    <p className="text-xs text-gray-500 mt-2">+{order.items.length - 1} more item(s)</p>
                                )}

                                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end gap-3">
                                    {order.status === "delivered" && order.items[0] && (
                                        <button
                                            onClick={() => { setReviewText(""); setReviewRating(5); setReviewDone(false); setReviewModal({ open: true, item: order.items[0] }); }}
                                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                                        >
                                            Write Review
                                        </button>
                                    )}
                                    {order.items[0] && (
                                        <button
                                            onClick={() => { setBuyDone(false); setBuyAgainModal({ open: true, item: order.items[0] }); }}
                                            className="px-4 py-2 rounded-lg text-sm font-bold text-virsa-primary border border-virsa-primary hover:bg-virsa-primary hover:text-white transition-colors"
                                        >
                                            Buy Again
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Buy Again Confirmation Modal */}
            {buyAgainModal.open && buyAgainModal.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setBuyAgainModal({ open: false, item: null })}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        {buyDone ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Added to Cart!</h3>
                                <p className="text-gray-500 text-sm mb-6">{buyAgainModal.item.name} has been added to your cart.</p>
                                <button onClick={() => setBuyAgainModal({ open: false, item: null })} className="w-full py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors">
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <h2 className="text-lg font-bold text-gray-900">Buy Again</h2>
                                    <button onClick={() => setBuyAgainModal({ open: false, item: null })} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0">
                                            <Image src={buyAgainModal.item.thumbnail_url || "/product_headphones.png"} alt={buyAgainModal.item.name} fill className="object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{buyAgainModal.item.name}</p>
                                            <p className="text-lg font-black text-virsa-primary mt-0.5">Rs {buyAgainModal.item.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setBuyAgainModal({ open: false, item: null })} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                            Cancel
                                        </button>
                                        <button onClick={() => handleBuyAgain(buyAgainModal.item!)} className="flex-1 py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors">
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Write Review Modal */}
            {reviewModal.open && reviewModal.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setReviewModal({ open: false, item: null })}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                            <button onClick={() => setReviewModal({ open: false, item: null })} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {reviewDone ? (
                            <div className="p-10 text-center">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Review Submitted!</h3>
                                <p className="text-gray-500 text-sm mb-6">Thank you for your feedback.</p>
                                <button onClick={() => setReviewModal({ open: false, item: null })} className="px-6 py-2.5 bg-virsa-primary text-white rounded-xl font-bold">Done</button>
                            </div>
                        ) : (
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                                        <Image src={reviewModal.item.thumbnail_url || "/product_headphones.png"} alt={reviewModal.item.name} fill className="object-cover" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">{reviewModal.item.name}</p>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button key={s} onClick={() => setReviewRating(s)} className="text-2xl">
                                            <span className={s <= reviewRating ? "text-amber-400" : "text-gray-200"}>★</span>
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    rows={4}
                                    value={reviewText}
                                    onChange={e => setReviewText(e.target.value)}
                                    placeholder="Tell others what you think about this product..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all resize-none"
                                />
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={!reviewText.trim()}
                                    className="w-full py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors disabled:opacity-50"
                                >
                                    Submit Review
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
