import { Search, Check, X, MoreHorizontal, Wallet, AlertCircle } from "lucide-react";

export default function AdminWithdrawalsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Withdrawal Requests</h1>
                    <p className="text-gray-500 mt-1 text-sm">Review, approve, or reject vendor payout requests.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-xl bg-virsa-primary/10 text-virsa-primary flex items-center justify-center">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Payouts (Month)</p>
                    <h3 className="text-2xl font-black text-gray-900">Rs 1,245,000.00</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200 bg-amber-50/30">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Pending Requests</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-amber-700">12</h3>
                        <span className="text-sm font-bold text-amber-600">(Rs 345,200.00)</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search by Vendor ID or Name..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary" />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors w-full sm:w-auto text-center">
                            Process Selected
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-4 md:px-6 md:py-4 w-12"><input type="checkbox" className="rounded text-virsa-primary focus:ring-virsa-primary border-gray-300" /></th>
                                <th className="p-4 md:px-6 md:py-4">Vendor details</th>
                                <th className="p-4 md:px-6 md:py-4">Amount</th>
                                <th className="p-4 md:px-6 md:py-4">Bank Details</th>
                                <th className="p-4 md:px-6 md:py-4">Requested On</th>
                                <th className="p-4 md:px-6 md:py-4">Status</th>
                                <th className="p-4 md:px-6 md:py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {[
                                { vendor: "Tech Haven PK", vId: "VND-819", amount: "Rs 45,250.00", bank: "HBL - 0428***1192", date: "Today, 10:45 AM", status: "Pending" },
                                { vendor: "Fashion Hub", vId: "VND-412", amount: "Rs 12,800.00", bank: "Meezan - 0110***4421", date: "Yesterday, 3:20 PM", status: "Pending" },
                                { vendor: "Electronics Pro", vId: "VND-992", amount: "Rs 115,000.00", bank: "Allied - 0881***9921", date: "Oct 24, 2023", status: "Approved" },
                                { vendor: "Beauty Store", vId: "VND-104", amount: "Rs 4,500.00", bank: "UBL - 0122***5581", date: "Oct 23, 2023", status: "Rejected" },
                                { vendor: "Home Essentials", vId: "VND-771", amount: "Rs 32,100.00", bank: "HBL - 0428***8812", date: "Oct 20, 2023", status: "Approved" },
                            ].map((req, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 md:px-6 md:py-4"><input type="checkbox" className="rounded text-virsa-primary focus:ring-virsa-primary border-gray-300" /></td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        <div className="font-bold text-gray-900">{req.vendor}</div>
                                        <div className="text-xs text-gray-500">{req.vId}</div>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 font-black text-gray-900">
                                        {req.amount}
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 text-gray-600">
                                        {req.bank}
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 text-gray-500">
                                        {req.date}
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-red-50 text-red-600 border border-red-100'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="p-4 md:px-6 md:py-4 text-right">
                                        {req.status === 'Pending' ? (
                                            <div className="flex justify-end gap-2">
                                                <button className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors" title="Approve">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors" title="Reject">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
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
