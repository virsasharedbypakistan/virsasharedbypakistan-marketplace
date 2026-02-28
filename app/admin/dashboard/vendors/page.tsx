"use client";

import { useState } from "react";
import { Search, MoreHorizontal, ShieldCheck, Download, Store, TrendingUp, AlertCircle, X, Eye, CheckCircle2, Ban, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Vendor = {
    id: number;
    name: string;
    owner: string;
    email: string;
    status: "Active" | "Pending" | "Suspended";
    products: number;
    revenue: string;
    joined: string;
    logo: string;
};

const VENDOR_IMAGES = ["/images/vendors/vendor1.png", "/images/vendors/vendor3.jpg"];

const initialVendors: Vendor[] = [
    { id: 1, name: "Khyber Crafts Official", owner: "Ahmed Yusuf", email: "ahmed@khybercrafts.pk", status: "Active", products: 48, revenue: "Rs 124.4k", joined: "Oct 11, 2023", logo: VENDOR_IMAGES[0] },
    { id: 2, name: "Sindh Heritage Store", owner: "Mariam Fatima", email: "mariam@sindhheritage.pk", status: "Pending", products: 0, revenue: "Rs 0", joined: "Oct 25, 2023", logo: VENDOR_IMAGES[1] },
    { id: 3, name: "Multan Art House", owner: "Zubair Malik", email: "zubair@multanart.pk", status: "Active", products: 72, revenue: "Rs 284.2k", joined: "Oct 13, 2023", logo: VENDOR_IMAGES[0] },
    { id: 4, name: "Lahori Bazaar", owner: "Nida Rehman", email: "nida@lahoribazaar.pk", status: "Active", products: 104, revenue: "Rs 341.8k", joined: "Oct 14, 2023", logo: VENDOR_IMAGES[1] },
    { id: 5, name: "Desert Crafts Co", owner: "Tariq Shah", email: "tariq@desertcrafts.pk", status: "Active", products: 29, revenue: "Rs 71.0k", joined: "Oct 15, 2023", logo: VENDOR_IMAGES[0] },
    { id: 6, name: "Baloch Traditions", owner: "Hamza Qureshi", email: "hamza@baloch.pk", status: "Suspended", products: 15, revenue: "Rs 42.6k", joined: "Oct 16, 2023", logo: VENDOR_IMAGES[1] },
];

const statusStyle = (s: string) => {
    switch (s) {
        case "Active": return "bg-emerald-50 text-emerald-600 border-emerald-100";
        case "Pending": return "bg-amber-50 text-amber-600 border-amber-100";
        case "Suspended": return "bg-red-50 text-red-600 border-red-100";
        default: return "bg-gray-50 text-gray-600";
    }
};

export default function AdminVendorsPage() {
    const [vendors, setVendors] = useState(initialVendors);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState<number | null>(null);
    const [viewModal, setViewModal] = useState<{ open: boolean; vendor: Vendor | null }>({ open: false, vendor: null });
    const [approveConfirm, setApproveConfirm] = useState<Vendor | null>(null);
    const [rejectConfirm, setRejectConfirm] = useState<Vendor | null>(null);
    const [suspendConfirm, setSuspendConfirm] = useState<Vendor | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const filtered = vendors.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleApprove = (id: number) => {
        const v = vendors.find(v => v.id === id);
        setVendors(prev => prev.map(v => v.id === id ? { ...v, status: "Active" } : v));
        setApproveConfirm(null); setMenuOpen(null);
        showToast(`${v?.name} has been approved.`);
    };

    const handleReject = (id: number) => {
        setVendors(prev => prev.filter(v => v.id !== id));
        setRejectConfirm(null); setMenuOpen(null);
        showToast("Vendor application rejected and removed.");
    };

    const handleSuspend = (id: number) => {
        const v = vendors.find(v => v.id === id);
        setVendors(prev => prev.map(v => v.id === id ? { ...v, status: v.status === "Suspended" ? "Active" : "Suspended" } : v));
        setSuspendConfirm(null); setMenuOpen(null);
        showToast(v?.status === "Suspended" ? `${v.name} has been reactivated.` : `${v?.name} has been suspended.`);
    };

    const handleDelete = (id: number) => {
        setVendors(prev => prev.filter(v => v.id !== id));
        setDeleteConfirm(null);
        showToast("Vendor account deleted successfully.");
    };

    const vendorToDelete = vendors.find(v => v.id === deleteConfirm);

    return (
        <div className="space-y-6" onClick={() => setMenuOpen(null)}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendors Management</h1>
                    <p className="text-gray-500 mt-1 text-sm">Review, approve, and manage marketplace sellers.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Vendors", value: vendors.length, icon: Store, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active", value: vendors.filter(v => v.status === "Active").length, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Pending Approval", value: vendors.filter(v => v.status === "Pending").length, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Suspended", value: vendors.filter(v => v.status === "Suspended").length, icon: TrendingUp, color: "text-red-600", bg: "bg-red-50" },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}><s.icon className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{s.label}</h3>
                            <p className="text-2xl font-black text-gray-900 leading-none mt-0.5">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by store name, email..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary"
                        />
                    </div>
                    <span className="text-xs text-gray-500">Showing {filtered.length} vendors</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="px-6 py-4">Store Details</th>
                                <th className="px-6 py-4">Owner Info</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Products</th>
                                <th className="px-6 py-4">Total Revenue</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filtered.map(vendor => (
                                <tr key={vendor.id} className={`hover:bg-gray-50/50 transition-colors ${vendor.status === "Pending" ? "bg-amber-50/20" : ""}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 relative">
                                                <Image src={vendor.logo} alt={vendor.name} fill className="object-cover" />
                                            </div>
                                            <div>
                                                <Link href={`/vendor/${vendor.id}`} className="font-bold text-gray-900 hover:text-virsa-primary transition-colors block">{vendor.name}</Link>
                                                <p className="text-[11px] text-gray-500 mt-0.5">Joined: {vendor.joined}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900 block">{vendor.owner}</span>
                                        <span className="text-[11px] text-gray-500">{vendor.email}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${statusStyle(vendor.status)}`}>
                                            {vendor.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-700">{vendor.products} items</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-black text-gray-900">{vendor.revenue}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {vendor.status === "Pending" ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setApproveConfirm(vendor)} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">Approve</button>
                                                <button onClick={() => setRejectConfirm(vendor)} className="px-3 py-1.5 bg-white border border-gray-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors">Reject</button>
                                            </div>
                                        ) : (
                                            <div className="relative" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => setMenuOpen(menuOpen === vendor.id ? null : vendor.id)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md transition-colors">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                                {menuOpen === vendor.id && (
                                                    <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 w-44">
                                                        <button onClick={() => { setViewModal({ open: true, vendor }); setMenuOpen(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                            <Eye className="w-4 h-4 text-gray-400" /> View Details
                                                        </button>
                                                        <button onClick={() => { setSuspendConfirm(vendor); setMenuOpen(null); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-2 ${vendor.status === "Suspended" ? "text-emerald-600" : "text-amber-600"}`}>
                                                            <Ban className="w-4 h-4" /> {vendor.status === "Suspended" ? "Reactivate" : "Suspend"}
                                                        </button>
                                                        <button onClick={() => { setDeleteConfirm(vendor.id); setMenuOpen(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                            <Trash2 className="w-4 h-4" /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Approve Confirm */}
            {approveConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setApproveConfirm(null)}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4"><ShieldCheck className="w-6 h-6 text-emerald-500" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Approve Vendor?</h3>
                            <p className="text-sm text-gray-500 mb-6">This will grant <strong>{approveConfirm.name}</strong> full access to sell on the marketplace.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setApproveConfirm(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                                <button onClick={() => handleApprove(approveConfirm.id)} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors">Approve</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Confirm */}
            {rejectConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setRejectConfirm(null)}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><X className="w-6 h-6 text-red-500" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Application?</h3>
                            <p className="text-sm text-gray-500 mb-6">This will reject and remove <strong>{rejectConfirm.name}</strong>&apos;s application.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setRejectConfirm(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                                <button onClick={() => handleReject(rejectConfirm.id)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">Reject</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend Confirm */}
            {suspendConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSuspendConfirm(null)}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${suspendConfirm.status === "Suspended" ? "bg-emerald-50" : "bg-amber-50"}`}>
                                <Ban className={`w-6 h-6 ${suspendConfirm.status === "Suspended" ? "text-emerald-500" : "text-amber-500"}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{suspendConfirm.status === "Suspended" ? "Reactivate Vendor?" : "Suspend Vendor?"}</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {suspendConfirm.status === "Suspended" ? `Restore selling access for ${suspendConfirm.name}?` : `This will suspend ${suspendConfirm.name}'s store and prevent new sales.`}
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setSuspendConfirm(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                                <button onClick={() => handleSuspend(suspendConfirm.id)} className={`flex-1 py-3 rounded-xl text-white font-bold transition-colors ${suspendConfirm.status === "Suspended" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-600"}`}>
                                    {suspendConfirm.status === "Suspended" ? "Reactivate" : "Suspend"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm !== null && vendorToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Vendor?</h3>
                            <p className="text-sm text-gray-500 mb-6">Permanently delete <strong>"{vendorToDelete.name}"</strong> and all their data?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Vendor Modal */}
            {viewModal.open && viewModal.vendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setViewModal({ open: false, vendor: null })}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Vendor Details</h2>
                            <button onClick={() => setViewModal({ open: false, vendor: null })} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                                <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0">
                                    <Image src={viewModal.vendor.logo} alt={viewModal.vendor.name} fill className="object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{viewModal.vendor.name}</h3>
                                    <p className="text-sm text-gray-500">{viewModal.vendor.email}</p>
                                    <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle(viewModal.vendor.status)}`}>{viewModal.vendor.status}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-gray-50 rounded-xl p-3"><p className="text-lg font-black text-gray-900">{viewModal.vendor.products}</p><p className="text-xs text-gray-500">Products</p></div>
                                <div className="bg-gray-50 rounded-xl p-3"><p className="text-sm font-black text-gray-900">{viewModal.vendor.revenue}</p><p className="text-xs text-gray-500">Revenue</p></div>
                                <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs font-bold text-gray-900">{viewModal.vendor.joined}</p><p className="text-xs text-gray-500">Joined</p></div>
                            </div>
                            <button onClick={() => setViewModal({ open: false, vendor: null })} className="w-full py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors">Close</button>
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
