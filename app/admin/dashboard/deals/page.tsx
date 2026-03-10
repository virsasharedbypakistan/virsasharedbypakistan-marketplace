"use client";

import { useState, useEffect } from "react";
import {
    Search, Plus, Zap, Flame, Clock, Trash2, Pencil,
    X, CheckCircle2, Package, TrendingDown, Timer, ToggleLeft, Store
} from "lucide-react";

type DealStatus = "active" | "upcoming" | "expired";

type Deal = {
    id: string;
    product: string;          // display name
    productId: string;        // UUID
    vendor: string;           // display name
    vendorId: string;         // UUID
    createdBy: "admin" | "vendor";
    originalPrice: number;
    dealPrice: number;
    discountPercentage: number;
    startDate: string;
    endDate: string;
    status: DealStatus;
    isActive: boolean;
};

type ProductOption = { id: string; name: string; price: number; vendor_id: string; vendor_name: string };
type VendorOption  = { id: string; store_name: string };

const statusStyle = (s: DealStatus) => {
    switch (s) {
        case "active":   return "bg-emerald-50 text-emerald-600 border-emerald-100";
        case "upcoming": return "bg-blue-50 text-blue-600 border-blue-100";
        case "expired":  return "bg-gray-50 text-gray-500 border-gray-100";
    }
};

const statusIcon = (s: DealStatus) => {
    switch (s) {
        case "active":   return <Flame className="w-3 h-3" />;
        case "upcoming": return <Timer className="w-3 h-3" />;
        case "expired":  return <ToggleLeft className="w-3 h-3" />;
    }
};

type FormData = {
    productId: string;
    discountPercentage: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
};

const emptyForm: FormData = {
    productId: "",
    discountPercentage: "",
    startDate: "",
    endDate: "",
    isActive: true,
};

function getDealStatus(startDate: string, endDate: string): DealStatus {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return "upcoming";
    if (now > end)   return "expired";
    return "active";
}

