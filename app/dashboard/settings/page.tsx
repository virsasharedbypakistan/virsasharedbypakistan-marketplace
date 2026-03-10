"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Lock, Camera, Plus, CheckCircle2, Trash2, X, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Address = {
    id: string;
    label: string;
    street_address: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    is_default: boolean;
};

export default function CustomerSettingsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
    const [profileSaved, setProfileSaved] = useState(false);

    const [passwordForm, setPasswordForm] = useState({ current: "", newPw: "", confirm: "" });
    const [passwordSaved, setPasswordSaved] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const [addresses, setAddresses] = useState<Address[]>([]);

    const [addressModal, setAddressModal] = useState<{ open: boolean; address: Address | null }>({ open: false, address: null });
    const [addressForm, setAddressForm] = useState({ label: "", street_address: "", city: "", province: "", postal_code: "", country: "Pakistan" });
    const [deleteAddressConfirm, setDeleteAddressConfirm] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch user profile
                const profileRes = await fetch("/api/users/profile");
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    const profile = data.data;
                    setProfileForm({
                        firstName: profile.full_name?.split(" ")[0] || "",
                        lastName: profile.full_name?.split(" ").slice(1).join(" ") || "",
                        email: profile.email || "",
                        phone: profile.phone || "",
                    });
                }

                // Fetch addresses
                const addressRes = await fetch("/api/users/addresses");
                if (addressRes.ok) {
                    const data = await addressRes.json();
                    setAddresses(data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchUserData();
        }
    }, [user]);

    const handleSaveProfile = async () => {
        try {
            const res = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
                    phone: profileForm.phone,
                }),
            });

            if (res.ok) {
                setProfileSaved(true);
                setTimeout(() => setProfileSaved(false), 3000);
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Failed to update profile");
        }
    };

    const handleSavePassword = async () => {
        if (!passwordForm.current || !passwordForm.newPw || !passwordForm.confirm) {
            setPasswordError("Please fill in all fields.");
            return;
        }
        if (passwordForm.newPw !== passwordForm.confirm) {
            setPasswordError("New passwords do not match.");
            return;
        }
        if (passwordForm.newPw.length < 8) {
            setPasswordError("Password must be at least 8 characters.");
            return;
        }

        try {
            const res = await fetch("/api/users/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    current_password: passwordForm.current,
                    new_password: passwordForm.newPw,
                }),
            });

            if (res.ok) {
                setPasswordError("");
                setPasswordSaved(true);
                setPasswordForm({ current: "", newPw: "", confirm: "" });
                setTimeout(() => setPasswordSaved(false), 3000);
            } else {
                const error = await res.json();
                setPasswordError(error.error || "Failed to update password");
            }
        } catch (error) {
            console.error("Failed to update password:", error);
            setPasswordError("Failed to update password");
        }
    };

    const openAddAddress = () => {
        setAddressForm({ label: "", street_address: "", city: "", province: "", postal_code: "", country: "Pakistan" });
        setAddressModal({ open: true, address: null });
    };

    const openEditAddress = (address: Address) => {
        setAddressForm({
            label: address.label,
            street_address: address.street_address,
            city: address.city,
            province: address.province,
            postal_code: address.postal_code,
            country: address.country,
        });
        setAddressModal({ open: true, address });
    };

    const handleSaveAddress = async () => {
        if (!addressForm.label.trim() || !addressForm.street_address.trim()) return;

        try {
            if (addressModal.address) {
                // Edit
                const res = await fetch(`/api/users/addresses/${addressModal.address.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(addressForm),
                });

                if (res.ok) {
                    const data = await res.json();
                    setAddresses(prev => prev.map(a => a.id === addressModal.address!.id ? data.data : a));
                }
            } else {
                // Add
                const res = await fetch("/api/users/addresses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(addressForm),
                });

                if (res.ok) {
                    const data = await res.json();
                    setAddresses(prev => [...prev, data.data]);
                }
            }
            setAddressModal({ open: false, address: null });
        } catch (error) {
            console.error("Failed to save address:", error);
            alert("Failed to save address");
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const res = await fetch(`/api/users/addresses/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_default: true }),
            });

            if (res.ok) {
                setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
            }
        } catch (error) {
            console.error("Failed to set default address:", error);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        try {
            const res = await fetch(`/api/users/addresses/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setAddresses(prev => prev.filter(a => a.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete address:", error);
        }
        setDeleteAddressConfirm(null);
    };

    const addressToDelete = addresses.find(a => a.id === deleteAddressConfirm);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="inline-block w-8 h-8 border-4 border-virsa-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
                <p className="text-sm font-medium text-gray-500 mt-1">Manage your profile, security, and preferences</p>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
                    <p className="text-sm text-gray-500">Update your account&apos;s profile information and email address.</p>
                </div>

                <div className="p-6">
                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-virsa-primary text-white flex items-center justify-center text-3xl font-bold shadow-md overflow-hidden">
                                    {profileForm.firstName[0]}{profileForm.lastName[0]}
                                </div>
                                <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </button>
                            </div>
                            <button className="text-sm font-bold text-virsa-primary hover:text-virsa-primary/80 transition-colors">
                                Change Avatar
                            </button>
                        </div>

                        {/* Form Fields */}
                        <div className="flex-1 space-y-4 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">First Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={profileForm.firstName}
                                            onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Last Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={profileForm.lastName}
                                            onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={profileForm.phone}
                                        onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                {profileSaved && (
                                    <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Saved successfully!
                                    </span>
                                )}
                                <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-virsa-primary transition-colors shadow-sm">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Management */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Address Book</h2>
                        <p className="text-sm text-gray-500">Manage your shipping and billing addresses.</p>
                    </div>
                    <button
                        onClick={openAddAddress}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-virsa-primary hover:bg-virsa-primary/90 rounded-xl transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Add New
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.length === 0 && (
                        <div className="col-span-2 text-center py-10 text-gray-400">
                            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p className="text-sm font-medium">No addresses saved yet</p>
                        </div>
                    )}
                    {addresses.map(address => (
                        <div
                            key={address.id}
                            className={`rounded-xl p-5 relative transition-all ${address.is_default
                                ? "border-2 border-virsa-primary bg-virsa-light/10"
                                : "border border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            {address.is_default && (
                                <span className="absolute top-4 right-4 bg-virsa-primary text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm">
                                    Default
                                </span>
                            )}
                            <div className="flex items-start gap-3 mb-3">
                                <MapPin className={`w-5 h-5 flex-shrink-0 mt-0.5 ${address.is_default ? "text-virsa-primary" : "text-gray-400"}`} />
                                <div>
                                    <h3 className="font-bold text-gray-900">{address.label}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {address.street_address}<br />
                                        {address.city}, {address.province} {address.postal_code}<br />
                                        {address.country}
                                    </p>
                                </div>
                            </div>
                            <div className={`flex gap-3 mt-4 pt-4 border-t ${address.is_default ? "border-virsa-primary/20" : "border-gray-100"}`}>
                                <button onClick={() => openEditAddress(address)} className="flex items-center gap-1 text-sm font-bold text-virsa-primary hover:underline">
                                    <Pencil className="w-3.5 h-3.5" /> Edit
                                </button>
                                {!address.is_default && (
                                    <button onClick={() => handleSetDefault(address.id)} className="text-sm font-medium text-gray-600 hover:text-virsa-primary transition-colors">
                                        Set as Default
                                    </button>
                                )}
                                <button onClick={() => setDeleteAddressConfirm(address.id)} className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors ml-auto">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-virsa-primary" />
                        Update Password
                    </h2>
                    <p className="text-sm text-gray-500">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                <div className="p-6">
                    <div className="max-w-md space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.current}
                                onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPw}
                                onChange={e => setPasswordForm(f => ({ ...f, newPw: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                value={passwordForm.confirm}
                                onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                            />
                        </div>

                        {passwordError && (
                            <p className="text-sm font-medium text-red-500">{passwordError}</p>
                        )}

                        <div className="pt-4 flex items-center gap-3">
                            {passwordSaved && (
                                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                                    <CheckCircle2 className="w-4 h-4" /> Password updated!
                                </span>
                            )}
                            <button onClick={handleSavePassword} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-virsa-primary transition-colors shadow-sm">
                                Save Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Address Modal */}
            {addressModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setAddressModal({ open: false, address: null })}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">{addressModal.address ? "Edit Address" : "Add New Address"}</h2>
                            <button onClick={() => setAddressModal({ open: false, address: null })} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Label (e.g. Home, Office)</label>
                                <input
                                    type="text"
                                    value={addressForm.label}
                                    onChange={e => setAddressForm(f => ({ ...f, label: e.target.value }))}
                                    placeholder="Home"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Street Address</label>
                                <input
                                    type="text"
                                    value={addressForm.street_address}
                                    onChange={e => setAddressForm(f => ({ ...f, street_address: e.target.value }))}
                                    placeholder="123 Main Street"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">City</label>
                                    <input
                                        type="text"
                                        value={addressForm.city}
                                        onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))}
                                        placeholder="Lahore"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Province</label>
                                    <input
                                        type="text"
                                        value={addressForm.province}
                                        onChange={e => setAddressForm(f => ({ ...f, province: e.target.value }))}
                                        placeholder="Punjab"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Postal Code</label>
                                    <input
                                        type="text"
                                        value={addressForm.postal_code}
                                        onChange={e => setAddressForm(f => ({ ...f, postal_code: e.target.value }))}
                                        placeholder="54000"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Country</label>
                                    <input
                                        type="text"
                                        value={addressForm.country}
                                        onChange={e => setAddressForm(f => ({ ...f, country: e.target.value }))}
                                        placeholder="Pakistan"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setAddressModal({ open: false, address: null })} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveAddress}
                                    disabled={!addressForm.label.trim() || !addressForm.street_address.trim()}
                                    className="flex-1 py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addressModal.address ? "Save Changes" : "Add Address"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Address Confirm */}
            {deleteAddressConfirm !== null && addressToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteAddressConfirm(null)}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Address?</h3>
                            <p className="text-sm text-gray-500 mb-1">Are you sure you want to delete your</p>
                            <p className="text-sm font-bold text-gray-900 mb-6">"{addressToDelete.label}" address?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteAddressConfirm(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={() => handleDeleteAddress(deleteAddressConfirm)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
