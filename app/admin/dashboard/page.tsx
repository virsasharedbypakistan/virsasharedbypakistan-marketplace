"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Users, Store, LineChart, Activity, ShoppingBag, ShieldCheck, Clock, X, CheckCircle2 } from "lucide-react";
import Image from "next/image";

type PendingVendor = { id: number; name: string; email: string; appliedAgo: string; logo: string };

const initialPendingVendors: PendingVendor[] = [
    { id: 1, name: "Global Tech Electronics", email: "info@globaltech.pk", appliedAgo: "2 hours ago", logo: "/images/vendors/vendor1.png" },
    { id: 2, name: "Fresh Organics Depot", email: "hello@freshorganics.pk", appliedAgo: "4 hours ago", logo: "/images/vendors/vendor3.jpg" },
    { id: 3, name: "Artisan Wood Works", email: "art@woodworks.pk", appliedAgo: "Yesterday", logo: "/images/vendors/vendor1.png" },
];

const kpis = [
    { title: "Total Revenue", value: "Rs 124,500.00", icon: LineChart, trend: "up", percent: "12.5%", bg: "bg-emerald-500", text: "text-white" },
    { title: "Active Vendors", value: "342", icon: Store, trend: "up", percent: "4.2%", bg: "bg-white", border: "border border-[#E2E8F0]" },
    { title: "Total Customers", value: "45,210", icon: Users, trend: "up", percent: "8.1%", bg: "bg-white", border: "border border-[#E2E8F0]" },
    { title: "Total Orders", value: "12,482", icon: ShoppingBag, trend: "down", percent: "1.2%", bg: "bg-white", border: "border border-[#E2E8F0]" },
];