export default function AdminDealsPage() {
    const [deals, setDeals]               = useState<Deal[]>([]);
    const [loading, setLoading]           = useState(true);
    const [search, setSearch]             = useState("");
    const [filter, setFilter]             = useState<"all" | DealStatus>("all");
    const [creatorFilter, setCreatorFilter] = useState<"all" | "admin" | "vendor">("all");
    const [modal, setModal]               = useState<{ open: boolean; editing: Deal | null }>({ open: false, editing: null });
    const [form, setForm]                 = useState<FormData>(emptyForm);
    const [deleteConfirm, setDeleteConfirm] = useState<Deal | null>(null);
    const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null);
    const [saving, setSaving]             = useState(false);
    const [currentPage, setCurrentPage]   = useState(1);
    const itemsPerPage = 10;

    // Dropdown options
    const [products, setProducts]         = useState<ProductOption[]>([]);
    const [vendors, setVendors]           = useState<VendorOption[]>([]);
    const [optionsLoading, setOptionsLoading] = useState(false);

    useEffect(() => {
        fetchDeals();
        fetchFormOptions();
    }, []);

    // ── Fetch product + vendor options ───────────────────────────────
    const fetchFormOptions = async () => {
        setOptionsLoading(true);
        try {
            const [prodRes, vendorRes] = await Promise.all([
                fetch("/api/products?limit=200"),
                fetch("/api/vendors?limit=200"),
            ]);

            if (prodRes.ok) {
                const pd = await prodRes.json();
                const list: any[] = pd.data?.data || pd.data || [];
                setProducts(
                    list.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        price: parseFloat(p.price) || 0,
                        vendor_id: p.vendor_id,
                        vendor_name: p.vendor?.store_name || p.vendor_name || "",
                    }))
                );
            }

            if (vendorRes.ok) {
                const vd = await vendorRes.json();
                const list: any[] = vd.data?.data || vd.data || [];
                setVendors(list.map((v: any) => ({ id: v.id, store_name: v.store_name })));
            }
        } catch (err) {
            console.error("Failed to load form options:", err);
        } finally {
            setOptionsLoading(false);
        }
    };

    // ── Fetch all deals ──────────────────────────────────────────────
    const fetchDeals = async () => {
        try {
            const res = await fetch("/api/admin/deals?limit=200");
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error("[fetchDeals] error:", err);
                return;
            }
            const json = await res.json();
            // API returns { data: { data: [...], pagination: {...} } }
            const list: any[] = json.data?.data || json.data || [];

            const formatted: Deal[] = list.map((d: any) => ({
                id:                 d.id,
                product:            d.products?.name   ?? "Unknown Product",
                productId:          d.product_id,
                vendor:             d.vendors?.store_name ?? "Unknown Vendor",
                vendorId:           d.vendor_id,
                createdBy:          "admin",          // only admin can create via this page
                originalPrice:      parseFloat(d.original_price) || 0,
                dealPrice:          parseFloat(d.deal_price)     || 0,
                discountPercentage: parseFloat(d.discount_percentage) || 0,
                startDate:          d.start_date,
                endDate:            d.end_date,
                status:             getDealStatus(d.start_date, d.end_date),
                isActive:           d.is_active,
            }));

            setDeals(formatted);
        } catch (error) {
            console.error("Failed to fetch deals:", error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg: string, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Selected product helper ───────────────────────────────────────
    const selectedProduct = products.find(p => p.id === form.productId);
    const computedDealPrice = selectedProduct
        ? Math.max(0, selectedProduct.price * (1 - parseFloat(form.discountPercentage || "0") / 100))
        : 0;

    // ── Filtering ────────────────────────────────────────────────────
    const filtered = deals.filter(d => {
        const s = search.toLowerCase();
        const matchSearch  = d.product.toLowerCase().includes(s) || d.vendor.toLowerCase().includes(s);
        const matchFilter  = filter === "all" || d.status === filter;
        const matchCreator = creatorFilter === "all" || d.createdBy === creatorFilter;
        return matchSearch && matchFilter && matchCreator;
    });

    // ── Pagination ───────────────────────────────────────────────────
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDeals = filtered.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filter, creatorFilter]);

    // ── Modals ───────────────────────────────────────────────────────
    const openAdd  = () => { setForm(emptyForm); setModal({ open: true, editing: null }); };
    const openEdit = (d: Deal) => {
        // Convert ISO dates to datetime-local format (YYYY-MM-DDTHH:mm)
        const toLocal = (iso: string) => {
            if (!iso) return "";
            return new Date(iso).toISOString().slice(0, 16);
        };
        setForm({
            productId:          d.productId,
            discountPercentage: String(d.discountPercentage),
            startDate:          toLocal(d.startDate),
            endDate:            toLocal(d.endDate),
            isActive:           d.isActive,
        });
        setModal({ open: true, editing: d });
    };
    const closeModal = () => setModal({ open: false, editing: null });

    // ── Save (create / update) ───────────────────────────────────────
    const handleSave = async () => {
        if (!form.productId || !form.discountPercentage || !form.startDate || !form.endDate) {
            showToast("Please fill all required fields.", false);
            return;
        }
        const pct = parseFloat(form.discountPercentage);
        if (isNaN(pct) || pct < 1 || pct > 99) {
            showToast("Discount must be between 1% and 99%.", false);
            return;
        }
        if (new Date(form.endDate) <= new Date(form.startDate)) {
            showToast("End date must be after start date.", false);
            return;
        }

        setSaving(true);
        try {
            if (modal.editing) {
                // ── EDIT ──
                const res = await fetch(`/api/admin/deals/${modal.editing.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        discount_percentage: pct,
                        start_date:          new Date(form.startDate).toISOString(),
                        end_date:            new Date(form.endDate).toISOString(),
                        is_active:           form.isActive,
                    }),
                });
                if (res.ok) {
                    await fetchDeals();
                    showToast("Deal updated successfully.");
                    closeModal();
                } else {
                    const err = await res.json().catch(() => ({}));
                    showToast(err?.error || "Failed to update deal.", false);
                }
            } else {
                // ── CREATE ──
                const res = await fetch("/api/admin/deals", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        product_id:          form.productId,
                        discount_percentage: pct,
                        start_date:          new Date(form.startDate).toISOString(),
                        end_date:            new Date(form.endDate).toISOString(),
                        is_active:           form.isActive,
                    }),
                });
                if (res.ok) {
                    await fetchDeals();
                    showToast("Deal created successfully.");
                    closeModal();
                } else {
                    const err = await res.json().catch(() => ({}));
                    showToast(err?.error || "Failed to create deal.", false);
                }
            }
        } catch (error) {
            console.error("Failed to save deal:", error);
            showToast("Unexpected error. Please try again.", false);
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ───────────────────────────────────────────────────────
    const handleDelete = async (d: Deal) => {
        try {
            const res = await fetch(`/api/admin/deals/${d.id}`, { method: "DELETE" });
            if (res.ok) {
                setDeals(prev => prev.filter(x => x.id !== d.id));
                setDeleteConfirm(null);
                showToast(`"${d.product}" deal deleted.`);
            } else {
                showToast("Failed to delete deal.", false);
            }
        } catch (error) {
            console.error("Failed to delete deal:", error);
            showToast("Unexpected error.", false);
        }
    };

    // ── Stats ────────────────────────────────────────────────────────
    const stats = [
        { label: "Total Deals",   value: deals.length,                                          icon: Zap,   color: "text-violet-600", bg: "bg-violet-50" },
        { label: "Active Now",    value: deals.filter(d => d.status === "active").length,        icon: Flame, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Upcoming",      value: deals.filter(d => d.status === "upcoming").length,      icon: Timer, color: "text-blue-600",    bg: "bg-blue-50"   },
        { label: "Expired",       value: deals.filter(d => d.status === "expired").length,       icon: Package, color: "text-amber-600", bg: "bg-amber-50"  },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-virsa-primary"></div>
            </div>
        );
    }

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
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, vendors…" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#47704C] focus:ring-1 focus:ring-[#47704C]" />
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
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Discount</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Validity</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-16 text-center text-gray-400 font-medium">No deals found.</td></tr>
                            ) : paginatedDeals.map(deal => (
                                <tr key={deal.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0"><Zap className="w-4 h-4 text-violet-500" /></div>
                                            <span className="font-bold text-gray-900 block max-w-[180px] truncate">{deal.product}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium"><Store className="w-3.5 h-3.5 text-gray-400" />{deal.vendor}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${deal.createdBy === "admin" ? "bg-violet-50 text-violet-600 border-violet-100" : "bg-sky-50 text-sky-600 border-sky-100"}`}>
                                            {deal.createdBy === "admin" ? "Platform" : "Vendor"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 font-black text-sm px-2.5 py-1 rounded-lg">
                                            <TrendingDown className="w-3 h-3" />{deal.discountPercentage}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-black text-gray-900 block">Rs {deal.dealPrice.toLocaleString()}</span>
                                        <span className="text-xs text-gray-400 line-through">Rs {deal.originalPrice.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(deal.startDate).toLocaleDateString()} → {new Date(deal.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${statusStyle(deal.status)}`}>
                                            {statusIcon(deal.status)} {deal.status}
                                        </span>
                                    </td>
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 md:p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <span className="text-xs text-gray-500">
                            Showing {startIndex + 1}-{Math.min(endIndex, filtered.length)} of {filtered.length}
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                PREV
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                            currentPage === page 
                                                ? 'bg-virsa-primary text-white' 
                                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                NEXT
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={closeModal}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center"><Zap className="w-4 h-4 text-violet-500" /></div>
                                <h2 className="text-xl font-bold text-gray-900">{modal.editing ? "Edit Deal" : "Create Platform Deal"}</h2>
                            </div>
                            <button onClick={closeModal} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {/* Product selector — only shown on create */}
                            {!modal.editing && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Product <span className="text-red-400">*</span></label>
                                    <select
                                        value={form.productId}
                                        onChange={e => setForm(p => ({ ...p, productId: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#47704C]"
                                        disabled={optionsLoading}
                                    >
                                        <option value="">{optionsLoading ? "Loading products…" : "Select product"}</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} — Rs {p.price.toLocaleString()}</option>
                                        ))}
                                    </select>
                                    {selectedProduct && (
                                        <p className="text-xs text-gray-500 mt-1">Vendor: <span className="font-semibold">{selectedProduct.vendor_name || vendors.find(v => v.id === selectedProduct.vendor_id)?.store_name || "—"}</span></p>
                                    )}
                                </div>
                            )}
                            {modal.editing && (
                                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-violet-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500">Product</p>
                                        <p className="text-sm font-bold text-gray-900">{modal.editing.product}</p>
                                    </div>
                                </div>
                            )}

                            {/* Discount percentage */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Discount Percentage (%) <span className="text-red-400">*</span></label>
                                <input
                                    type="number" min="1" max="99"
                                    value={form.discountPercentage}
                                    onChange={e => setForm(p => ({ ...p, discountPercentage: e.target.value }))}
                                    placeholder="e.g. 20"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#47704C] focus:ring-1 focus:ring-[#47704C]"
                                />
                            </div>

                            {/* Deal price preview */}
                            {selectedProduct && form.discountPercentage && (
                                <div className="bg-violet-50 rounded-xl p-4 flex items-center justify-between">
                                    <span className="text-sm font-bold text-violet-700">Deal Price Preview</span>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-violet-800">Rs {computedDealPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        <span className="text-xs text-gray-400 line-through ml-2">Rs {selectedProduct.price.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            {/* Date range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Start Date &amp; Time <span className="text-red-400">*</span></label>
                                    <input type="datetime-local" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#47704C]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">End Date &amp; Time <span className="text-red-400">*</span></label>
                                    <input type="datetime-local" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#47704C]" />
                                </div>
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? "bg-[#47704C]" : "bg-gray-200"}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0"}`} />
                                </button>
                                <span className="text-sm font-medium text-gray-700">Active immediately</span>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50/30">
                            <button onClick={closeModal} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-[#47704C] text-white font-bold hover:bg-[#3a5c40] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                                {saving ? "Saving…" : (modal.editing ? "Update Deal" : "Create Deal")}
                            </button>
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
                            <p className="text-sm text-gray-500 mb-6">Permanently remove the deal for <strong>&ldquo;{deleteConfirm.product}&rdquo;</strong>? This cannot be undone.</p>
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
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 pl-4 pr-5 py-3.5 rounded-2xl shadow-2xl ${toast.ok ? "bg-gray-900 text-white" : "bg-red-600 text-white"}`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-sm font-bold">{toast.msg}</p>
                </div>
            )}
        </div>
    );
}
