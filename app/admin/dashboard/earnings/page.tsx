"use client";

import { useState, useEffect } from "react";
import { Download, TrendingUp, TrendingDown, LineChart, Users, Store, ShoppingBag, Filter } from "lucide-react";

type EarningsData = {
    totalGMV: number;
    commissionEarned: number;
    activeVendors: number;
    totalOrders: number;
    topVendors: Array<{
        vendor: string;
        orders: number;
        revenue: number;
        commission: number;
    }>;
};

export default function AdminEarningsPage() {
    const [earnings, setEarnings] = useState<EarningsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            const [earningsRes, statsRes] = await Promise.all([
                fetch("/api/admin/earnings"),
                fetch("/api/admin/stats"),
            ]);

            if (earningsRes.ok && statsRes.ok) {
                const earningsJson = await earningsRes.json();
                const statsJson = await statsRes.json();

                const e = earningsJson.data;
                const s = statsJson.data;

                const topVendors = (e.topVendors || []).map((item: any) => ({
                    vendor: item.vendor?.store_name || "Unknown",
                    orders: 0,
                    revenue: 0,
                    commission: item.commission || 0,
                }));

                setEarnings({
                    totalGMV: s.revenue?.total ?? 0,
                    commissionEarned: e.summary?.totalCommission ?? 0,
                    activeVendors: s.vendors?.active ?? 0,
                    totalOrders: s.orders?.total ?? 0,
                    topVendors,
                });
            }
        } catch (error) {
            console.error("Failed to fetch earnings:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-virsa-primary"></div>
            </div>
        );
    }

    const kpis = [
        { label: "Total GMV", value: earnings ? `Rs ${earnings.totalGMV.toLocaleString()}` : "...", icon: LineChart, trend: "+18.4%", up: true, color: "text-virsa-primary", bg: "bg-virsa-primary/10" },
        { label: "Commission Earned (5%)", value: earnings ? `Rs ${earnings.commissionEarned.toLocaleString()}` : "...", icon: TrendingUp, trend: "+18.4%", up: true, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Active Vendors", value: earnings ? String(earnings.activeVendors) : "...", icon: Store, trend: "+4.2%", up: true, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Total Orders", value: earnings ? String(earnings.totalOrders) : "...", icon: ShoppingBag, trend: "-1.2%", up: false, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Earnings</h1>
                    <p className="text-gray-500 mt-1 text-sm">Overview of the total revenue and commission collected across the marketplace.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <select className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                        <option>Last 30 Days</option>
                        <option>This Month</option>
                        <option>Last Month</option>
                        <option>This Year</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                            <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${kpi.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {kpi.trend}
                            </span>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mb-1">{kpi.label}</p>
                        <p className="text-xl font-black text-gray-900">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Earning Vendors */}
                <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Top Earning Vendors</h2>
                        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                    <th className="px-6 py-4">Vendor</th>
                                    <th className="px-6 py-4">Orders</th>
                                    <th className="px-6 py-4">Revenue</th>
                                    <th className="px-6 py-4 text-right">Commission Paid</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {earnings?.topVendors.map((v, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-virsa-light/50 border border-gray-100 flex items-center justify-center font-bold text-virsa-primary text-xs">
                                                    {v.vendor[0]}
                                                </div>
                                                <span className="font-bold text-gray-900">{v.vendor}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{v.orders.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">Rs {v.revenue.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-bold text-virsa-primary">Rs {v.commission.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Commission Summary */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Commission Summary</h2>
                    <div className="space-y-5 flex-1">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Earned (Completed)</p>
                                    <p className="text-base font-bold text-gray-900">
                                        Rs {(earnings?.commissionEarned ?? 0).toLocaleString()}
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-emerald-600">Collected</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{
                                    width: earnings && (earnings.commissionEarned + (earnings.commissionEarned * 0.2)) > 0
                                        ? `${Math.min(100, (earnings.commissionEarned / (earnings.commissionEarned + earnings.commissionEarned * 0.2)) * 100).toFixed(0)}%`
                                        : "0%"
                                }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Platform GMV</p>
                                    <p className="text-base font-bold text-gray-900">
                                        Rs {(earnings?.totalGMV ?? 0).toLocaleString()}
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-blue-600">Total Sales</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-virsa-primary rounded-full" style={{ width: "100%" }} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Active Vendors</span>
                            <span className="font-bold text-gray-900">{earnings?.activeVendors ?? 0}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-2"><Store className="w-4 h-4" /> Top Earning Vendors</span>
                            <span className="font-bold text-gray-900">{earnings?.topVendors?.length ?? 0}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
