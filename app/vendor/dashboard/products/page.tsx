import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2 } from "lucide-react";

export default function VendorProductsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products Management</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage your inventory, pricing, and product details.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-virsa-primary text-white font-bold rounded-xl hover:bg-virsa-primary/90 transition-all shadow-md">
                    <Plus className="w-4 h-4" /> Add New Product
                </button>
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search products..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary" />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors bg-white">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 w-full md:w-auto justify-end">
                        <span>Showing 1-10 of 145 items</span>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-4 md:px-6 md:py-4">Product</th>
                                <th className="p-4 md:px-6 md:py-4">Status</th>
                                <th className="p-4 md:px-6 md:py-4">Inventory</th>
                                <th className="p-4 md:px-6 md:py-4">Price</th>
                                <th className="p-4 md:px-6 md:py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <tr key={item} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-4 md:px-6 md:py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 border border-gray-200"></div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-virsa-primary transition-colors cursor-pointer">Premium Wireless Headphones {item}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">Electronics &gt; Audio</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        {item === 3 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">Draft</span>
                                        ) : item === 5 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">Hidden</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Active</span>
                                        )}
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        <span className="font-medium text-gray-900">{item === 2 ? "Out of Stock" : `${item * 14} in stock`}</span>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        <span className="font-bold text-gray-900">Rs {199.99 * item}</span>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-1.5 text-gray-400 hover:text-virsa-primary hover:bg-virsa-light/30 rounded-md transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md transition-colors">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Dummy */}
                <div className="p-4 md:p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>Previous</button>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded-md bg-virsa-primary text-white font-bold text-sm">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-md bg-transparent text-gray-600 hover:bg-gray-200 text-sm font-medium transition-colors">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-md bg-transparent text-gray-600 hover:bg-gray-200 text-sm font-medium transition-colors">3</button>
                        <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">...</span>
                        <button className="w-8 h-8 flex items-center justify-center rounded-md bg-transparent text-gray-600 hover:bg-gray-200 text-sm font-medium transition-colors">15</button>
                    </div>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors">Next</button>
                </div>
            </div>
        </div>
    );
}
