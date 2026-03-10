"use client";

import { useState, useEffect } from "react";
import {
    Search, Plus, Zap, Flame, Clock, Trash2, Pencil,
    X, CheckCircle2, Package, TrendingDown, Timer, ToggleLeft
} from "lucide-react";

type DealStatus = "active" | "upcoming" | "expired";

type Deal = {
    id: number;
    productId: string;
    product: string;
    productImage: string;
    originalPrice: number;
    dealPrice: number;
    discountPercentage: number;
    startsAt: string;
    expiresAt: string;
    status: DealStatus;
    sold: number;
};

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
    productId: string;
    discountPercentage: string;
    startsAt: string;
    expiresAt: string;
};

const emptyForm: FormData = {
    productId: "", discountPercentage: "", startsAt: "", expiresAt: "",
};

export default function VendorDealsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | DealStatus>("all");
    const [modal, setModal] = useState<{ open: boolean; editing: Deal | null }>({ open: false, editing: null });
    const [form, setForm] = useState<FormData>(emptyForm);
    const [deleteConfirm, setDeleteConfirm] = useState<Deal | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        fetchDeals();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch("/api/vendor/products");
            if (response.ok) {
                const result = await response.json();
                const productList = result.data?.data || result.data || [];
                setProducts(Array.isArray(productList) ? productList : []);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        }
    };

    const fetchDeals = async () => {
        try {
            const response = await fetch("/api/vendor/deals");
            if (response.ok) {
                const json = await response.json();
                const dealList = json.data?.data || json.data || [];
                const formattedDeals = dealList.map((deal: any) => {
                    let calcStatus: DealStatus = "expired";
                    const now = new Date();
                    const start = new Date(deal.start_date);
                    const end = new Date(deal.end_date);
                    if (now < start) calcStatus = "upcoming";
                    else if (now >= start && now <= end && deal.is_active) calcStatus = "active";

                    return {
                        id: deal.id,
                        productId: deal.product_id,
                        product: deal.products?.name || "Unknown Product",
                        productImage: deal.products?.thumbnail_url || "",
                        originalPrice: parseFloat(deal.original_price),
                        dealPrice: parseFloat(deal.deal_price),
                        discountPercentage: deal.discount_percentage,
                        startsAt: new Date(deal.start_date).toISOString().slice(0, 16),
                        expiresAt: new Date(deal.end_date).toISOString().slice(0, 16),
                        status: calcStatus,
                        sold: 0
                    };
                });
                setDeals(formattedDeals);
            }
        } catch (error) {
            console.error("Failed to fetch deals:", error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const filtered = deals.filter(d => {
        const matchSearch = d.product.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || d.status === filter;
        return matchSearch && matchFilter;
    });

    const openAdd = () => { setForm(emptyForm); setModal({ open: true, editing: null }); };
    const openEdit = (d: Deal) => {
        setForm({ productId: String(d.productId), discountPercentage: String(d.discountPercentage), startsAt: d.startsAt, expiresAt: d.expiresAt });
        setModal({ open: true, editing: d });
    };

    const getSelectedProductPrice = () => {
        const p = products.find(x => x.id === form.productId);
        return p ? parseFloat(p.price) : 0;
    };

    const computeDealPrice = () => {
        const orig = getSelectedProductPrice();
        const discount = parseFloat(form.discountPercentage) || 0;
        return Math.max(0, orig - (orig * discount) / 100);
    };

    const handleSave = async () => {
        if (!form.productId || !form.discountPercentage || !form.startsAt || !form.expiresAt) {
            showToast("Please fill all required fields."); return;
        }

        try {
            if (modal.editing) {
                // In a real app we would have a PATCH endpoint for deals, but we don't seem to have one built yet.
                // Re-doing the POST request below works as POST /api/vendor/deals creates new deals.
                const response = await fetch(`/api/vendor/deals/${modal.editing.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        discount_percentage: parseFloat(form.discountPercentage),
                        start_date: new Date(form.startsAt).toISOString(),
                        end_date: new Date(form.expiresAt).toISOString()
                    })
                });

                if (response.ok) {
                    await fetchDeals();
                    showToast("Deal updated successfully.");
                } else {
                    showToast("Failed to update deal.");
                }
            } else {
                const response = await fetch("/api/vendor/deals", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        product_id: form.productId,
                        discount_percentage: parseFloat(form.discountPercentage),
                        start_date: new Date(form.startsAt).toISOString(),
                        end_date: new Date(form.expiresAt).toISOString()
                    })
                });

                if (response.ok) {
                    await fetchDeals();
                    showToast("Deal created successfully.");
                } else {
                    const errorResponse = await response.json();
                    showToast(errorResponse.error?.message || "Failed to create deal.");
                }
            }
            setModal({ open: false, editing: null });
        } catch (error) {
            console.error("Failed to save deal:", error);
            showToast("Failed to save deal.");
        }
    };

    const handleDelete = async (d: Deal) => {
        try {
            const response = await fetch(`/api/vendor/deals/${d.id}`, {
                method: "DELETE" // Same here, assuming DELETE is or will be implemented
            });

            if (response.ok) {
                setDeals(prev => prev.filter(x => x.id !== d.id));
                setDeleteConfirm(null);
                showToast(`Deal deleted.`);
            } else {
                showToast("Failed to delete deal.");
            }
        } catch (error) {
            console.error("Failed to delete deal:", error);
        }
    };

    const stats = [
        { label: "Total Deals", value: deals.length, icon: Zap, color: "text-violet-600", bg: "bg-violet-50" },
        { label: "Active Now", value: deals.filter(d => d.status === "active").length, icon: Flame, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Upcoming", value: deals.filter(d => d.status === "upcoming").length, icon: Timer, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Total Units Sold", value: deals.reduce((s, d) => s + d.sold, 0), icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
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
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Deals</h1>
                    <p className="text-gray-500 mt-1 text-sm">Create time-limited deals to boost your sales.</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-[#47704C] text-white font-bold rounded-xl hover:bg-[#3a5c40] transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> Create Deal
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
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deals or products..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#47704C] focus:ring-1 focus:ring-[#47704C]" />
                    </div>
                    <div className="flex gap-2">
                        {(["all", "active", "upcoming", "expired"] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${filter === f ? "bg-[#47704C] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{f}</button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="px-6 py-4">Product</th>
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
                                <tr><td colSpan={7} className="px-6 py-16 text-center text-gray-400 font-medium">No deals found. Create your first deal!</td></tr>
                            ) : filtered.map(deal => (
                                <tr key={deal.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {deal.productImage ? (
                                                <div className="w-9 h-9 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
                                                    <img src={deal.productImage} alt={deal.product} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                 <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <Zap className="w-4 h-4 text-violet-500" />
                                                </div>
                                            )}
                                            <span className="font-bold text-gray-900 max-w-[160px] truncate">{deal.product}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 font-black text-sm px-2.5 py-1 rounded-lg">
                                            <TrendingDown className="w-3 h-3" />
                                            {deal.discountPercentage}%
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
                                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-violet-500" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{modal.editing ? "Edit Deal" : "Create Deal"}</h2>
                            </div>
                            <button onClick={() => setModal({ open: false, editing: null })} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Product <span className="text-red-400">*</span></label>
                                <select 
                                    value={form.productId} 
                                    onChange={e => setForm(p => ({ ...p, productId: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#47704C]"
                                    disabled={!!modal.editing} // Cannot change product when editing
                                >
                                    <option value="">Select a product...</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} - Rs {p.price}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Discount Percentage (%) <span className="text-red-400">*</span></label>
                                <input type="number" min="1" max="99" value={form.discountPercentage} onChange={e => setForm(p => ({ ...p, discountPercentage: e.target.value }))} placeholder="e.g. 20" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#47704C] focus:ring-1 focus:ring-[#47704C]" />
                            </div>

                            {/* Live preview */}
                            {form.productId && form.discountPercentage && (
                                <div className="bg-violet-50 rounded-xl p-4 flex items-center justify-between">
                                    <span className="text-sm font-bold text-violet-700">Deal Price Preview</span>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-violet-800">Rs {computeDealPrice().toLocaleString()}</span>
                                        <span className="text-xs text-gray-400 line-through ml-2">Rs {getSelectedProductPrice().toLocaleString()}</span>
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
                            <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-[#47704C] text-white font-bold hover:bg-[#3a5c40] transition-colors">
                                {modal.editing ? "Update Deal" : "Create Deal"}
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
                            <p className="text-sm text-gray-500 mb-6">Permanently remove deal for <strong>&ldquo;{deleteConfirm.product}&rdquo;</strong>? This cannot be undone.</p>
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
