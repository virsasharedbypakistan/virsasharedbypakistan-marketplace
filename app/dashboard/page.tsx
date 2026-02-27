import { Package, Truck, RefreshCcw, HandPlatter } from "lucide-react";
import Link from "next/link";

export default function CustomerDashboardPage() {
    const stats = [
        { name: "Total Orders", value: "12", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "To Ship", value: "2", icon: HandPlatter, color: "text-amber-600", bg: "bg-amber-50" },
        { name: "To Receive", value: "1", icon: Truck, color: "text-emerald-600", bg: "bg-emerald-50" },
        { name: "Returns", value: "0", icon: RefreshCcw, color: "text-rose-600", bg: "bg-rose-50" },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden mt-8">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                    <Link href="/dashboard/orders" className="text-sm font-medium text-virsa-primary hover:underline">
                        View All
                    </Link>
                </div>

                <div className="divide-y divide-gray-50">
                    {[1, 2].map((order) => (
                        <div key={order} className="p-6 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-gray-900">Order #ORD-{order}847291</span>
                                    <span className="text-xs text-gray-500">Placed on Oct {12 + order}, 2023</span>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                                    Delivered
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 border border-gray-200"></div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">Premium Wireless Noise-Cancelling Headphones Pro</h3>
                                    <p className="text-sm text-gray-500 mt-1">Sold by: Tech Haven Official</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">Rs 199.99</p>
                                    <p className="text-sm text-gray-500">Qty: 1</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end gap-3">
                                <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                                    Write Review
                                </button>
                                <button className="px-4 py-2 rounded-lg text-sm font-bold text-virsa-primary border border-virsa-primary hover:bg-virsa-primary hover:text-white transition-colors">
                                    Buy Again
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
