"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Users, Store, LineChart, Activity, ShoppingBag, ShieldCheck, Clock, X, CheckCircle2 } from "lucide-react";
import Image from "next/image";

type PendingVendor = { id: string; name: string; email: string; appliedAgo: string; logo: string };

type Stats = {
    totalRevenue: number;
    activeVendors: number;
    totalCustomers: number;
    totalOrders: number;
};

type AnalyticsData = {
    daily: Array<{
        date: string;
        label: string;
        revenue: number;
        commission: number;
    }>;
    summary: {
        totalRevenue: number;
        totalCommission: number;
        averageDaily: number;
    };
};

export default function AdminDashboardPage() {
    const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [approveConfirm, setApproveConfirm] = useState<PendingVendor | null>(null);
    const [rejectConfirm, setRejectConfirm] = useState<PendingVendor | null>(null);
    const [docsModal, setDocsModal] = useState<PendingVendor | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, vendorsRes, analyticsRes] = await Promise.all([
                fetch("/api/admin/stats"),
                fetch("/api/admin/vendors?status=pending&limit=5"),
                fetch("/api/admin/analytics")
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                const s = statsData.data;
                setStats({
                    totalRevenue: s.revenue?.total ?? 0,
                    activeVendors: s.vendors?.active ?? 0,
                    totalCustomers: s.users?.total ?? 0,
                    totalOrders: s.orders?.total ?? 0,
                });
            }

            if (vendorsRes.ok) {
                const vendorsData = await vendorsRes.json();
                const formattedVendors = (vendorsData.data?.data || []).map((v: any) => ({
                    id: v.id,
                    name: v.store_name,
                    email: v.email,
                    appliedAgo: getTimeAgo(v.created_at),
                    logo: v.logo_url || "/images/vendors/vendor1.png"
                }));
                setPendingVendors(formattedVendors);
            }

            if (analyticsRes.ok) {
                const analyticsData = await analyticsRes.json();
                setAnalytics(analyticsData.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffHours < 1) return "Just now";
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return "Yesterday";
        return `${diffDays} days ago`;
    };

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/vendors/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "active" })
            });

            if (res.ok) {
                const v = pendingVendors.find(v => v.id === id);
                setPendingVendors(prev => prev.filter(v => v.id !== id));
                setApproveConfirm(null);
                showToast(`${v?.name} has been approved!`);
            }
        } catch (error) {
            console.error("Failed to approve vendor:", error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/vendors/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "rejected" })
            });

            if (res.ok) {
                const v = pendingVendors.find(v => v.id === id);
                setPendingVendors(prev => prev.filter(v => v.id !== id));
                setRejectConfirm(null);
                showToast(`${v?.name} has been rejected.`);
            }
        } catch (error) {
            console.error("Failed to reject vendor:", error);
        }
    };

    const kpis = [
        { title: "Total Revenue", value: stats ? `Rs ${stats.totalRevenue.toLocaleString()}` : "...", icon: LineChart, trend: "up", percent: "12.5%", bg: "bg-emerald-500", text: "text-white" },
        { title: "Active Vendors", value: stats ? String(stats.activeVendors) : "...", icon: Store, trend: "up", percent: "4.2%", bg: "bg-white", border: "border border-[#E2E8F0]" },
        { title: "Total Customers", value: stats ? String(stats.totalCustomers) : "...", icon: Users, trend: "up", percent: "8.1%", bg: "bg-white", border: "border border-[#E2E8F0]" },
        { title: "Total Orders", value: stats ? String(stats.totalOrders) : "...", icon: ShoppingBag, trend: "down", percent: "1.2%", bg: "bg-white", border: "border border-[#E2E8F0]" },
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
                        <div className="text-sm text-gray-500 font-medium">Last 7 Days</div>
                    </div>
                    {analytics ? (
                        <div className="h-64 flex items-end justify-between gap-2 px-4 relative">
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 border-b border-[#E2E8F0]">
                                {[1, 2, 3, 4, 5].map((_, i) => {
                                    const maxValue = Math.max(...analytics.daily.map(d => d.revenue));
                                    const step = Math.ceil(maxValue / 5000) * 1000;
                                    const value = (5 - i) * step;
                                    return (
                                        <div key={i} className="w-full h-[1px] bg-[#F1F5F9] relative">
                                            <span className="absolute -left-10 -top-2 text-[10px] font-bold text-[#94A3B8]">
                                                {value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="w-full h-full flex items-end justify-around relative z-10 pb-[1px]">
                                {analytics.daily.map((day, i) => {
                                    const maxValue = Math.max(...analytics.daily.map(d => d.revenue));
                                    const revenueHeight = maxValue > 0 ? (day.revenue / maxValue) * 100 : 0;
                                    const commissionHeight = maxValue > 0 ? (day.commission / maxValue) * 100 : 0;
                                    return (
                                        <div key={i} className="flex gap-1 h-full items-end pb-8 group relative">
                                            <div 
                                                className="w-8 bg-[#47704C] rounded-t-md hover:opacity-80 transition-opacity cursor-pointer" 
                                                style={{ height: `${Math.max(revenueHeight, 2)}%` }}
                                                title={`Revenue: Rs ${day.revenue.toLocaleString()}`}
                                            />
                                            <div 
                                                className="w-8 bg-[#FFD242] rounded-t-md hover:opacity-80 transition-opacity cursor-pointer" 
                                                style={{ height: `${Math.max(commissionHeight, 2)}%` }}
                                                title={`Commission: Rs ${day.commission.toLocaleString()}`}
                                            />
                                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                                                Rs {day.revenue.toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="absolute bottom-0 left-0 w-full flex justify-around px-8 pt-4">
                                {analytics.daily.map((day, i) => (
                                    <span key={i} className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{day.label}</span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-virsa-primary"></div>
                        </div>
                    )}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#47704C]" /><span className="text-xs font-medium text-gray-500">Revenue</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#FFD242]" /><span className="text-xs font-medium text-gray-500">Commission</span></div>
                        {analytics && (
                            <div className="ml-auto text-xs text-gray-500">
                                Total: <span className="font-bold text-gray-900">Rs {analytics.summary.totalRevenue.toLocaleString()}</span>
                            </div>
                        )}
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

                    <Link href="/admin/dashboard/applications" className="mt-4 w-full py-2.5 text-sm font-bold text-[#47704C] bg-[#47704C]/5 hover:bg-[#47704C]/10 rounded-xl transition-colors block text-center">
                        View All Applications →
                    </Link>
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
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                                <p className="font-bold mb-1">📋 Quick Review</p>
                                <p>Only CNIC document is collected during vendor registration. For full details, visit the Applications page.</p>
                            </div>

                            <Link 
                                href="/admin/dashboard/applications"
                                onClick={() => setDocsModal(null)}
                                className="block w-full py-3 text-center rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors"
                            >
                                View Full Application Details
                            </Link>

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
