"use client";

import { useState } from "react";
import { Search, Package, Truck, CheckCircle, Clock, X, ChevronDown } from "lucide-react";

type Order = {
    id: string;
    date: string;
    customer: string;
    items: number;
    total: number;
    status: "New" | "Processing" | "Shipped" | "Delivered";
};

const initialOrders: Order[] = [
    { id: "ORD-94182", date: "Oct 24, 2023", customer: "Ayesha Khan", items: 2, total: 399.98, status: "New" },
    { id: "ORD-94181", date: "Oct 24, 2023", customer: "Bilal Ahmed", items: 1, total: 199.99, status: "New" },
    { id: "ORD-94178", date: "Oct 23, 2023", customer: "Sara Malik", items: 3, total: 459.47, status: "Processing" },
    { id: "ORD-94175", date: "Oct 22, 2023", customer: "Usman Raza", items: 1, total: 599.95, status: "Processing" },
    { id: "ORD-94170", date: "Oct 21, 2023", customer: "Fatima Noor", items: 2, total: 259.49, status: "Shipped" },
    { id: "ORD-94165", date: "Oct 20, 2023", customer: "Hassan Ali", items: 1, total: 129.50, status: "Delivered" },
];

const statusStyle = (s: string) => {
    switch (s) {
        case "New": return "bg-blue-50 text-blue-600 border-blue-100";
        case "Processing": return "bg-amber-50 text-amber-600 border-amber-100";
        case "Shipped": return "bg-indigo-50 text-indigo-600 border-indigo-100";
        case "Delivered": return "bg-emerald-50 text-emerald-600 border-emerald-100";
        default: return "bg-gray-50 text-gray-600";
    }
};

const statusSteps: Order["status"][] = ["New", "Processing", "Shipped", "Delivered"];

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState(initialOrders);
    const [activeTab, setActiveTab] = useState("All Orders");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusModal, setStatusModal] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
    const [newStatus, setNewStatus] = useState<Order["status"]>("New");
    const [detailModal, setDetailModal] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });

    const tabs = ["All Orders", "New (2)", "Processing (2)", "Shipped", "Delivered"];

    const stats = [
        { label: "New Orders", value: orders.filter(o => o.status === "New").length, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Processing", value: orders.filter(o => o.status === "Processing").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Shipped", value: orders.filter(o => o.status === "Shipped").length, icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    const filtered = orders.filter(o => {
        const matchSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchTab = activeTab === "All Orders" || o.status === activeTab.split(" ")[0];
        return matchSearch && matchTab;
    });

    const openStatusModal = (order: Order) => {
        setNewStatus(order.status);
        setStatusModal({ open: true, order });
    };

    const handleUpdateStatus = () => {
        if (!statusModal.order) return;
        setOrders(prev => prev.map(o => o.id === statusModal.order!.id ? { ...o, status: newStatus } : o));
        setStatusModal({ open: false, order: null });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders Management</h1>
                    <p className="text-gray-500 mt-1 text-sm">Track shipments, process new orders, and manage returns.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                    Export CSV
                </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4 shadow-sm">
                        <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}><s.icon className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase">{s.label}</p>
                            <p className="text-xl font-bold text-gray-900">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-full md:w-auto overflow-x-auto">
                        {tabs.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab.startsWith("All") ? "All Orders" : tab.split(" ")[0])}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-all ${activeTab === (tab.startsWith("All") ? "All Orders" : tab.split(" ")[0]) ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search Order ID or Customer"
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">No orders found</td></tr>
                            )}
                            {filtered.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900">#{order.id}</span>
                                        <p className="text-xs text-gray-500 mt-0.5">{order.items} item(s)</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{order.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-virsa-light/50 flex-shrink-0 flex items-center justify-center border border-virsa-primary/20">
                                                <span className="text-xs font-bold text-virsa-primary">{order.customer.split(" ").map(n => n[0]).join("")}</span>
                                            </div>
                                            <span className="font-bold text-gray-700">{order.customer}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${statusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-black text-gray-900">Rs {order.total.toFixed(2)}</span>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Paid</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => setDetailModal({ open: true, order })} className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold rounded-lg transition-colors">
                                                Details
                                            </button>
                                            {order.status !== "Delivered" && (
                                                <button onClick={() => openStatusModal(order)} className="px-3 py-1.5 bg-gray-900 hover:bg-virsa-primary text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                                    Update Status
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Update Status Modal */}
            {statusModal.open && statusModal.order && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setStatusModal({ open: false, order: null })}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Update Order Status</h2>
                                <p className="text-sm text-gray-500 mt-0.5">#{statusModal.order.id} — {statusModal.order.customer}</p>
                            </div>
                            <button onClick={() => setStatusModal({ open: false, order: null })} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-3">Select New Status</label>
                                <div className="space-y-2">
                                    {statusSteps.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setNewStatus(s)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${newStatus === s ? "border-virsa-primary bg-virsa-light/10" : "border-gray-200 hover:border-gray-300"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusStyle(s)}`}>{s}</span>
                                            </div>
                                            {newStatus === s && <CheckCircle className="w-4 h-4 text-virsa-primary" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStatusModal({ open: false, order: null })} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleUpdateStatus} className="flex-1 py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors">
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {detailModal.open && detailModal.order && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDetailModal({ open: false, order: null })}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                            <button onClick={() => setDetailModal({ open: false, order: null })} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                {[
                                    ["Order ID", `#${detailModal.order.id}`],
                                    ["Customer", detailModal.order.customer],
                                    ["Date", detailModal.order.date],
                                    ["Items", `${detailModal.order.items} item(s)`],
                                    ["Total", `Rs ${detailModal.order.total.toFixed(2)}`],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{k}</span>
                                        <span className="text-sm font-bold text-gray-900">{v}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</span>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusStyle(detailModal.order.status)}`}>{detailModal.order.status}</span>
                                </div>
                            </div>
                            <button onClick={() => setDetailModal({ open: false, order: null })} className="w-full py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
