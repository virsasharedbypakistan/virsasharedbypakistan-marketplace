import { DollarSign, Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import Image from "next/image";

export default function VendorDashboardPage() {
    const stats = [
        { name: "Total Revenue", value: "$12,450.00", icon: DollarSign, trend: "+12.5%", color: "text-emerald-600", bg: "bg-emerald-50" },
        { name: "Active Products", value: "145", icon: Package, trend: "+3", color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Total Orders", value: "842", icon: ShoppingBag, trend: "+24.0%", color: "text-indigo-600", bg: "bg-indigo-50" },
        { name: "Store Views", value: "14.2k", icon: Users, trend: "+18.2%", color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor Dashboard</h1>
                <p className="text-gray-500 mt-1 text-sm">Welcome back! Here&apos;s what&apos;s happening in your store today.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:border-virsa-primary/30 transition-colors">
                        {/* Dec background icon */}
                        <stat.icon className="absolute -right-6 -bottom-6 w-24 h-24 text-gray-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />

                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 relative z-10`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                            <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                            <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {stat.trend} <span className="text-gray-400 font-normal ml-1">vs last month</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Mock Chart Area */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
                        <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-virsa-primary">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="aspect-[2/1] bg-gradient-to-t from-virsa-light/20 to-transparent border-b-2 border-virsa-primary/20 rounded-lg flex items-end relative overflow-hidden">
                        {/* Mock Chart Bars */}
                        <div className="absolute inset-0 flex items-end justify-between px-4 pb-0 opacity-80">
                            {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                                <div key={i} className="w-[10%] bg-virsa-primary rounded-t-sm hover:opacity-80 transition-opacity cursor-pointer relative group" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                        ${h * 84}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Orders List */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                        <button className="text-sm font-bold text-virsa-primary hover:underline">View All</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {[1, 2, 3, 4, 5].map((order) => (
                            <div key={order} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-virsa-light/50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                        <Image src={`https://ui-avatars.com/api/?name=Customer+${order}&background=random&color=fff`} alt="avatar" width={40} height={40} className="w-full h-full rounded-lg" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">Customer {order}</h4>
                                        <p className="text-xs text-gray-500">ORD-894{order}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-virsa-primary">${(129.99 * order).toFixed(2)}</span>
                                    <p className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1">Processing</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
