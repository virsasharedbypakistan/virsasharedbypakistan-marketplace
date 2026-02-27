import { Search, Filter, MoreHorizontal, ShoppingBag, Truck, CheckCircle2, Clock } from "lucide-react";

export default function AdminOrdersPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Global Orders</h1>
                    <p className="text-gray-500 mt-1 text-sm">Monitor and manage all orders across the marketplace.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Orders", value: "12,482", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Pending", value: "452", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "In Transit", value: "891", icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Completed", value: "11,139", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} flex-shrink-0`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search order ID or customer..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary" />
                        </div>
                        <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white focus:outline-none focus:border-virsa-primary appearance-none cursor-pointer">
                            <option>All Statuses</option>
                            <option>Pending</option>
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                        </select>
                        <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white focus:outline-none focus:border-virsa-primary appearance-none cursor-pointer">
                            <option>Last 30 Days</option>
                            <option>Last 3 Months</option>
                            <option>This Year</option>
                        </select>
                    </div>

                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors w-full md:w-auto">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-4 md:px-6 md:py-4">Order ID</th>
                                <th className="p-4 md:px-6 md:py-4">Customer</th>
                                <th className="p-4 md:px-6 md:py-4">Vendor</th>
                                <th className="p-4 md:px-6 md:py-4">Date</th>
                                <th className="p-4 md:px-6 md:py-4">Amount</th>
                                <th className="p-4 md:px-6 md:py-4">Status</th>
                                <th className="p-4 md:px-6 md:py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {[
                                { id: "ORD-9428", customer: "John Smith", vendor: "Tech Haven PK", date: "Oct 24, 2023", amount: "Rs 4,500.00", status: "Delivered" },
                                { id: "ORD-9427", customer: "Sarah Connor", vendor: "Fashion Hub", date: "Oct 24, 2023", amount: "Rs 1,250.00", status: "Shipped" },
                                { id: "ORD-9426", customer: "Ahmed Ali", vendor: "Electronics Pro", date: "Oct 23, 2023", amount: "Rs 12,999.00", status: "Processing" },
                                { id: "ORD-9425", customer: "Fatima Noor", vendor: "Home Essentials", date: "Oct 23, 2023", amount: "Rs 450.00", status: "Pending" },
                                { id: "ORD-9424", customer: "Michael Doe", vendor: "Tech Haven PK", date: "Oct 22, 2023", amount: "Rs 8,400.00", status: "Delivered" },
                                { id: "ORD-9423", customer: "Ayesha Khan", vendor: "Beauty Store", date: "Oct 22, 2023", amount: "Rs 3,200.00", status: "Cancelled" },
                            ].map((order, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 md:px-6 md:py-4 font-medium text-virsa-primary">
                                        {order.id}
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 text-gray-900 font-medium">
                                        {order.customer}
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 text-gray-600">
                                        {order.vendor}
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 text-gray-500">
                                        {order.date}
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 font-bold text-gray-900">
                                        {order.amount}
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                order.status === 'Shipped' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                                    order.status === 'Processing' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                        order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                            'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 text-right">
                                        <button className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Dummy */}
                <div className="p-4 md:p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <span className="text-xs text-gray-500 font-medium">Showing 1 to 10 of 12,482 orders</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-400 bg-white disabled:opacity-50" disabled>PREV</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">NEXT</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
