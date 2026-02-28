"use client";

import { useState } from "react";
import { Search, ShoppingBag, Truck, CheckCircle2, Clock, X, ChevronDown } from "lucide-react";

type Order = {
    id: string;
    customer: string;
    vendor: string;
    date: string;
    amount: string;
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
};

const allOrders: Order[] = [
    { id: "ORD-9428", customer: "Ayesha Khan", vendor: "Khyber Crafts", date: "Oct 24, 2023", amount: "Rs 4,500.00", status: "Delivered" },
    { id: "ORD-9427", customer: "Bilal Ahmed", vendor: "Sindh Heritage", date: "Oct 24, 2023", amount: "Rs 1,250.00", status: "Shipped" },
    { id: "ORD-9426", customer: "Sara Malik", vendor: "Multan Art House", date: "Oct 23, 2023", amount: "Rs 12,999.00", status: "Processing" },
    { id: "ORD-9425", customer: "Usman Raza", vendor: "Lahori Bazaar", date: "Oct 23, 2023", amount: "Rs 450.00", status: "Pending" },
    { id: "ORD-9424", customer: "Fatima Noor", vendor: "Khyber Crafts", date: "Oct 22, 2023", amount: "Rs 8,400.00", status: "Delivered" },
    { id: "ORD-9423", customer: "Hassan Ali", vendor: "Desert Crafts", date: "Oct 22, 2023", amount: "Rs 3,200.00", status: "Cancelled" },
];

const STATUS_OPTIONS: Order["status"][] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const statusStyle = (s: string) => {
    switch (s) {
        case "Delivered": return "bg-emerald-50 text-emerald-600 border-emerald-100";
        case "Shipped": return "bg-indigo-50 text-indigo-600 border-indigo-100";
        case "Processing": return "bg-blue-50 text-blue-600 border-blue-100";
        case "Cancelled": return "bg-red-50 text-red-600 border-red-100";
        default: return "bg-amber-50 text-amber-600 border-amber-100";
    }
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState(allOrders);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Statuses");
    const [detailModal, setDetailModal] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
    const [statusModal, setStatusModal] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
    const [newStatus, setNewStatus] = useState<Order["status"]>("Pending");

    const stats = [
        { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Pending", value: orders.filter(o => o.status === "Pending").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "In Transit", value: orders.filter(o => o.status === "Shipped").length, icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Completed", value: orders.filter(o => o.status === "Delivered").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    const filtered = orders.filter(o => {
        const matchSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === "All Statuses" || o.status === statusFilter;
        return matchSearch && matchStatus;
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
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Global Orders</h1>
                    <p className="text-gray-500 mt-1 text-sm">Monitor and manage all orders across the marketplace.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} flex-shrink-0`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search order ID or customer..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white focus:outline-none focus:border-virsa-primary appearance-none cursor-pointer"
                        >
                            <option>All Statuses</option>
                            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Showing {filtered.length} of {orders.length} orders</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filtered.length === 0 && (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">No orders found</td></tr>
                            )}
                            {filtered.map((order, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-virsa-primary">{order.id}</td>
                                    <td className="px-6 py-4 text-gray-900 font-medium">{order.customer}</td>
                                    <td className="px-6 py-4 text-gray-600">{order.vendor}</td>
                                    <td className="px-6 py-4 text-gray-500">{order.date}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{order.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${statusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => setDetailModal({ open: true, order })} className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold rounded-lg transition-colors">
                                                Details
                                            </button>
                                            <button onClick={() => openStatusModal(order)} className="px-3 py-1.5 bg-virsa-primary text-white hover:bg-virsa-primary/90 text-xs font-bold rounded-lg transition-colors">
                                                Update
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 md:p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <span className="text-xs text-gray-500 font-medium">Showing 1 to 10 of 12,482 orders</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-400 bg-white disabled:opacity-50" disabled>PREV</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">NEXT</button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {detailModal.open && detailModal.order && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDetailModal({ open: false, order: null })}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                            <button onClick={() => setDetailModal({ open: false, order: null })} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                {[
                                    { label: "Order ID", value: detailModal.order.id },
                                    { label: "Customer", value: detailModal.order.customer },
                                    { label: "Vendor", value: detailModal.order.vendor },
                                    { label: "Date", value: detailModal.order.date },
                                    { label: "Amount", value: detailModal.order.amount },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
                                        <span className="text-sm font-bold text-gray-900">{value}</span>
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

            {/* Status Update Modal */}
            {statusModal.open && statusModal.order && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setStatusModal({ open: false, order: null })}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Update Order Status</h2>
                                <p className="text-sm text-gray-500 mt-0.5">{statusModal.order.id} — {statusModal.order.customer}</p>
                            </div>
                            <button onClick={() => setStatusModal({ open: false, order: null })} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-3">
                            {STATUS_OPTIONS.map(s => (
                                <button key={s} onClick={() => setNewStatus(s)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${newStatus === s ? "border-virsa-primary bg-virsa-light/10" : "border-gray-200 hover:border-gray-300"}`}>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusStyle(s)}`}>{s}</span>
                                    {newStatus === s && <CheckCircle2 className="w-4 h-4 text-virsa-primary" />}
                                </button>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setStatusModal({ open: false, order: null })} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                                <button onClick={handleUpdateStatus} className="flex-1 py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors">Update Status</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
