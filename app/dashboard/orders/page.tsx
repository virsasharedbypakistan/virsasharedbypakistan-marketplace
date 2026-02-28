"use client";

import { useState } from "react";
import { Package, Truck, CheckCircle2, ChevronRight, Search, Filter, X, MapPin, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Order = {
    id: string;
    date: string;
    status: string;
    total: number;
    items: {
        name: string;
        seller: string;
        qty: number;
        price: number;
        image: string;
    }[];
};

export default function CustomerOrdersPage() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [reviewModal, setReviewModal] = useState<{ open: boolean; item: Order["items"][0] | null }>({ open: false, item: null });
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [trackingModal, setTrackingModal] = useState<{ open: boolean; orderId: string }>({ open: false, orderId: "" });
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    const orders: Order[] = [
        {
            id: "ORD-1847291",
            date: "Oct 15, 2023",
            status: "Delivered",
            total: 199.99,
            items: [
                {
                    name: "Heritage Embroidered Shawl",
                    seller: "Khyber Crafts",
                    qty: 1,
                    price: 199.99,
                    image: "/images/products/product1.jpg"
                }
            ]
        },
        {
            id: "ORD-1847290",
            date: "Oct 12, 2023",
            status: "Shipped",
            total: 350.50,
            items: [
                {
                    name: "Hand-Painted Pottery Set",
                    seller: "Multan Art House",
                    qty: 1,
                    price: 150.00,
                    image: "/images/products/product2.jpg"
                },
                {
                    name: "Traditional Ajrak Fabric",
                    seller: "Sindh Heritage Store",
                    qty: 1,
                    price: 200.50,
                    image: "/images/products/product1.jpg"
                }
            ]
        },
        {
            id: "ORD-1847285",
            date: "Sep 28, 2023",
            status: "Processing",
            total: 45.00,
            items: [
                {
                    name: "Handwoven Basket",
                    seller: "Desert Crafts Co",
                    qty: 1,
                    price: 45.00,
                    image: "/images/products/product2.jpg"
                }
            ]
        }
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Delivered": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "Shipped": return "bg-blue-50 text-blue-600 border-blue-100";
            case "Processing": return "bg-amber-50 text-amber-600 border-amber-100";
            default: return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Delivered": return <CheckCircle2 className="w-4 h-4 mr-1.5" />;
            case "Shipped": return <Truck className="w-4 h-4 mr-1.5" />;
            case "Processing": return <Package className="w-4 h-4 mr-1.5" />;
            default: return null;
        }
    };

    const trackingSteps = [
        { label: "Order Placed", done: true, date: "Oct 12, 10:00 AM" },
        { label: "Processing", done: true, date: "Oct 12, 2:30 PM" },
        { label: "Shipped", done: true, date: "Oct 13, 9:00 AM" },
        { label: "Out for Delivery", done: false, date: "" },
        { label: "Delivered", done: false, date: "" },
    ];

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = filterStatus === "All" || o.status === filterStatus;
        return matchesSearch && matchesFilter;
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
                        {["All", "Processing", "Shipped", "Delivered"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilterStatus(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === f
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

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                        <Package className="w-16 h-16 text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">No orders found</p>
                    </div>
                )}
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                        {/* Order Header */}
                        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Order Placed</p>
                                    <p className="text-sm font-medium text-gray-900">{order.date}</p>
                                </div>
                                <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Total</p>
                                    <p className="text-sm font-medium text-gray-900">Rs {order.total.toFixed(2)}</p>
                                </div>
                                <div className="sm:hidden w-full"></div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Order #</p>
                                    <p className="text-sm font-medium text-gray-900">{order.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="text-sm font-bold text-virsa-primary hover:underline"
                                >
                                    View Details
                                </button>
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="divide-y divide-gray-50">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 border border-gray-200 overflow-hidden relative">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">{item.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">Sold by: {item.seller}</p>
                                        <div className="flex items-center gap-4">
                                            <p className="font-bold text-gray-900">Rs {item.price.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-auto flex flex-col gap-2 mt-4 sm:mt-0">
                                        <button
                                            onClick={() => setTrackingModal({ open: true, orderId: order.id })}
                                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-virsa-primary hover:bg-virsa-primary/90 transition-colors shadow-sm"
                                        >
                                            Track Package
                                        </button>
                                        {order.status === "Delivered" && (
                                            <button
                                                onClick={() => setReviewModal({ open: true, item })}
                                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                            >
                                                Write Review
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center pt-4">
                <nav className="flex items-center gap-2">
                    <button className="p-2 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed">
                        <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-virsa-primary text-white text-sm font-bold flex items-center justify-center">1</button>
                    <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium flex items-center justify-center transition-colors">2</button>
                    <button className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </nav>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                                <p className="text-sm text-gray-500 mt-0.5">{selectedOrder.id}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded-2xl p-4">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Date</p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">{selectedOrder.date}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status</p>
                                    <span className={`inline-flex items-center mt-1 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusStyle(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total</p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">Rs {selectedOrder.total.toFixed(2)}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-700 mb-3">Items Ordered</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.seller}</p>
                                            </div>
                                            <p className="font-bold text-gray-900 text-sm flex-shrink-0">Rs {item.price.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100">
                                <MapPin className="w-4 h-4 text-virsa-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Delivery Address</p>
                                    <p className="text-sm text-gray-700">123 Main Street, Lahore, Punjab, Pakistan</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 pt-0">
                            <button onClick={() => setSelectedOrder(null)} className="w-full py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tracking Modal */}
            {trackingModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setTrackingModal({ open: false, orderId: "" })}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Track Package</h2>
                                <p className="text-sm text-gray-500 mt-0.5">{trackingModal.orderId}</p>
                            </div>
                            <button onClick={() => setTrackingModal({ open: false, orderId: "" })} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="relative pl-6">
                                {trackingSteps.map((step, i) => (
                                    <div key={i} className={`relative pb-6 last:pb-0 ${i < trackingSteps.length - 1 ? "before:absolute before:left-[-13px] before:top-3 before:h-full before:w-0.5 before:bg-gray-200" : ""}`}>
                                        <div className={`absolute left-[-18px] w-5 h-5 rounded-full border-2 flex items-center justify-center ${step.done ? "border-virsa-primary bg-virsa-primary" : "border-gray-200 bg-white"}`}>
                                            {step.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="ml-2">
                                            <p className={`text-sm font-bold ${step.done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                                            {step.date && <p className="text-xs text-gray-500 mt-0.5">{step.date}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Write Review Modal */}
            {reviewModal.open && reviewModal.item && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => { setReviewModal({ open: false, item: null }); setReviewSubmitted(false); }}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                            <button onClick={() => { setReviewModal({ open: false, item: null }); setReviewSubmitted(false); }} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {reviewSubmitted ? (
                            <div className="p-10 text-center">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Review Submitted!</h3>
                                <p className="text-gray-500 text-sm">Thank you for sharing your feedback.</p>
                                <button onClick={() => { setReviewModal({ open: false, item: null }); setReviewSubmitted(false); }} className="mt-6 px-6 py-2.5 bg-virsa-primary text-white rounded-xl font-bold hover:bg-virsa-primary/90 transition-colors">
                                    Done
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 space-y-5">
                                {/* Product Info */}
                                <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                                        <Image src={reviewModal.item.image} alt={reviewModal.item.name} fill className="object-cover" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 line-clamp-2">{reviewModal.item.name}</p>
                                </div>

                                {/* Star Rating */}
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-2">Your Rating</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button key={s} onClick={() => setReviewRating(s)}>
                                                <Star className={`w-8 h-8 transition-colors ${s <= reviewRating ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-200"}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Review Title */}
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Review Title</label>
                                    <input
                                        type="text"
                                        value={reviewTitle}
                                        onChange={e => setReviewTitle(e.target.value)}
                                        placeholder="Summarize your experience in one line"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                    />
                                </div>

                                {/* Review Body */}
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Your Review</label>
                                    <textarea
                                        rows={4}
                                        value={reviewText}
                                        onChange={e => setReviewText(e.target.value)}
                                        placeholder="Tell others what you think about this product..."
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all resize-none"
                                    />
                                </div>

                                <button
                                    onClick={() => { if (reviewText.trim()) setReviewSubmitted(true); }}
                                    disabled={!reviewText.trim()}
                                    className="w-full py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
