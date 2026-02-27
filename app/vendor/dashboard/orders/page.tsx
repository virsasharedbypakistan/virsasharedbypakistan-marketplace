import { Search, Filter, ExternalLink, Calendar as CalendarIcon, Package, Truck, CheckCircle, Clock } from "lucide-react";

export default function VendorOrdersPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders Management</h1>
                    <p className="text-gray-500 mt-1 text-sm">Track shipments, process new orders, and manage returns.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Package className="w-5 h-5" /></div>
                    <div><p className="text-[10px] font-bold text-gray-500 uppercase">New Orders</p><p className="text-xl font-bold text-gray-900">42</p></div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
                    <div><p className="text-[10px] font-bold text-gray-500 uppercase">Processing</p><p className="text-xl font-bold text-gray-900">18</p></div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Truck className="w-5 h-5" /></div>
                    <div><p className="text-[10px] font-bold text-gray-500 uppercase">Shipped</p><p className="text-xl font-bold text-gray-900">124</p></div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle className="w-5 h-5" /></div>
                    <div><p className="text-[10px] font-bold text-gray-500 uppercase">Delivered</p><p className="text-xl font-bold text-gray-900">892</p></div>
                </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full md:w-auto overflow-x-auto hide-scrollbar">
                        <button className="px-4 py-1.5 text-sm font-bold bg-white text-gray-900 rounded-md shadow-sm whitespace-nowrap">All Orders</button>
                        <button className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 whitespace-nowrap">Pending (42)</button>
                        <button className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 whitespace-nowrap">Processing (18)</button>
                        <button className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 whitespace-nowrap">Completed</button>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search Order ID or Customer" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary" />
                        </div>
                        <button className="flex items-center gap-2 justify-center w-10 h-10 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors bg-white flex-shrink-0">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-4 md:px-6 md:py-4">Order ID</th>
                                <th className="p-4 md:px-6 md:py-4">Date</th>
                                <th className="p-4 md:px-6 md:py-4">Customer</th>
                                <th className="p-4 md:px-6 md:py-4">Status</th>
                                <th className="p-4 md:px-6 md:py-4">Total</th>
                                <th className="p-4 md:px-6 md:py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <tr key={item} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 md:px-6 md:py-4">
                                        <span className="font-bold text-gray-900">#ORD-94{item}821</span>
                                        <p className="text-xs text-gray-500 mt-1">{item} item(s)</p>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                                            <span>Oct {10 + item}, 2023</span>
                                        </div>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-virsa-light/50 flex-shrink-0 flex items-center justify-center border border-virsa-primary/20">
                                                <span className="text-xs font-bold text-virsa-primary">C{item}</span>
                                            </div>
                                            <span className="font-bold text-gray-700">Customer {item} Name</span>
                                        </div>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        {item <= 2 ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide">New</span>
                                        ) : item <= 4 ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wide">Processing</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">Delivered</span>
                                        )}
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 border-l border-gray-50/50">
                                        <span className="font-black text-gray-900">Rs {129.99 * item}</span>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Paid</p>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 text-right">
                                        {item <= 4 ? (
                                            <button className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                                Update Status
                                            </button>
                                        ) : (
                                            <button className="p-2 text-gray-400 hover:text-virsa-primary hover:bg-virsa-light/30 rounded-lg transition-colors" title="View Details">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
