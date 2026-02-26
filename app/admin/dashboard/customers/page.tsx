import { Search, Filter, MoreHorizontal, Users, DollarSign, ShoppingBag, Mail } from "lucide-react";

export default function AdminCustomersPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers Management</h1>
                    <p className="text-gray-500 mt-1 text-sm">View user details, order history, and account statuses.</p>
                </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary" />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors bg-white flex-shrink-0">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 w-full md:w-auto justify-end">
                        <span>Total Customers: <span className="font-bold text-gray-900">12,408</span></span>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-4 md:px-6 md:py-4">Customer</th>
                                <th className="p-4 md:px-6 md:py-4">Status</th>
                                <th className="p-4 md:px-6 md:py-4 text-center">Total Orders</th>
                                <th className="p-4 md:px-6 md:py-4">Total Spent</th>
                                <th className="p-4 md:px-6 md:py-4">Last Active</th>
                                <th className="p-4 md:px-6 md:py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                                <tr key={item} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 md:px-6 md:py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-virsa-light/70 flex-shrink-0 flex items-center justify-center font-bold text-virsa-primary text-sm border border-virsa-primary/20">
                                                JD
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-900 block">Jane Doe {item}</span>
                                                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                                                    <Mail className="w-3 h-3" /> jane{item}@example.com
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        {item === 4 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wide">Inactive</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">Active</span>
                                        )}
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 text-center">
                                        <span className="font-bold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">{item * 3}</span>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        <span className="font-black text-gray-900">${(item * 249.50).toFixed(2)}</span>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 text-xs text-gray-600">
                                        {item <= 2 ? 'Today' : `${item} days ago`}
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
                    <span className="text-xs text-gray-500 font-medium">Page 1 of 124</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-400 bg-white disabled:opacity-50" disabled>PREV</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">NEXT</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
