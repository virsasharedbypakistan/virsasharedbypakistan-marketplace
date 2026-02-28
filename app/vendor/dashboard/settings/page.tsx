"use client";

import { useState } from "react";
import { Store, MapPin, Lock, Bell, CreditCard, CheckCircle2, Eye, EyeOff } from "lucide-react";

type Tab = "Store Profile" | "Payout Details" | "Notifications" | "Security";

export default function VendorSettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("Store Profile");

    // Store Profile state
    const [profile, setProfile] = useState({ name: "Khyber Crafts PK", email: "contact@khybercrafts.pk", description: "We bring authentic Pakistani handicrafts and textiles from Khyber Pakhtunkhwa directly to you. Every piece is handcrafted by local artisans.", url: "khyber-crafts" });
    const [profileSaved, setProfileSaved] = useState(false);

    // Payout state
    const [payout, setPayout] = useState({ bankName: "HBL Pakistan", accountTitle: "Khyber Crafts PK", accountNumber: "0012345678901234", iban: "PK36SCBL0000001123456702" });
    const [payoutSaved, setPayoutSaved] = useState(false);

    // Notifications state
    const [notifs, setNotifs] = useState({ newOrder: true, orderStatus: true, lowStock: true, reviews: false, promotions: false });

    // Security state
    const [passwords, setPasswords] = useState({ current: "", newPw: "", confirm: "" });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSaved, setPasswordSaved] = useState(false);

    const handleSaveProfile = () => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000); };
    const handleSavePayout = () => { setPayoutSaved(true); setTimeout(() => setPayoutSaved(false), 3000); };
    const handleSavePassword = () => {
        if (!passwords.current || !passwords.newPw || !passwords.confirm) return setPasswordError("Please fill all fields.");
        if (passwords.newPw !== passwords.confirm) return setPasswordError("Passwords do not match.");
        if (passwords.newPw.length < 8) return setPasswordError("Password must be at least 8 characters.");
        setPasswordError(""); setPasswordSaved(true); setPasswords({ current: "", newPw: "", confirm: "" });
        setTimeout(() => setPasswordSaved(false), 3000);
    };

    const navItems: { icon: React.ElementType; label: Tab }[] = [
        { icon: Store, label: "Store Profile" },
        { icon: CreditCard, label: "Payout Details" },
        { icon: Bell, label: "Notifications" },
        { icon: Lock, label: "Security" },
    ];

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Store Settings</h1>
                <p className="text-gray-500 mt-1 text-sm">Manage your store profile, payouts, and preferences.</p>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100 min-h-[560px]">
                    {/* Navigation */}
                    <div className="w-full md:w-56 bg-gray-50/50 p-4 shrink-0">
                        <nav className="space-y-1">
                            {navItems.map(({ icon: Icon, label }) => (
                                <button key={label} onClick={() => setActiveTab(label)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === label ? "text-virsa-primary bg-virsa-primary/10" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}>
                                    <Icon className="w-5 h-5" /> {label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 md:p-8">
                        {/* Store Profile */}
                        {activeTab === "Store Profile" && (
                            <div className="max-w-2xl space-y-5">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Store Profile</h2>
                                {/* Logo */}
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-3">Store Logo</label>
                                    <div className="flex items-center gap-5">
                                        <div className="w-20 h-20 bg-virsa-light/50 border border-gray-200 rounded-2xl flex items-center justify-center text-virsa-primary font-black text-2xl">
                                            {profile.name[0]}
                                        </div>
                                        <div>
                                            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors mb-1 block">Change Logo</button>
                                            <p className="text-xs text-gray-500">JPEG, PNG or GIF · max 2MB</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 block mb-1.5">Store Name</label>
                                        <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 block mb-1.5">Store Email</label>
                                        <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Store Description</label>
                                    <textarea rows={4} value={profile.description} onChange={e => setProfile(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all resize-none" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Store URL</label>
                                    <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-virsa-primary focus-within:ring-2 focus-within:ring-virsa-primary/20 transition-all">
                                        <div className="bg-gray-50 px-4 py-2.5 text-gray-500 text-sm flex items-center border-r border-gray-200 whitespace-nowrap">virsa.pk/store/</div>
                                        <input type="text" value={profile.url} onChange={e => setProfile(p => ({ ...p, url: e.target.value }))} className="w-full px-4 py-2.5 border-none focus:outline-none text-sm bg-white" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    {profileSaved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Saved!</span>}
                                    <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-virsa-primary text-white rounded-xl text-sm font-bold hover:bg-virsa-primary/90 transition-colors shadow-sm">Save Changes</button>
                                </div>
                            </div>
                        )}

                        {/* Payout Details */}
                        {activeTab === "Payout Details" && (
                            <div className="max-w-2xl space-y-5">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Payout / Bank Details</h2>
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm font-medium text-amber-700">
                                    ⚠️ Changes to payout details require admin review and may take 24-48 hours to process.
                                </div>
                                {[
                                    { label: "Bank Name", key: "bankName" as const, placeholder: "e.g. HBL Pakistan" },
                                    { label: "Account Title", key: "accountTitle" as const, placeholder: "e.g. Your Company Name" },
                                    { label: "Account Number", key: "accountNumber" as const, placeholder: "Enter account number" },
                                    { label: "IBAN", key: "iban" as const, placeholder: "PK00XXXX0000000000000000" },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="text-sm font-bold text-gray-700 block mb-1.5">{f.label}</label>
                                        <input type="text" value={payout[f.key]} onChange={e => setPayout(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all" />
                                    </div>
                                ))}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    {payoutSaved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Submitted for review!</span>}
                                    <button onClick={handleSavePayout} className="px-6 py-2.5 bg-virsa-primary text-white rounded-xl text-sm font-bold hover:bg-virsa-primary/90 transition-colors shadow-sm">Save & Submit</button>
                                </div>
                            </div>
                        )}

                        {/* Notifications */}
                        {activeTab === "Notifications" && (
                            <div className="max-w-2xl">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                                <div className="space-y-4">
                                    {[
                                        { key: "newOrder" as const, label: "New Orders", desc: "Get notified when a customer places a new order in your store." },
                                        { key: "orderStatus" as const, label: "Order Status Updates", desc: "Receive updates when order statuses change." },
                                        { key: "lowStock" as const, label: "Low Stock Alerts", desc: "Get alerted when a product stock drops below 5 units." },
                                        { key: "reviews" as const, label: "New Reviews", desc: "Be notified when customers leave reviews on your products." },
                                        { key: "promotions" as const, label: "Platform Promotions", desc: "Receive updates about seasonal campaigns and promotions." },
                                    ].map(n => (
                                        <div key={n.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{n.label}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4 ${notifs[n.key] ? "bg-virsa-primary" : "bg-gray-200"}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${notifs[n.key] ? "translate-x-6" : "translate-x-1"}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Security */}
                        {activeTab === "Security" && (
                            <div className="max-w-md space-y-5">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Update Password</h2>
                                {[
                                    { label: "Current Password", key: "current" as const, show: showPasswords.current, toggle: () => setShowPasswords(p => ({ ...p, current: !p.current })) },
                                    { label: "New Password", key: "newPw" as const, show: showPasswords.new, toggle: () => setShowPasswords(p => ({ ...p, new: !p.new })) },
                                    { label: "Confirm New Password", key: "confirm" as const, show: showPasswords.confirm, toggle: () => setShowPasswords(p => ({ ...p, confirm: !p.confirm })) },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="text-sm font-bold text-gray-700 block mb-1.5">{f.label}</label>
                                        <div className="relative">
                                            <input
                                                type={f.show ? "text" : "password"}
                                                value={passwords[f.key]}
                                                onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                                                className="w-full pr-10 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                            />
                                            <button type="button" onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                                {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {passwordError && <p className="text-sm font-medium text-red-500">{passwordError}</p>}
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                    {passwordSaved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Password updated!</span>}
                                    <button onClick={handleSavePassword} className="px-6 py-2.5 bg-virsa-primary text-white rounded-xl text-sm font-bold hover:bg-virsa-primary/90 transition-colors shadow-sm">Save Password</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
