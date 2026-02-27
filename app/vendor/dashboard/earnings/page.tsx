import { Download, TrendingUp, TrendingDown, DollarSign, Calendar, Filter } from "lucide-react";

export default function VendorEarningsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Earnings Overview</h1>
                    <p className="text-gray-500 mt-1 text-sm">Monitor your store&apos;s revenue and detailed transaction history.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto shadow-sm">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <select className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                        <option>Last 30 Days</option>
                        <option>This Month</option>
                        <option>Last Month</option>
                        <option>This Year</option>
                    </select>
                </div>
            </div>

            {/* Income Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-virsa-primary/10 text-virsa-primary flex items-center justify-center">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" /> +14.5%
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">COD Collected (Pending Settlement)</p>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Rs 45,250.00</h3>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Settled This Month</p>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Rs 32,800.00</h3>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-virsa-primary to-virsa-dark rounded-[24px] p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-white/90 bg-white/20 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" /> +8.2%
                        </span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-white/80 mb-1">Total Lifetime Earnings</p>
                        <h3 className="text-3xl font-black tracking-tight">Rs 845,900.00</h3>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transaction History */}
                <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">COD Settlement History</h2>
                        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                    <th className="px-6 py-4">Order / Details</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {[
                                    { id: "ORD-4829", desc: "COD Order Sale", type: "credit", status: "Settled", date: "Today", amount: "+ Rs 4,500.00" },
                                    { id: "ORD-4828", desc: "COD Order Sale", type: "credit", status: "Pending", date: "Today", amount: "+ Rs 2,800.00" },
                                    { id: "ORD-4825", desc: "COD Order Sale", type: "credit", status: "Settled", date: "Oct 24", amount: "+ Rs 1,200.00" },
                                    { id: "ORD-4821", desc: "COD Order Sale", type: "credit", status: "Settled", date: "Oct 23", amount: "+ Rs 3,750.00" },
                                    { id: "REF-992", desc: "Order Refund", type: "debit", status: "Processed", date: "Oct 23", amount: "- Rs 850.00" },
                                ].map((trx, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${trx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {trx.type === 'credit' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{trx.desc}</p>
                                                    <p className="text-xs text-gray-500">{trx.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${trx.status === 'Settled' || trx.status === 'Processed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    'bg-amber-50 text-amber-600 border border-amber-100'
                                                }`}>
                                                {trx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{trx.date}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold ${trx.type === 'credit' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                                {trx.amount}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Earnings Breakdown */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Earnings Breakdown</h2>
                    <div className="space-y-6 flex-1">
                        {[
                            { label: "Product Sales", amount: "Rs 92,400.00", percentage: "85%", color: "bg-virsa-primary" },
                            { label: "Shipping Fees", amount: "Rs 12,500.00", percentage: "12%", color: "bg-indigo-500" },
                            { label: "Other", amount: "Rs 3,250.00", percentage: "3%", color: "bg-orange-500" },
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{item.label}</p>
                                        <p className="text-lg font-bold text-gray-900">{item.amount}</p>
                                    </div>
                                    <span className="text-xs font-bold text-gray-500">{item.percentage}</span>
                                </div>
                                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color} rounded-full`} style={{ width: item.percentage }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-center text-sm mb-2 text-gray-600">
                            <span>Platform Commission (5%)</span>
                            <span>- Rs 5,407.50</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center mt-4">
                            <span className="font-bold text-gray-700">Net Earnings</span>
                            <span className="font-black text-virsa-primary text-xl">Rs 102,742.50</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
