"use client";

import { useState } from "react";
import { Search, MoreHorizontal, Users, DollarSign, ShoppingBag, Mail, X, Eye, Ban, CheckCircle2, Trash2 } from "lucide-react";

type Customer = {
    id: number;
    name: string;
    email: string;
    status: "Active" | "Inactive" | "Banned";
    orders: number;
    spent: number;
    lastActive: string;
    initials: string;
};

const initialCustomers: Customer[] = [
    { id: 1, name: "Ayesha Khan", email: "ayesha@example.com", status: "Active", orders: 12, spent: 4800, lastActive: "Today", initials: "AK" },
    { id: 2, name: "Bilal Ahmed", email: "bilal@example.com", status: "Active", orders: 7, spent: 2100, lastActive: "Today", initials: "BA" },
    { id: 3, name: "Sara Malik", email: "sara@example.com", status: "Active", orders: 21, spent: 9450, lastActive: "2 days ago", initials: "SM" },
    { id: 4, name: "Usman Raza", email: "usman@example.com", status: "Inactive", orders: 3, spent: 750, lastActive: "15 days ago", initials: "UR" },
    { id: 5, name: "Fatima Noor", email: "fatima@example.com", status: "Active", orders: 9, spent: 3200, lastActive: "3 days ago", initials: "FN" },
    { id: 6, name: "Hassan Ali", email: "hassan@example.com", status: "Active", orders: 5, spent: 1850, lastActive: "5 days ago", initials: "HA" },
    { id: 7, name: "Zainab Sheikh", email: "zainab@example.com", status: "Banned", orders: 1, spent: 200, lastActive: "30 days ago", initials: "ZS" },
];

