import { Shield, Settings, Mail, Bell, ShieldCheck, Database } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
                <p className="text-gray-500 mt-1 text-sm">Manage global platform configurations and admin preferences.</p>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100 min-h-[600px]">

                    {/* Settings Navigation */}
                    <div className="w-full md:w-64 bg-gray-50/50 p-4 shrink-0">
                        <nav className="space-y-1 text-sm">
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-virsa-primary bg-virsa-primary/10">
                                <Settings className="w-5 h-5" /> General
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                <ShieldCheck className="w-5 h-5" /> Roles & Permissions
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                <Mail className="w-5 h-5" /> Email Templates
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                <Bell className="w-5 h-5" /> App Notifications
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                <Database className="w-5 h-5" /> Backups
                            </button>
                        </nav>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1 p-6 md:p-8">
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-400" /> General Configuration
                            </h2>

                            <form className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                                    <input type="text" defaultValue="Virsa Marketplace" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                                        <input type="email" defaultValue="support@virsa.pk" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                                        <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary appearance-none cursor-pointer bg-white">
                                            <option>PKR (Rs)</option>
                                            <option>USD ($)</option>
                                            <option>EUR (€)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <h3 className="text-sm font-bold text-gray-900">Platform Features</h3>

                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">Vendor Registration</p>
                                            <p className="text-xs text-gray-500">Allow new vendors to sign up automatically</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-virsa-primary"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">Maintenance Mode</p>
                                            <p className="text-xs text-gray-500">Put the site offline for visitors</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" value="" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                                    <div className="relative w-32">
                                        <input type="number" defaultValue="5.0" step="0.1" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary text-right pr-8" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                    <button type="button" className="px-6 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                        Discard
                                    </button>
                                    <button type="button" className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Save Configuration
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
