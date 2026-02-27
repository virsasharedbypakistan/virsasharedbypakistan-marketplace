import { ArrowUpRight, ArrowDownRight, Users, Store, LineChart, Activity, ShoppingBag, ShieldCheck, Clock } from "lucide-react";

export default function AdminDashboardPage() {
    const kpis = [
        { title: "Total Revenue", value: "Rs 124,500.00", icon: LineChart, trend: "up", percent: "12.5%", bg: "bg-emerald-500", text: "text-white" },
        { title: "Active Vendors", value: "342", icon: Store, trend: "up", percent: "4.2%", bg: "bg-white", border: "border border-[#E2E8F0]" },
        { title: "Total Customers", value: "45,210", icon: Users, trend: "up", percent: "8.1%", bg: "bg-white", border: "border border-[#E2E8F0]" },
        { title: "Total Orders", value: "12,482", icon: ShoppingBag, trend: "down", percent: "1.2%", bg: "bg-white", border: "border border-[#E2E8F0]" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Platform Overview</h1>
                    <p className="text-sm font-medium text-[#64748B] mt-1">Here&apos;s what&apos;s happening across Virsa Marketplace</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm font-bold text-[#0F172A] shadow-sm">
                        <Clock className="w-4 h-4 text-[#64748B]" />
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#47704C] rounded-lg text-sm font-bold text-white shadow-[#47704C]/25 shadow-lg">
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
                {/* Main Chart Area */}
                <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#47704C]" />
                            Revenue & Commission
                        </h2>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2 px-4 relative">
                        {/* Chart grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 border-b border-[#E2E8F0]">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div key={i} className="w-full h-[1px] bg-[#F1F5F9] relative">
                                    <span className="absolute -left-10 -top-2 text-[10px] font-bold text-[#94A3B8]">{50 - i * 10}k</span>
                                </div>
                            ))}
                        </div>

                        {/* Bars */}
                        <div className="w-full h-full flex items-end justify-around relative z-10 pb-[1px]">
                            {[20, 35, 25, 45, 30, 60, 40].map((h, i) => (
                                <div key={i} className="flex gap-1 h-full items-end pb-8">
                                    <div className="w-8 bg-[#47704C] rounded-t-md hover:opacity-80 transition-opacity cursor-pointer delay-100" style={{ height: `${h}%` }}></div>
                                    <div className="w-8 bg-[#FFD242] rounded-t-md hover:opacity-80 transition-opacity cursor-pointer delay-75" style={{ height: `${h * 0.15}%` }}></div>
                                </div>
                            ))}
                        </div>

                        {/* Labels */}
                        <div className="absolute bottom-0 left-0 w-full flex justify-around px-8 pt-4">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <span key={day} className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{day}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Vendor Approval Queue */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#FFD242]" />
                            Pending Approvals
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#EF4444] text-xs font-bold">12 New</span>
                    </div>

                    <div className="flex-1 space-y-4">
                        {[1, 2, 3].map((vendor) => (
                            <div key={vendor} className="p-4 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors group">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 border border-white shadow-sm flex-shrink-0 relative">
                                            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#0F172A]">Global Tech Electronics {vendor}</h4>
                                            <p className="text-xs font-medium text-[#64748B]">Applied 2 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full">
                                    <button className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-[#ECFDF5] text-[#10B981] hover:bg-[#D1FAE5] transition-colors">Approve</button>
                                    <button className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] transition-colors">Review Docs</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-4 w-full py-2.5 text-sm font-bold text-[#47704C] bg-[#47704C]/5 hover:bg-[#47704C]/10 rounded-xl transition-colors">
                        View All Applications
                    </button>
                </div>
            </div>
        </div>
    );
}
