"use client";

import { useState } from "react";
import { DollarSign, Package, ShoppingBag, TrendingUp, Users, X, CheckCircle2 } from "lucide-react";
import Image from "next/image";

type PendingOrder = { id: string; customer: string; product: string; amount: number; image: string };

const pendingOrders: PendingOrder[] = [
    { id: "ORD-94182", customer: "Ayesha Khan", product: "Heritage Embroidered Shawl", amount: 199.99, image: "/images/products/product1.jpg" },
    { id: "ORD-94181", customer: "Bilal Ahmed", product: "Hand-Painted Pottery Set", amount: 399.98, image: "/images/products/product2.jpg" },
    { id: "ORD-94178", customer: "Sara Malik", product: "Heritage Embroidered Shawl", amount: 129.50, image: "/images/products/product1.jpg" },
    { id: "ORD-94175", customer: "Usman Raza", product: "Hand-Painted Pottery Set", amount: 599.95, image: "/images/products/product2.jpg" },
    { id: "ORD-94170", customer: "Fatima Noor", product: "Heritage Embroidered Shawl", amount: 259.49, image: "/images/products/product1.jpg" },
];

const stats = [
    { name: "Total Revenue", value: "Rs 12,450.00", icon: DollarSign, trend: "+12.5%", color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Active Products", value: "145", icon: Package, trend: "+3", color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Total Orders", value: "842", icon: ShoppingBag, trend: "+24.0%", color: "text-indigo-600", bg: "bg-indigo-50" },
    { name: "Store Views", value: "14.2k", icon: Users, trend: "+18.2%", color: "text-amber-600", bg: "bg-amber-50" },
];

export default function VendorDashboardPage() {
    const [orders, setOrders] = useState(pendingOrders);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [confirmShip, setConfirmShip] = useState<PendingOrder | null>(null);
    const [doneToast, setDoneToast] = useState<string | null>(null);

    const handleShip = (order: PendingOrder) => {
        setOrders(prev => prev.filter(o => o.id !== order.id));
        setConfirmShip(null);
        setDoneToast(`Order ${order.id} marked as shipped!`);
        setTimeout(() => setDoneToast(null), 3000);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor Dashboard</h1>
                <p className="text-gray-500 mt-1 text-sm">Welcome back! Here&apos;s what&apos;s happening in your store today.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:border-virsa-primary/30 transition-colors">
                        <stat.icon className="absolute -right-6 -bottom-6 w-24 h-24 text-gray-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 relative z-10`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                            <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                            <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {stat.trend} <span className="text-gray-400 font-normal ml-1">vs last month</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Mock Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
                        <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-virsa-primary">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="aspect-[2/1] bg-gradient-to-t from-virsa-light/20 to-transparent border-b-2 border-virsa-primary/20 rounded-lg flex items-end relative overflow-hidden">
                        <div className="absolute inset-0 flex items-end justify-between px-4 pb-0 opacity-80">
                            {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                                <div key={i} className="w-[10%] bg-virsa-primary rounded-t-sm hover:opacity-80 transition-opacity cursor-pointer" style={{ height: `${h}%` }} title={`Rs ${h * 84}`} />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between px-4 mt-2">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                            <span key={d} className="text-[10px] font-bold text-gray-400 uppercase">{d}</span>
                        ))}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-lg font-bold text-gray-900">New Orders</h2>
                        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{orders.length} pending</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-72">
                        {orders.length === 0 && (
                            <div className="text-center py-8">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                                <p className="text-sm font-bold text-gray-500">All orders processed!</p>
                            </div>
                        )}
                        {orders.map(order => (
                            <div key={order.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0 border border-gray-100">
                                        <Image src={order.image} alt={order.product} fill className="object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-gray-900 truncate">{order.customer}</h4>
                                        <p className="text-xs text-gray-500 truncate">{order.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setConfirmShip(order)}
                                    className="ml-2 px-2.5 py-1.5 bg-virsa-primary text-white text-xs font-bold rounded-lg hover:bg-virsa-primary/90 transition-colors flex-shrink-0"
                                >
                                    Ship
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ship Confirm Modal */}
            {confirmShip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmShip(null)}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden relative mx-auto mb-4 border border-gray-100">
                                <Image src={confirmShip.image} alt={confirmShip.product} fill className="object-cover" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Mark as Shipped?</h3>
                            <p className="text-sm text-gray-500 mb-1">Order {confirmShip.id} from</p>
                            <p className="text-sm font-bold text-gray-900 mb-1">{confirmShip.customer}</p>
                            <p className="text-sm text-gray-500 mb-6">{confirmShip.product}</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmShip(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={() => handleShip(confirmShip)} className="flex-1 py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors">
                                    Confirm Ship
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {doneToast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white pl-4 pr-5 py-3.5 rounded-2xl shadow-2xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-sm font-bold">{doneToast}</p>
                </div>
            )}
        </div>
    );
}
