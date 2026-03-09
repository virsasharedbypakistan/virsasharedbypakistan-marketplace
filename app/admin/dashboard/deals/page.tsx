"use client";

import { useState } from "react";
import {
    Search, Plus, Zap, Flame, Clock, Trash2, Pencil,
    X, CheckCircle2, Package, TrendingDown, Timer, ToggleLeft, Store
} from "lucide-react";

type DiscountType = "percentage" | "fixed";
type DealStatus = "active" | "upcoming" | "expired";

type Deal = {
    id: number;
    title: string;
    product: string;
    vendor: string;
    createdBy: "admin" | "vendor";
    originalPrice: number;
    dealPrice: number;
    discountType: DiscountType;
    discountValue: number;
    startsAt: string;
    expiresAt: string;
    status: DealStatus;
    sold: number;
};

const initialDeals: Deal[] = [
    { id: 1, title: "Flash Sale — Headphones Pro", product: "Premium Wireless Headphones Pro", vendor: "Tech Haven PK", createdBy: "vendor", originalPrice: 34999, dealPrice: 19999, discountType: "percentage", discountValue: 43, startsAt: "2026-03-05T00:00", expiresAt: "2026-03-06T23:59", status: "active", sold: 124 },
    { id: 2, title: "Platform Deal — Smart Watch", product: "Smart Watch Series 8", vendor: "Electronics Pro", createdBy: "admin", originalPrice: 55000, dealPrice: 34999, discountType: "percentage", discountValue: 36, startsAt: "2026-03-05T00:00", expiresAt: "2026-03-07T23:59", status: "active", sold: 89 },
    { id: 3, title: "Weekend Deal — Laptop Stand", product: "Aluminium Laptop Stand", vendor: "Home Essentials", createdBy: "vendor", originalPrice: 5500, dealPrice: 3999, discountType: "fixed", discountValue: 1501, startsAt: "2026-03-08T00:00", expiresAt: "2026-03-09T23:59", status: "upcoming", sold: 0 },
    { id: 4, title: "Clearance — Desk Lamp", product: "LED Desk Lamp with USB", vendor: "Fashion Hub", createdBy: "vendor", originalPrice: 2500, dealPrice: 1750, discountType: "percentage", discountValue: 30, startsAt: "2026-03-01T00:00", expiresAt: "2026-03-04T23:59", status: "expired", sold: 38 },
];

const ALL_PRODUCTS = ["Premium Wireless Headphones Pro", "Smart Watch Series 8", "Ergonomic Chair", "LED Desk Lamp", "Laptop Stand", "Bluetooth Speaker", "Nike Air Max 270"];
const ALL_VENDORS = ["Tech Haven PK", "Electronics Pro", "Home Essentials", "Fashion Hub", "Beauty Store", "Sports World PK"];

const statusStyle = (s: DealStatus) => {
    switch (s) {
        case "active": return "bg-emerald-50 text-emerald-600 border-emerald-100";
        case "upcoming": return "bg-blue-50 text-blue-600 border-blue-100";
        case "expired": return "bg-gray-50 text-gray-500 border-gray-100";
    }
};

const statusIcon = (s: DealStatus) => {
    switch (s) {
        case "active": return <Flame className="w-3 h-3" />;
        case "upcoming": return <Timer className="w-3 h-3" />;
        case "expired": return <ToggleLeft className="w-3 h-3" />;
    }
};

type FormData = {
    title: string; product: string; vendor: string;
    discountType: DiscountType; discountValue: string; originalPrice: string;
    startsAt: string; expiresAt: string;
};
const emptyForm: FormData = { title: "", product: "", vendor: "", discountType: "percentage", discountValue: "", originalPrice: "", startsAt: "", expiresAt: "" };

