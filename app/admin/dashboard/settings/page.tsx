"use client";

import { useState, useEffect } from "react";
import { Shield, Settings, Mail, Bell, ShieldCheck, Database, Save, RotateCcw, CheckCircle2 } from "lucide-react";

type PlatformSettings = {
    global_commission_rate: string;
    maintenance_mode: string;
    shipping_mode: string;
    flat_shipping_rate: string;
    min_withdrawal_amount: string;
    max_withdrawal_amount: string;
    order_auto_complete_days: string;
};

const defaultSettings: PlatformSettings = {
    global_commission_rate: "10",
    maintenance_mode: "false",
    shipping_mode: "vendor",
    flat_shipping_rate: "150",
    min_withdrawal_amount: "500",
    max_withdrawal_amount: "100000",
    order_auto_complete_days: "7",
};

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
    const [original, setOriginal] = useState<PlatformSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const [activeTab, setActiveTab] = useState("general");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            if (res.ok) {
                const data = await res.json();
                const s = { ...defaultSettings, ...data.data };
                setSettings(s);
                setOriginal(s);
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                setOriginal(settings);
                showToast("Settings saved successfully!", true);
            } else {
                showToast("Failed to save settings.", false);
            }
        } catch (err) {
            showToast("Network error. Please try again.", false);
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        setSettings(original);
    };

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3500);
    };

    const isDirty = JSON.stringify(settings) !== JSON.stringify(original);

    const set = (key: keyof PlatformSettings, value: string) =>
        setSettings((prev) => ({ ...prev, [key]: value }));

    const tabs = [
        { id: "general", label: "General", icon: Settings },
        { id: "commission", label: "Commission", icon: ShieldCheck },
        { id: "shipping", label: "Shipping", icon: Database },
        { id: "withdrawals", label: "Withdrawals", icon: Mail },
        { id: "notifications", label: "Notifications", icon: Bell },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-virsa-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage global platform configurations and admin preferences.</p>
                </div>
                {isDirty && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full animate-pulse">
                        Unsaved changes
                    </span>
                )}
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100 min-h-[600px]">

                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-gray-50/50 p-4 shrink-0">
                        <nav className="space-y-1 text-sm">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? "font-bold text-virsa-primary bg-virsa-primary/10"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col">
                        <div className="max-w-2xl flex-1">

                            {/* General Tab */}
                            {activeTab === "general" && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-gray-400" /> General Configuration
                                    </h2>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                                        <input
                                            type="text"
                                            defaultValue="Virsa Marketplace"
                                            disabled
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Contact your developer to change the platform name.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                                            <select disabled className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed">
                                                <option>PKR (Rs)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Auto-Complete Orders (days)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={settings.order_auto_complete_days}
                                                onChange={(e) => set("order_auto_complete_days", e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Days after shipping to auto-mark as completed.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <h3 className="text-sm font-bold text-gray-900">Platform Features</h3>

                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">Maintenance Mode</p>
                                                <p className="text-xs text-gray-500">Put the site offline for visitors</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={settings.maintenance_mode === "true"}
                                                    onChange={(e) => set("maintenance_mode", String(e.target.checked))}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Commission Tab */}
                            {activeTab === "commission" && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-gray-400" /> Commission Settings
                                    </h2>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Global Commission Rate (%)
                                        </label>
                                        <div className="relative w-40">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={settings.global_commission_rate}
                                                onChange={(e) => set("global_commission_rate", e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary text-right pr-8"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Applied to vendors without a custom commission rate. Current: <strong>{settings.global_commission_rate}%</strong>
                                        </p>
                                    </div>

                                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
                                        <strong>Note:</strong> Individual vendor commission rates can be set from the vendor detail page and will override this global rate.
                                    </div>
                                </div>
                            )}

                            {/* Shipping Tab */}
                            {activeTab === "shipping" && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Database className="w-5 h-5 text-gray-400" /> Shipping Settings
                                    </h2>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Mode</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { value: "vendor", label: "Vendor Managed", desc: "Each vendor handles their own shipping" },
                                                { value: "admin", label: "Platform Managed", desc: "Platform handles all shipping centrally" },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => set("shipping_mode", opt.value)}
                                                    className={`p-4 border-2 rounded-xl text-left transition-colors ${
                                                        settings.shipping_mode === opt.value
                                                            ? "border-virsa-primary bg-virsa-primary/5"
                                                            : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                                >
                                                    <p className={`font-bold text-sm ${settings.shipping_mode === opt.value ? "text-virsa-primary" : "text-gray-900"}`}>
                                                        {opt.label}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Flat Shipping Rate (PKR)
                                        </label>
                                        <div className="relative w-40">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rs</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={settings.flat_shipping_rate}
                                                onChange={(e) => set("flat_shipping_rate", e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Default flat rate charged per order when platform manages shipping.</p>
                                    </div>
                                </div>
                            )}

                            {/* Withdrawals Tab */}
                            {activeTab === "withdrawals" && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-gray-400" /> Withdrawal Limits
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Minimum Withdrawal (PKR)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rs</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={settings.min_withdrawal_amount}
                                                    onChange={(e) => set("min_withdrawal_amount", e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Maximum Withdrawal (PKR)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rs</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={settings.max_withdrawal_amount}
                                                    onChange={(e) => set("max_withdrawal_amount", e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                                        Vendors can request withdrawals only within these limits. Requests outside the range will be automatically rejected.
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === "notifications" && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-gray-400" /> Email Notification Preferences
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">Order Confirmation Emails</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Send email notifications to customers when orders are placed</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    defaultChecked={true}
                                                    disabled
                                                />
                                                <div className="w-11 h-6 bg-emerald-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all opacity-60 cursor-not-allowed"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">Vendor Approval Emails</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Notify vendors when their application is approved or rejected</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    defaultChecked={true}
                                                    disabled
                                                />
                                                <div className="w-11 h-6 bg-emerald-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all opacity-60 cursor-not-allowed"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">Withdrawal Notification Emails</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Alert admins when vendors request withdrawals</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    defaultChecked={true}
                                                    disabled
                                                />
                                                <div className="w-11 h-6 bg-emerald-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all opacity-60 cursor-not-allowed"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">Low Stock Alerts</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Notify vendors when product inventory is running low</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    defaultChecked={true}
                                                    disabled
                                                />
                                                <div className="w-11 h-6 bg-emerald-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all opacity-60 cursor-not-allowed"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">Weekly Sales Reports</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Send weekly performance summaries to vendors</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    defaultChecked={false}
                                                    disabled
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all opacity-60 cursor-not-allowed"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                                        <strong>Note:</strong> All email notifications are currently enabled and sent automatically via Resend. Advanced email template customization and per-notification toggles will be available in a future update.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Save / Discard bar */}
                        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleDiscard}
                                disabled={!isDirty || saving}
                                className="flex items-center gap-2 px-6 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <RotateCcw className="w-4 h-4" /> Discard
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={!isDirty || saving}
                                className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Shield className="w-4 h-4" />
                                )}
                                {saving ? "Saving..." : "Save Configuration"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 pl-4 pr-5 py-3.5 rounded-2xl shadow-2xl ${toast.ok ? "bg-gray-900 text-white" : "bg-red-600 text-white"}`}>
                    {toast.ok
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        : <Save className="w-5 h-5 text-white flex-shrink-0" />
                    }
                    <p className="text-sm font-bold">{toast.msg}</p>
                </div>
            )}
        </div>
    );
}
