import { Download, TrendingUp, TrendingDown, LineChart, Users, Store, ShoppingBag, Filter } from "lucide-react";

export default function AdminEarningsPage() {
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
                {[
                    { label: "Total GMV", value: "Rs 24,58,000", icon: LineChart, trend: "+18.4%", up: true, color: "text-virsa-primary", bg: "bg-virsa-primary/10" },
                    { label: "Commission Earned (5%)", value: "Rs 1,22,900", icon: TrendingUp, trend: "+18.4%", up: true, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Active Vendors", value: "342", icon: Store, trend: "+4.2%", up: true, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Total Orders", value: "12,482", icon: ShoppingBag, trend: "-1.2%", up: false, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((kpi, idx) => (
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
                                {[
                                    { vendor: "Tech Haven PK", orders: 842, revenue: "Rs 9,84,200", commission: "Rs 49,210" },
                                    { vendor: "Electronics Pro", orders: 612, revenue: "Rs 7,45,000", commission: "Rs 37,250" },
                                    { vendor: "Fashion Hub", orders: 1240, revenue: "Rs 4,28,000", commission: "Rs 21,400" },
                                    { vendor: "Home Essentials", orders: 388, revenue: "Rs 2,10,500", commission: "Rs 10,525" },
                                    { vendor: "Beauty Store", orders: 294, revenue: "Rs 1,80,100", commission: "Rs 9,005" },
                                ].map((v, idx) => (
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
                                        <td className="px-6 py-4 font-bold text-gray-900">{v.revenue}</td>
                                        <td className="px-6 py-4 text-right font-bold text-virsa-primary">{v.commission}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Sources</h2>
                    <div className="space-y-6 flex-1">
                        {[
                            { label: "Electronics", amount: "Rs 17,29,200", percentage: "70%", color: "bg-virsa-primary" },
                            { label: "Fashion", amount: "Rs 4,28,000", percentage: "17%", color: "bg-indigo-500" },
                            { label: "Home & Kitchen", amount: "Rs 2,10,500", percentage: "8.5%", color: "bg-orange-500" },
                            { label: "Beauty", amount: "Rs 1,80,100", percentage: "7%", color: "bg-pink-400" },
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{item.label}</p>
                                        <p className="text-base font-bold text-gray-900">{item.amount}</p>
                                    </div>
                                    <span className="text-xs font-bold text-gray-500">{item.percentage}</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color} rounded-full`} style={{ width: item.percentage }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-2"><Users className="w-4 h-4" /> New Customers</span>
                            <span className="font-bold text-gray-900">+1,240</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-2"><Store className="w-4 h-4" /> New Vendors</span>
                            <span className="font-bold text-gray-900">+12</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
