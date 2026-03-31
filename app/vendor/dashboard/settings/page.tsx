"use client";

import { useState, useEffect } from "react";
import { Store, MapPin, Lock, Bell, CreditCard, CheckCircle2, Eye, EyeOff } from "lucide-react";

type Tab = "Store Profile" | "Payout Details" | "Notifications" | "Security";

export default function VendorSettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("Store Profile");
    const [loading, setLoading] = useState(true);

    // Store Profile state
    const [profile, setProfile] = useState({ name: "", email: "", description: "", url: "" });
    const [profileSaved, setProfileSaved] = useState(false);
    const [vendorStatus, setVendorStatus] = useState<string>("");

    // Payout state
    const [payout, setPayout] = useState({ bankName: "", accountTitle: "", accountNumber: "", iban: "" });
    const [payoutSaved, setPayoutSaved] = useState(false);

    // Notifications state
    const [notifs, setNotifs] = useState({ newOrder: true, orderStatus: true, lowStock: true, reviews: false, promotions: false });
    const [notifsSaved, setNotifsSaved] = useState(false);

    // Security state
    const [passwords, setPasswords] = useState({ current: "", newPw: "", confirm: "" });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSaved, setPasswordSaved] = useState(false);

    // Fetch vendor profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("/api/vendor/profile");
                if (response.ok) {
                    const result = await response.json();
                    const vendor = result.data;
                    setProfile({
                        name: vendor.store_name || "",
                        email: vendor.store_email || "",
                        description: vendor.store_description || "",
                        url: vendor.slug || ""
                    });
                    setVendorStatus(vendor.status || "");
                    setPayout({
                        bankName: vendor.bank_name || "",
                        accountTitle: vendor.account_title || "",
                        accountNumber: vendor.account_number || "",
                        iban: vendor.iban || ""
                    });
                    setNotifs({
                        newOrder: vendor.notification_new_order ?? true,
                        orderStatus: vendor.notification_order_status ?? true,
                        lowStock: vendor.notification_low_stock ?? true,
                        reviews: vendor.notification_reviews ?? false,
                        promotions: vendor.notification_promotions ?? false,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSaveProfile = async () => {
        try {
            const response = await fetch("/api/vendor/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    store_name: profile.name,
                    store_email: profile.email,
                    store_description: profile.description,
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                setProfileSaved(true);
                setTimeout(() => setProfileSaved(false), 3000);
            } else {
                // Show error if store name change was blocked
                alert(result.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Failed to save profile:", error);
            alert("Failed to update profile. Please try again.");
        }
    };

    const handleSavePayout = async () => {
        try {
            const response = await fetch("/api/vendor/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bank_name: payout.bankName,
                    account_title: payout.accountTitle,
                    account_number: payout.accountNumber,
                    iban: payout.iban,
                })
            });
            if (response.ok) {
                setPayoutSaved(true);
                setTimeout(() => setPayoutSaved(false), 3000);
            }
        } catch (error) {
            console.error("Failed to save payout:", error);
        }
    };

    const handleSavePassword = async () => {
        if (!passwords.current || !passwords.newPw || !passwords.confirm) {
            setPasswordError("Please fill all fields.");
            return;
        }
        if (passwords.newPw !== passwords.confirm) {
            setPasswordError("Passwords do not match.");
            return;
        }
        if (passwords.newPw.length < 8) {
            setPasswordError("Password must be at least 8 characters.");
            return;
        }

        try {
            const response = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.newPw,
                })
            });

            const result = await response.json();

            if (response.ok) {
                setPasswordError("");
                setPasswordSaved(true);
                setPasswords({ current: "", newPw: "", confirm: "" });
                setTimeout(() => setPasswordSaved(false), 3000);
            } else {
                setPasswordError(result.error || "Failed to update password");
            }
        } catch (error) {
            console.error("Failed to update password:", error);
            setPasswordError("Failed to update password. Please try again.");
        }
    };

    const handleSaveNotifications = async () => {
        try {
            const response = await fetch("/api/vendor/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    notification_new_order: notifs.newOrder,
                    notification_order_status: notifs.orderStatus,
                    notification_low_stock: notifs.lowStock,
                    notification_reviews: notifs.reviews,
                    notification_promotions: notifs.promotions,
                })
            });
            if (response.ok) {
                setNotifsSaved(true);
                setTimeout(() => setNotifsSaved(false), 3000);
            }
        } catch (error) {
            console.error("Failed to save notifications:", error);
        }
    };

    const navItems: { icon: React.ElementType; label: Tab }[] = [
        { icon: Store, label: "Store Profile" },
        { icon: CreditCard, label: "Payout Details" },
        { icon: Bell, label: "Notifications" },
        { icon: Lock, label: "Security" },
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
                                        <input 
                                            type="text" 
                                            value={profile.name} 
                                            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} 
                                            disabled={vendorStatus === 'active'}
                                            className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all ${
                                                vendorStatus === 'active' 
                                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                                                    : 'bg-gray-50 focus:bg-white focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary'
                                            }`}
                                        />
                                        {vendorStatus === 'active' && (
                                            <p className="text-xs text-amber-600 mt-1">Store name cannot be changed after activation</p>
                                        )}
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
                                        <div className="bg-gray-50 px-4 py-2.5 text-gray-500 text-sm flex items-center border-r border-gray-200 whitespace-nowrap">virsasharedbypakistan.com/store/</div>
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
                                <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                                    {notifsSaved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Saved!</span>}
                                    <button onClick={handleSaveNotifications} className="px-6 py-2.5 bg-virsa-primary text-white rounded-xl text-sm font-bold hover:bg-virsa-primary/90 transition-colors shadow-sm">Save Preferences</button>
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