const statusStyle = (s: string) => {
    switch (s) {
        case "Active": return "bg-emerald-50 text-emerald-600 border-emerald-100";
        case "Inactive": return "bg-gray-100 text-gray-500 border-gray-200";
        case "Banned": return "bg-red-50 text-red-600 border-red-100";
        default: return "bg-gray-50 text-gray-600";
    }
};

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState(initialCustomers);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState<number | null>(null);
    const [viewModal, setViewModal] = useState<{ open: boolean; customer: Customer | null }>({ open: false, customer: null });
    const [banConfirm, setBanConfirm] = useState<{ open: boolean; customer: Customer | null }>({ open: false, customer: null });
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [actionDone, setActionDone] = useState<string | null>(null);

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleBan = (id: number) => {
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "Banned" ? "Active" : "Banned" } : c));
        const c = customers.find(c => c.id === id);
        setActionDone(c?.status === "Banned" ? `${c.name} has been unbanned.` : `${c?.name} has been banned.`);
        setBanConfirm({ open: false, customer: null });
        setMenuOpen(null);
        setTimeout(() => setActionDone(null), 3000);
    };

    const handleDelete = (id: number) => {
        const c = customers.find(c => c.id === id);
        setCustomers(prev => prev.filter(c => c.id !== id));
        setDeleteConfirm(null);
        setActionDone(`${c?.name}'s account has been deleted.`);
        setTimeout(() => setActionDone(null), 3000);
    };

    const customerToDelete = customers.find(c => c.id === deleteConfirm);

    return (
        <div className="space-y-6" onClick={() => setMenuOpen(null)}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers Management</h1>
                    <p className="text-gray-500 mt-1 text-sm">View user details, order history, and account statuses.</p>
                </div>
                <div className="flex gap-3 text-sm bg-white border border-gray-100 rounded-xl px-5 py-3 shadow-sm">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-bold text-gray-900">{customers.length} customers</span>
                </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary"
                            />
                        </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Showing {filtered.length} of {customers.length}</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Orders</th>
                                <th className="px-6 py-4">Total Spent</th>
                                <th className="px-6 py-4">Last Active</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filtered.map(customer => (
                                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-virsa-light/70 flex-shrink-0 flex items-center justify-center font-bold text-virsa-primary text-sm border border-virsa-primary/20">
                                                {customer.initials}
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-900 block">{customer.name}</span>
                                                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                                                    <Mail className="w-3 h-3" /> {customer.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${statusStyle(customer.status)}`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">{customer.orders}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-black text-gray-900">Rs {customer.spent.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-600">{customer.lastActive}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setMenuOpen(menuOpen === customer.id ? null : customer.id)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                            {menuOpen === customer.id && (
                                                <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 w-44">
                                                    <button onClick={() => { setViewModal({ open: true, customer }); setMenuOpen(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                        <Eye className="w-4 h-4 text-gray-400" /> View Details
                                                    </button>
                                                    <button onClick={() => { setBanConfirm({ open: true, customer }); setMenuOpen(null); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-2 ${customer.status === "Banned" ? "text-emerald-600" : "text-amber-600"}`}>
                                                        <Ban className="w-4 h-4" /> {customer.status === "Banned" ? "Unban User" : "Ban User"}
                                                    </button>
                                                    <button onClick={() => { setDeleteConfirm(customer.id); setMenuOpen(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                        <Trash2 className="w-4 h-4" /> Delete Account
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 md:p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <span className="text-xs text-gray-500 font-medium">Page 1 of 124</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-400 bg-white disabled:opacity-50" disabled>PREV</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">NEXT</button>
                    </div>
                </div>
            </div>

            {/* View Customer Modal */}
            {viewModal.open && viewModal.customer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setViewModal({ open: false, customer: null })}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
                            <button onClick={() => setViewModal({ open: false, customer: null })} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="text-center pb-4 border-b border-gray-100">
                                <div className="w-16 h-16 rounded-full bg-virsa-light/70 flex items-center justify-center font-black text-virsa-primary text-2xl border-2 border-virsa-primary/20 mx-auto mb-3">
                                    {viewModal.customer.initials}
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">{viewModal.customer.name}</h3>
                                <p className="text-sm text-gray-500">{viewModal.customer.email}</p>
                                <span className={`inline-flex items-center mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusStyle(viewModal.customer.status)}`}>{viewModal.customer.status}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-lg font-black text-gray-900">{viewModal.customer.orders}</p>
                                    <p className="text-xs text-gray-500 font-medium">Orders</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-sm font-black text-gray-900">Rs {(viewModal.customer.spent / 1000).toFixed(1)}k</p>
                                    <p className="text-xs text-gray-500 font-medium">Spent</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs font-bold text-gray-900">{viewModal.customer.lastActive}</p>
                                    <p className="text-xs text-gray-500 font-medium">Active</p>
                                </div>
                            </div>
                            <button onClick={() => setViewModal({ open: false, customer: null })} className="w-full py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ban Confirm Modal */}
            {banConfirm.open && banConfirm.customer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setBanConfirm({ open: false, customer: null })}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${banConfirm.customer.status === "Banned" ? "bg-emerald-50" : "bg-amber-50"}`}>
                                <Ban className={`w-6 h-6 ${banConfirm.customer.status === "Banned" ? "text-emerald-500" : "text-amber-500"}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{banConfirm.customer.status === "Banned" ? "Unban User?" : "Ban User?"}</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {banConfirm.customer.status === "Banned"
                                    ? `Restore access for ${banConfirm.customer.name}?`
                                    : `This will prevent ${banConfirm.customer.name} from accessing their account.`}
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setBanConfirm({ open: false, customer: null })} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                                <button onClick={() => toggleBan(banConfirm.customer!.id)} className={`flex-1 py-3 rounded-xl text-white font-bold transition-colors ${banConfirm.customer.status === "Banned" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600"}`}>
                                    {banConfirm.customer.status === "Banned" ? "Unban" : "Ban User"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm !== null && customerToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account?</h3>
                            <p className="text-sm text-gray-500 mb-1">Permanently delete all data for</p>
                            <p className="text-sm font-bold text-gray-900 mb-6">"{customerToDelete.name}"</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Toast */}
            {actionDone && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white pl-4 pr-5 py-3.5 rounded-2xl shadow-2xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-sm font-bold">{actionDone}</p>
                </div>
            )}
        </div>
    );
}
