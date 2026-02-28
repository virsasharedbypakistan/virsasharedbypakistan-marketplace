"use client";

import { useState } from "react";
import { Package, Truck, RefreshCcw, HandPlatter, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CustomerDashboardPage() {
    const stats = [
        { name: "Total Orders", value: "12", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "To Ship", value: "2", icon: HandPlatter, color: "text-amber-600", bg: "bg-amber-50" },
        { name: "To Receive", value: "1", icon: Truck, color: "text-emerald-600", bg: "bg-emerald-50" },
        { name: "Returns", value: "0", icon: RefreshCcw, color: "text-rose-600", bg: "bg-rose-50" },
    ];

    const recentOrders = [
        {
            id: "ORD-1847291",
            date: "Oct 15, 2023",
            status: "Delivered",
            items: [
                {
                    name: "Heritage Embroidered Shawl",
                    seller: "Khyber Crafts",
                    price: 199.99,
                    qty: 1,
                    image: "/images/products/product1.jpg"
                }
            ]
        },
        {
            id: "ORD-1847290",
            date: "Oct 12, 2023",
            status: "Shipped",
            items: [
                {
                    name: "Hand-Painted Pottery Set",
                    seller: "Multan Art House",
                    price: 150.00,
                    qty: 1,
                    image: "/images/products/product2.jpg"
                }
            ]
        }
    ];

    const [buyAgainModal, setBuyAgainModal] = useState<{ open: boolean; item: (typeof recentOrders[0]["items"][0]) | null }>({ open: false, item: null });
    const [reviewModal, setReviewModal] = useState<{ open: boolean; item: (typeof recentOrders[0]["items"][0]) | null }>({ open: false, item: null });
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [reviewDone, setReviewDone] = useState(false);
    const [buyDone, setBuyDone] = useState(false);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
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
                    {recentOrders.map((order) => (
                        <div key={order.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-gray-900">Order #{order.id}</span>
                                    <span className="text-xs text-gray-500">{order.date}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === "Delivered"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-blue-50 text-blue-600"
                                    }`}>
                                    {order.status}
                                </span>
                            </div>

                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 border border-gray-200 overflow-hidden relative">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">Sold by: {item.seller}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">Rs {item.price.toFixed(2)}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end gap-3">
                                {order.status === "Delivered" && (
                                    <button
                                        onClick={() => { setReviewText(""); setReviewRating(5); setReviewDone(false); setReviewModal({ open: true, item: order.items[0] }); }}
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        Write Review
                                    </button>
                                )}
                                <button
                                    onClick={() => { setBuyDone(false); setBuyAgainModal({ open: true, item: order.items[0] }); }}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-virsa-primary border border-virsa-primary hover:bg-virsa-primary hover:text-white transition-colors"
                                >
                                    Buy Again
                                </button>
                            </div>
                        </div>
                    ))}
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
                                            <Image src={buyAgainModal.item.image} alt={buyAgainModal.item.name} fill className="object-cover" />
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
                                        <button onClick={() => setBuyDone(true)} className="flex-1 py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors">
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
                                        <Image src={reviewModal.item.image} alt={reviewModal.item.name} fill className="object-cover" />
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
                                    onClick={() => { if (reviewText.trim()) setReviewDone(true); }}
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
