import { Wallet, History, Search } from "lucide-react";

export default function VendorWithdrawalsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Withdrawals</h1>
                    <p className="text-gray-500 mt-1 text-sm">Request payouts and view your withdrawal history.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Request Withdrawal Form */}
                <div className="lg:col-span-1 border border-gray-100 shadow-sm rounded-[24px] bg-white p-6 self-start">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Available to Withdraw</h2>
                    <p className="text-4xl font-black tracking-tight text-gray-900 mb-6">Rs 45,250.00</p>

                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rs</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/50 focus:border-virsa-primary font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payout Method</label>
                            <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/50 focus:border-virsa-primary bg-white appearance-none cursor-pointer text-sm">
                                <option>HBL Bank ending in 4289</option>
                                <option>Meezan Bank ending in 1102</option>
                                <option>Add New Bank Account</option>
                            </select>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-xl mt-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Withdrawal Fee</span>
                                <span className="font-bold text-gray-900">Rs 0.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Processing Time</span>
                                <span className="font-bold text-gray-900">2-3 Business Days</span>
                            </div>
                        </div>

                        <button type="button" className="w-full py-3 bg-virsa-primary text-white rounded-xl font-bold hover:bg-virsa-dark transition-colors mt-6">
                            Request Withdrawal
                        </button>
                    </form>
                </div>

                {/* Withdrawal History */}
                <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-bold text-gray-900">History</h2>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by ID..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-virsa-primary"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Account</th>
                                    <th className="px-6 py-4 text-right">Date Request</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {[
                                    { status: "Completed", amount: "Rs 15,000.00", account: "HBL *4289", date: "Oct 24, 2023" },
                                    { status: "Completed", amount: "Rs 28,400.00", account: "HBL *4289", date: "Oct 12, 2023" },
                                    { status: "Processing", amount: "Rs 8,250.00", account: "Meezan *1102", date: "Today" },
                                    { status: "Failed", amount: "Rs 4,000.00", account: "HBL *4289", date: "Sep 28, 2023" },
                                    { status: "Completed", amount: "Rs 42,000.00", account: "HBL *4289", date: "Sep 15, 2023" },
                                ].map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    item.status === 'Processing' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                        item.status === 'Failed' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                            'bg-gray-100 text-gray-600 border border-gray-200'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {item.amount}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {item.account}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-500 text-sm">
                                            {item.date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Dummy */}
                    <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/30">
                        <button className="text-sm font-bold text-virsa-primary hover:text-virsa-dark transition-colors">Load More History</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
