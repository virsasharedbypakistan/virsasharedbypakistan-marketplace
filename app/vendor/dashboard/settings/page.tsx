import { Store, MapPin, Lock, Bell, CreditCard } from "lucide-react";

export default function VendorSettingsPage() {
    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Store Settings</h1>
                <p className="text-gray-500 mt-1 text-sm">Manage your store profile, payouts, and preferences.</p>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100 min-h-[600px]">

                    {/* Settings Navigation */}
                    <div className="w-full md:w-64 bg-gray-50/50 p-4 shrink-0">
                        <nav className="space-y-1">
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-virsa-primary bg-virsa-primary/10">
                                <Store className="w-5 h-5" /> Store Profile
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                <MapPin className="w-5 h-5" /> Shipping
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                <CreditCard className="w-5 h-5" /> Payout Details
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                <Bell className="w-5 h-5" /> Notifications
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                <Lock className="w-5 h-5" /> Security
                            </button>
                        </nav>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1 p-6 md:p-8">
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Store Profile</h2>

                            <form className="space-y-6">
                                {/* Logo upload mock */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Store Logo</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-virsa-light/50 border border-gray-200 rounded-2xl flex items-center justify-center text-virsa-primary font-bold text-xl">
                                            S
                                        </div>
                                        <div>
                                            <button type="button" className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors mb-2 block">
                                                Change Logo
                                            </button>
                                            <p className="text-xs text-gray-500">Must be JPEG, PNG, or GIF and cannot exceed 2MB.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                                        <input type="text" defaultValue="Tech Haven PK" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Email</label>
                                        <input type="email" defaultValue="contact@techhaven.pk" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
                                    <textarea rows={4} defaultValue="We sell the best electronics and gadgets in Pakistan. Authenticity guaranteed on all major brands." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary resize-none"></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Store URL</label>
                                    <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-virsa-primary focus-within:ring-2 focus-within:ring-virsa-primary/20 transition-all">
                                        <div className="bg-gray-50 px-4 py-2 text-gray-500 text-sm flex items-center border-r border-gray-200">
                                            virsa.pk/store/
                                        </div>
                                        <input type="text" defaultValue="tech-haven" className="w-full px-4 py-2 border-none focus:outline-none text-sm" />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                    <button type="button" className="px-6 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="button" className="px-6 py-2 bg-virsa-primary text-white rounded-xl text-sm font-bold hover:bg-virsa-dark transition-colors shadow-sm">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