export default function AdminDashboardPage() {
    const [pendingVendors, setPendingVendors] = useState(initialPendingVendors);
    const [approveConfirm, setApproveConfirm] = useState<PendingVendor | null>(null);
    const [rejectConfirm, setRejectConfirm] = useState<PendingVendor | null>(null);
    const [docsModal, setDocsModal] = useState<PendingVendor | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const handleApprove = (id: number) => {
        const v = pendingVendors.find(v => v.id === id);
        setPendingVendors(prev => prev.filter(v => v.id !== id));
        setApproveConfirm(null);
        showToast(`${v?.name} has been approved!`);
    };

    const handleReject = (id: number) => {
        const v = pendingVendors.find(v => v.id === id);
        setPendingVendors(prev => prev.filter(v => v.id !== id));
        setRejectConfirm(null);
        showToast(`${v?.name} has been rejected.`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Platform Overview</h1>
                    <p className="text-sm font-medium text-[#64748B] mt-1">Here&apos;s what&apos;s happening across Virsa Marketplace</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-bold text-[#0F172A] shadow-sm hover:bg-gray-50 transition-colors">
                        <Clock className="w-4 h-4 text-[#64748B]" />
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#47704C] rounded-lg text-sm font-bold text-white shadow-[#47704C]/25 shadow-lg hover:bg-[#3d6042] transition-colors">
                        <ArrowDownRight className="w-4 h-4" />
                        Download Report
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi) => (
                    <div key={kpi.title} className={`${kpi.bg} ${kpi.border || ""} rounded-2xl p-6 shadow-sm`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${kpi.bg === "bg-white" ? "bg-[#F1F5F9] text-[#64748B]" : "bg-white/20 text-white"}`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${kpi.trend === "up"
                                ? kpi.bg === "bg-white" ? "bg-[#ECFDF5] text-[#10B981]" : "bg-white/20 text-[#D1FAE5]"
                                : kpi.bg === "bg-white" ? "bg-[#FEF2F2] text-[#EF4444]" : "bg-black/10 text-white"
                                }`}>
                                {kpi.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {kpi.percent}
                            </div>
                        </div>
                        <div>
                            <p className={`text-sm font-bold mb-1 ${kpi.bg === "bg-white" ? "text-[#64748B]" : "text-emerald-50"}`}>{kpi.title}</p>
                            <h3 className={`text-3xl font-black tracking-tight ${kpi.bg === "bg-white" ? "text-[#0F172A]" : "text-white"}`}>{kpi.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#47704C]" />
                            Revenue & Commission
                        </h2>
                        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:border-virsa-primary">
                            <option>This Week</option>
                            <option>This Month</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2 px-4 relative">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 border-b border-[#E2E8F0]">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div key={i} className="w-full h-[1px] bg-[#F1F5F9] relative">
                                    <span className="absolute -left-10 -top-2 text-[10px] font-bold text-[#94A3B8]">{50 - i * 10}k</span>
                                </div>
                            ))}
                        </div>
                        <div className="w-full h-full flex items-end justify-around relative z-10 pb-[1px]">
                            {[20, 35, 25, 45, 30, 60, 40].map((h, i) => (
                                <div key={i} className="flex gap-1 h-full items-end pb-8">
                                    <div className="w-8 bg-[#47704C] rounded-t-md hover:opacity-80 transition-opacity cursor-pointer" style={{ height: `${h}%` }} />
                                    <div className="w-8 bg-[#FFD242] rounded-t-md hover:opacity-80 transition-opacity cursor-pointer" style={{ height: `${h * 0.15}%` }} />
                                </div>
                            ))}
                        </div>
                        <div className="absolute bottom-0 left-0 w-full flex justify-around px-8 pt-4">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                                <span key={day} className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{day}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#47704C]" /><span className="text-xs font-medium text-gray-500">Revenue</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#FFD242]" /><span className="text-xs font-medium text-gray-500">Commission</span></div>
                    </div>
                </div>

                {/* Vendor Approval Queue */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#FFD242]" />
                            Pending Approvals
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#EF4444] text-xs font-bold">{pendingVendors.length} New</span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-64">
                        {pendingVendors.length === 0 && (
                            <div className="text-center py-6">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                                <p className="text-sm font-bold text-gray-500">All applications reviewed!</p>
                            </div>
                        )}
                        {pendingVendors.map(vendor => (
                            <div key={vendor.id} className="p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0 border border-gray-200">
                                        <Image src={vendor.logo} alt={vendor.name} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#0F172A]">{vendor.name}</h4>
                                        <p className="text-xs font-medium text-[#64748B]">Applied {vendor.appliedAgo}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full">
                                    <button onClick={() => setApproveConfirm(vendor)} className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5] transition-colors">Approve</button>
                                    <button onClick={() => setDocsModal(vendor)} className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] transition-colors">Review Docs</button>
                                    <button onClick={() => setRejectConfirm(vendor)} className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-4 w-full py-2.5 text-sm font-bold text-[#47704C] bg-[#47704C]/5 hover:bg-[#47704C]/10 rounded-xl transition-colors">
                        View All Applications
                    </button>
                </div>
            </div>

            {/* Approve Confirm */}
            {approveConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setApproveConfirm(null)}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4"><ShieldCheck className="w-6 h-6 text-emerald-500" /></div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Approve Vendor?</h3>
                            <p className="text-sm text-gray-500 mb-6">Grant <strong>{approveConfirm.name}</strong> full marketplace access?</p>
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
                            <p className="text-sm text-gray-500 mb-6">Reject <strong>{rejectConfirm.name}</strong>&apos;s application and remove them?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setRejectConfirm(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                                <button onClick={() => handleReject(rejectConfirm.id)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">Reject</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Docs Review Modal */}
            {docsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDocsModal(null)}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Vendor Documents</h2>
                            <button onClick={() => setDocsModal(null)} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                                <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                                    <Image src={docsModal.logo} alt={docsModal.name} fill className="object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{docsModal.name}</h3>
                                    <p className="text-xs text-gray-500">{docsModal.email}</p>
                                </div>
                            </div>
                            {["CNIC / Passport", "Business Registration", "Bank Statement", "Tax ID / NTN"].map(doc => (
                                <div key={doc} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <span className="text-sm font-medium text-gray-700">{doc}</span>
                                    <div className="flex gap-2">
                                        <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">Submitted</span>
                                        <button className="text-xs font-bold text-virsa-primary hover:underline">View</button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => { setDocsModal(null); setApproveConfirm(docsModal); }} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors">Approve Vendor</button>
                                <button onClick={() => { setDocsModal(null); setRejectConfirm(docsModal); }} className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors">Reject</button>
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