export default function AdminDealsPage() {
    const [deals, setDeals] = useState<Deal[]>(initialDeals);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | DealStatus>("all");
    const [creatorFilter, setCreatorFilter] = useState<"all" | "admin" | "vendor">("all");
    const [modal, setModal] = useState<{ open: boolean; editing: Deal | null }>({ open: false, editing: null });
    const [form, setForm] = useState<FormData>(emptyForm);
    const [deleteConfirm, setDeleteConfirm] = useState<Deal | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const filtered = deals.filter(d => {
        const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.product.toLowerCase().includes(search.toLowerCase()) || d.vendor.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || d.status === filter;
        const matchCreator = creatorFilter === "all" || d.createdBy === creatorFilter;
        return matchSearch && matchFilter && matchCreator;
    });

    const openAdd = () => { setForm(emptyForm); setModal({ open: true, editing: null }); };
    const openEdit = (d: Deal) => {
        setForm({ title: d.title, product: d.product, vendor: d.vendor, discountType: d.discountType, discountValue: String(d.discountValue), originalPrice: String(d.originalPrice), startsAt: d.startsAt, expiresAt: d.expiresAt });
        setModal({ open: true, editing: d });
    };

    const computeDealPrice = () => {
        const orig = parseFloat(form.originalPrice) || 0;
        const val = parseFloat(form.discountValue) || 0;
        return form.discountType === "percentage" ? Math.max(0, orig - (orig * val) / 100) : Math.max(0, orig - val);
    };

    const handleSave = () => {
        const dealPrice = computeDealPrice();
        if (!form.title || !form.product || !form.vendor || !form.originalPrice || !form.discountValue || !form.startsAt || !form.expiresAt) { showToast("Please fill all required fields."); return; }
        if (dealPrice <= 0) { showToast("Deal price must be greater than 0."); return; }
        const now = new Date().toISOString();
        const status: DealStatus = form.startsAt > now ? "upcoming" : form.expiresAt < now ? "expired" : "active";
        if (modal.editing) {
            setDeals(prev => prev.map(d => d.id === modal.editing!.id ? { ...d, ...form, discountValue: parseFloat(form.discountValue), originalPrice: parseFloat(form.originalPrice), dealPrice, status } : d));
            showToast("Deal updated successfully.");
        } else {
            setDeals(prev => [...prev, { id: Date.now(), ...form, discountValue: parseFloat(form.discountValue), originalPrice: parseFloat(form.originalPrice), dealPrice, status, sold: 0, createdBy: "admin" as const }]);
            showToast("Deal created successfully.");
        }
        setModal({ open: false, editing: null });
    };

    const handleDelete = (d: Deal) => { setDeals(prev => prev.filter(x => x.id !== d.id)); setDeleteConfirm(null); showToast(`"${d.title}" deleted.`); };

    const stats = [
        { label: "Total Deals", value: deals.length, icon: Zap, color: "text-violet-600", bg: "bg-violet-50" },
        { label: "Active Now", value: deals.filter(d => d.status === "active").length, icon: Flame, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Upcoming", value: deals.filter(d => d.status === "upcoming").length, icon: Timer, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Units Sold via Deals", value: deals.reduce((s, d) => s + d.sold, 0), icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Deals Management</h1>
                    <p className="text-gray-500 mt-1 text-sm">Create platform deals or manage vendor deals across the marketplace.</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-[#47704C] text-white font-bold rounded-xl hover:bg-[#3a5c40] transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Create Platform Deal
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}><s.icon className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{s.label}</h3>
                            <p className="text-2xl font-black text-gray-900 leading-none mt-0.5">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-gray-50/30">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deals, products, vendors..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#47704C] focus:ring-1 focus:ring-[#47704C]" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                            {(["all", "active", "upcoming", "expired"] as const).map(f => (
                                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-colors ${filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>{f}</button>
                            ))}
                        </div>
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                            {(["all", "admin", "vendor"] as const).map(c => (
                                <button key={c} onClick={() => setCreatorFilter(c)} className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-colors ${creatorFilter === c ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>{c === "all" ? "All Sources" : c === "admin" ? "Platform" : "Vendors"}</button>
                            ))}
                        </div>
                    </div>
                    <span className="text-xs text-gray-500">Showing {filtered.length} of {deals.length} deals</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="px-6 py-4">Deal</th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Discount</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Validity</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Sold</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={9} className="px-6 py-16 text-center text-gray-400 font-medium">No deals found.</td></tr>
                            ) : filtered.map(deal => (
                                <tr key={deal.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0"><Zap className="w-4 h-4 text-violet-500" /></div>
                                            <div>
                                                <span className="font-bold text-gray-900 block max-w-[160px] truncate">{deal.title}</span>
                                                <span className="text-xs text-gray-400 block max-w-[160px] truncate">{deal.product}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                                            <Store className="w-3.5 h-3.5 text-gray-400" />{deal.vendor}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${deal.createdBy === "admin" ? "bg-violet-50 text-violet-600 border-violet-100" : "bg-sky-50 text-sky-600 border-sky-100"}`}>
                                            {deal.createdBy === "admin" ? "Platform" : "Vendor"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 font-black text-sm px-2.5 py-1 rounded-lg">
                                            <TrendingDown className="w-3 h-3" />
                                            {deal.discountType === "percentage" ? `${deal.discountValue}%` : `Rs ${deal.discountValue.toLocaleString()}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-black text-gray-900 block">Rs {deal.dealPrice.toLocaleString()}</span>
                                        <span className="text-xs text-gray-400 line-through">Rs {deal.originalPrice.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(deal.startsAt).toLocaleDateString()} → {new Date(deal.expiresAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${statusStyle(deal.status)}`}>
                                            {statusIcon(deal.status)} {deal.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4"><span className="font-bold text-gray-700">{deal.sold}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(deal)} className="p-1.5 text-gray-400 hover:text-[#47704C] hover:bg-green-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                                            <button onClick={() => setDeleteConfirm(deal)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setModal({ open: false, editing: null })}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center"><Zap className="w-4 h-4 text-violet-500" /></div>
                                <h2 className="text-xl font-bold text-gray-900">{modal.editing ? "Edit Deal" : "Create Platform Deal"}</h2>
                            </div>
                            <button onClick={() => setModal({ open: false, editing: null })} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Deal Title <span className="text-red-400">*</span></label>
                                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Platform Flash Sale — Smart Watch" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#47704C] focus:ring-1 focus:ring-[#47704C]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Product <span className="text-red-400">*</span></label>
                                    <select value={form.product} onChange={e => setForm(p => ({ ...p, product: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#47704C]">
                                        <option value="">Select product</option>
                                        {ALL_PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Vendor <span className="text-red-400">*</span></label>
                                    <select value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#47704C]">
                                        <option value="">Select vendor</option>
                                        {ALL_VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Original Price (Rs) <span className="text-red-400">*</span></label>
                                <input type="number" value={form.originalPrice} onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value }))} placeholder="e.g. 55000" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#47704C] focus:ring-1 focus:ring-[#47704C]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Discount Type <span className="text-red-400">*</span></label>
                                    <select value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value as DiscountType }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#47704C]">
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (Rs)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Discount Value <span className="text-red-400">*</span></label>
                                    <input type="number" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))} placeholder={form.discountType === "percentage" ? "e.g. 36" : "e.g. 5000"} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#47704C] focus:ring-1 focus:ring-[#47704C]" />
                                </div>
                            </div>
                            {form.originalPrice && form.discountValue && (
                                <div className="bg-violet-50 rounded-xl p-4 flex items-center justify-between">
                                    <span className="text-sm font-bold text-violet-700">Deal Price Preview</span>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-violet-800">Rs {computeDealPrice().toLocaleString()}</span>
                                        <span className="text-xs text-gray-400 line-through ml-2">Rs {parseFloat(form.originalPrice || "0").toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Start Date & Time <span className="text-red-400">*</span></label>
                                    <input type="datetime-local" value={form.startsAt} onChange={e => setForm(p => ({ ...p, startsAt: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#47704C]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">End Date & Time <span className="text-red-400">*</span></label>
                                    <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#47704C]" />
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50/30">
                            <button onClick={() => setModal({ open: false, editing: null })} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-[#47704C] text-white font-bold hover:bg-[#3a5c40] transition-colors">{modal.editing ? "Update Deal" : "Create Deal"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Deal?</h3>
                            <p className="text-sm text-gray-500 mb-6">Permanently remove <strong>&ldquo;{deleteConfirm.title}&rdquo;</strong>? This cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white pl-4 pr-5 py-3.5 rounded-2xl shadow-2xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-sm font-bold">{toast}</p>
                </div>
            )}
        </div>
    );
}
