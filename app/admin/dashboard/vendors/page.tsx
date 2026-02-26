import { Search, Filter, MoreHorizontal, ShieldCheck, Download, Store, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminVendorsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendors Management</h1>
                    <p className="text-gray-500 mt-1 text-sm">Review, approve, and manage marketplace sellers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Store className="w-5 h-5" /></div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">+12%</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Vendors</h3>
                            <p className="text-2xl font-black text-gray-900 leading-none">842</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Active (Approved)</h3>
                            <p className="text-2xl font-black text-gray-900 leading-none">795</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-[0_4px_20px_rgba(245,158,11,0.08)] border-amber-100 flex flex-col justify-between h-28 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10"></div>
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><AlertCircle className="w-5 h-5" /></div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">Pending Approval</h3>
                            <p className="text-2xl font-black text-amber-600 leading-none">38</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Avg. Revenue / Store</h3>
                            <p className="text-2xl font-black text-gray-900 leading-none">$12.4k</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search by store name, email, or ID..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary" />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors bg-white">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 w-full md:w-auto justify-end">
                        <select className="bg-transparent border-none text-gray-900 font-bold outline-none cursor-pointer">
                            <option>Sort by: Newest</option>
                            <option>Sort by: Revenue</option>
                            <option>Sort by: Status</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-4 md:px-6 md:py-4">Store Details</th>
                                <th className="p-4 md:px-6 md:py-4">Owner Info</th>
                                <th className="p-4 md:px-6 md:py-4">Status</th>
                                <th className="p-4 md:px-6 md:py-4">Products</th>
                                <th className="p-4 md:px-6 md:py-4">Total Revenue</th>
                                <th className="p-4 md:px-6 md:py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <tr key={item} className={`hover:bg-gray-50/50 transition-colors ${item === 2 ? 'bg-amber-50/20' : ''}`}>
                                    <td className="p-4 md:px-6 md:py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0 border border-gray-200 flex items-center justify-center">
                                                <Store className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <Link href={`/vendor/${item}`} className="font-bold text-gray-900 hover:text-virsa-primary transition-colors cursor-pointer block">
                                                    {item === 1 ? "Tech Haven Official" : item === 2 ? "Fresh Organics Depot" : `Store Name ${item}`}
                                                </Link>
                                                <p className="text-[11px] text-gray-500 mt-0.5">Joined: Oct {10 + item}, 2023</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        <span className="font-medium text-gray-900 block border-b border-transparent leading-snug">Alex Doe {item}</span>
                                        <span className="text-[11px] text-gray-500">alex.d{item}@example.com</span>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        {item === 2 ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wide">Pending</span>
                                        ) : item === 6 ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase tracking-wide">Suspended</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">Active</span>
                                        )}
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        <span className="font-bold text-gray-700">{item === 2 ? 0 : item * 24} items</span>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        <span className="font-black text-gray-900">${item === 2 ? "0.00" : `${(item * 14.2).toFixed(1)}k`}</span>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 text-right">
                                        {item === 2 ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">Approve</button>
                                                <button className="px-3 py-1.5 bg-white border border-gray-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors">Reject</button>
                                            </div>
                                        ) : (
                                            <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md transition-colors">
                                                <MoreHorizontal className="w-5 h-5" />
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
