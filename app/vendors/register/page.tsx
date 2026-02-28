"use client";

import { useState } from "react";
import Link from "next/link";
import {
    User, Store, FileText, CheckCircle2, XCircle, ChevronRight, ChevronLeft,
    AlertCircle, UploadCloud, Eye, EyeOff, Loader2,
    Phone, Mail, MapPin, Globe, Instagram, Facebook, Package, ShieldCheck, ArrowRight
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */
type FormData = {
    // Step 1 – Personal Info
    firstName: string; lastName: string; email: string; phone: string;
    password: string; confirmPassword: string;
    // Step 2 – Store Info
    storeName: string; storeSlug: string; category: string;
    city: string; address: string; description: string;
    website: string; instagram: string; facebook: string;
    // Step 3 – Documents
    cnic: string; cnicFile: string; businessType: string;
    ntn: string; bankName: string; accountTitle: string; iban: string;
    agreed: boolean;
};

type Errors = Partial<Record<keyof FormData, string>>;

const CATEGORIES = [
    "Electronics", "Fashion & Clothing", "Home & Garden", "Beauty & Health",
    "Sports & Outdoors", "Toys & Games", "Automotive", "Books & Stationery", "Food & Groceries", "Other",
];

const BANKS = [
    "HBL", "MCB", "UBL", "Meezan Bank", "Bank Alfalah", "Allied Bank", "Faysal Bank", "Standard Chartered", "Other",
];

const STEPS = [
    { label: "Personal Info", icon: User },
    { label: "Store Details", icon: Store },
    { label: "Documents", icon: FileText },
];

/* ─── Validators ──────────────────────────────────────────── */
function validateStep(step: number, data: FormData): Errors {
    const errors: Errors = {};
    if (step === 1) {
        if (!data.firstName.trim()) errors.firstName = "First name is required";
        if (!data.lastName.trim()) errors.lastName = "Last name is required";
        if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = "Enter a valid email address";
        if (!data.phone.match(/^(\+92|0)?3\d{9}$/)) errors.phone = "Enter a valid Pakistani phone number (03xxxxxxxxx)";
        if (data.password.length < 8) errors.password = "Password must be at least 8 characters";
        if (data.password !== data.confirmPassword) errors.confirmPassword = "Passwords do not match";
    }
    if (step === 2) {
        if (!data.storeName.trim()) errors.storeName = "Store name is required";
        if (!data.storeSlug.trim()) errors.storeSlug = "Store URL is required";
        else if (!data.storeSlug.match(/^[a-z0-9-]+$/)) errors.storeSlug = "URL can only contain lowercase letters, numbers and hyphens";
        if (!data.category) errors.category = "Please select a category";
        if (!data.city.trim()) errors.city = "City is required";
        if (!data.description.trim() || data.description.length < 20) errors.description = "Description must be at least 20 characters";
    }
    if (step === 3) {
        if (!data.cnic.match(/^\d{5}-\d{7}-\d{1}$/)) errors.cnic = "Enter a valid CNIC (e.g. 12345-1234567-1)";
        if (!data.businessType) errors.businessType = "Please select a business type";
        if (!data.bankName) errors.bankName = "Please select your bank";
        if (!data.accountTitle.trim()) errors.accountTitle = "Account title is required";
        if (!data.iban.match(/^PK\d{2}[A-Z]{4}\d{16}$/)) errors.iban = "Enter a valid Pakistan IBAN (e.g. PK36SCBL0000001123456702)";
        if (!data.agreed) errors.agreed = "You must agree to the terms & conditions";
    }
    return errors;
}

/* ─── Component ──────────────────────────────────────────── */
export default function VendorRegisterPage() {
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<Errors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const [form, setForm] = useState<FormData>({
        firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
        storeName: "", storeSlug: "", category: "", city: "", address: "", description: "",
        website: "", instagram: "", facebook: "",
        cnic: "", cnicFile: "", businessType: "", ntn: "", bankName: "", accountTitle: "", iban: "",
        agreed: false,
    });

    const set = (field: keyof FormData, value: string | boolean) => {
        setForm((f) => ({ ...f, [field]: value }));
        if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
        // Auto-generate slug from store name
        if (field === "storeName" && typeof value === "string") {
            const slug = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            setForm((f) => ({ ...f, storeName: value, storeSlug: slug }));
        }
    };

    const next = () => {
        const errs = validateStep(step, form);
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setErrors({});
        setStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const back = () => { setStep((s) => s - 1); setErrors({}); };

    const submit = async () => {
        const errs = validateStep(3, form);
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSubmitting(true);

        // Simulate network request — randomly succeed or succeed based on email domain
        await new Promise((r) => setTimeout(r, 2200));

        // Simulate failure if email contains "fail" keyword (demo purpose)
        if (form.email.toLowerCase().includes("fail")) {
            setErrorMessage("We couldn't process your application right now. Our servers are under maintenance. Please try again in a few minutes.");
            setSubmitStatus("error");
        } else {
            setSubmitStatus("success");
        }
        setSubmitting(false);
    };

    /* ─── Success Screen ──────────────────────────────────── */
    if (submitStatus === "success") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-virsa-primary/5 via-white to-virsa-secondary/5 flex items-center justify-center p-4">
                <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 max-w-lg w-full p-10 text-center">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-100">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Application Submitted!</h1>
                    <p className="text-gray-600 mb-2 text-lg">Thank you, <span className="font-bold text-virsa-primary">{form.firstName}</span>!</p>
                    <p className="text-gray-500 mb-8 leading-relaxed">Your vendor application for <span className="font-bold text-gray-800">"{form.storeName}"</span> has been received and is now under review. Our team will verify your documents within <span className="font-bold">2–3 business days</span>.</p>

                    <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left space-y-3 border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">What happens next?</p>
                        {[
                            { icon: Mail, text: "You'll receive a confirmation email at " + form.email },
                            { icon: ShieldCheck, text: "Our team will verify your CNIC and documents" },
                            { icon: Package, text: "Once approved, your store will go live instantly" },
                        ].map(({ icon: Icon, text }, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl bg-virsa-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Icon className="w-4 h-4 text-virsa-primary" />
                                </div>
                                <span className="text-sm text-gray-600">{text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/" className="flex-1 py-3 px-6 bg-virsa-primary text-white font-bold rounded-xl hover:bg-virsa-primary/90 transition-colors text-center flex items-center justify-center gap-2">
                            Go to Homepage <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/login" className="flex-1 py-3 px-6 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-center">
                            Log In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    /* ─── Error Screen ────────────────────────────────────── */
    if (submitStatus === "error") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50/40 via-white to-virsa-secondary/5 flex items-center justify-center p-4">
                <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 max-w-lg w-full p-10 text-center">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Submission Failed</h1>
                    <p className="text-gray-500 mb-6 leading-relaxed">{errorMessage}</p>

                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 flex items-start gap-3 text-left">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-red-700 mb-1">Your data has been saved</p>
                            <p className="text-xs text-red-600">Don&apos;t worry — all the information you entered is still here. Simply try submitting again.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => { setSubmitStatus("idle"); setStep(3); }}
                            className="flex-1 py-3 px-6 bg-virsa-primary text-white font-bold rounded-xl hover:bg-virsa-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            Try Again
                        </button>
                        <a href="mailto:support@virsamarket.com" className="flex-1 py-3 px-6 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-center flex items-center justify-center gap-2">
                            <Mail className="w-4 h-4" /> Contact Support
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    /* ─── Main Form ─────────────────────────────────────────── */
    const inputCls = (field: keyof FormData) =>
        `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${errors[field] ? "border-red-400 bg-red-50 focus:ring-red-300" : "border-gray-200 bg-gray-50 focus:bg-white focus:ring-virsa-primary/30 focus:border-virsa-primary"}`;

    const errMsg = (field: keyof FormData) =>
        errors[field] ? <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[field]}</p> : null;

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-virsa-primary/5 text-virsa-primary text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-virsa-primary/10 uppercase tracking-wider">
                        <Store className="w-3.5 h-3.5" /> Become a Vendor
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Start Selling on Virsa</h1>
                    <p className="text-gray-500">Join thousands of vendors reaching millions of buyers across Pakistan.</p>
                </div>

                {/* Step Indicators */}
                <div className="flex items-center justify-center mb-10">
                    {STEPS.map((s, i) => {
                        const num = i + 1;
                        const active = step === num;
                        const done = step > num;
                        const Icon = s.icon;
                        return (
                            <div key={i} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${done ? "bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]" : active ? "bg-virsa-primary text-white shadow-[0_4px_12px_rgba(71,112,76,0.3)]" : "bg-white border-2 border-gray-200 text-gray-400"}`}>
                                        {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span className={`text-xs mt-2 font-bold whitespace-nowrap ${active ? "text-virsa-primary" : done ? "text-emerald-600" : "text-gray-400"}`}>{s.label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 rounded-full transition-all ${step > num ? "bg-emerald-400" : "bg-gray-200"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.05)] border border-gray-100 p-8">

                    {/* ── Step 1: Personal Info ── */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 mb-1">Personal Information</h2>
                                <p className="text-sm text-gray-500">Tell us about yourself — the account owner.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">First Name</label>
                                    <input className={inputCls("firstName")} placeholder="Ali" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
                                    {errMsg("firstName")}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Last Name</label>
                                    <input className={inputCls("lastName")} placeholder="Hassan" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
                                    {errMsg("lastName")}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5"><Mail className="w-3.5 h-3.5 inline mr-1" />Email Address</label>
                                <input className={inputCls("email")} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                                {errMsg("email")}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5"><Phone className="w-3.5 h-3.5 inline mr-1" />Phone Number</label>
                                <input className={inputCls("phone")} placeholder="03001234567" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                                {errMsg("phone")}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <input className={inputCls("password") + " pr-12"} type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={(e) => set("password", e.target.value)} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errMsg("password")}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm Password</label>
                                <input className={inputCls("confirmPassword")} type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} />
                                {errMsg("confirmPassword")}
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Store Details ── */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 mb-1">Store Information</h2>
                                <p className="text-sm text-gray-500">Set up your public-facing store profile.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Store Name</label>
                                <input className={inputCls("storeName")} placeholder="e.g. Tech Haven PK" value={form.storeName} onChange={(e) => set("storeName", e.target.value)} />
                                {errMsg("storeName")}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Store URL</label>
                                <div className="flex items-center border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-virsa-primary/30 focus-within:border-virsa-primary transition-all" style={{ borderColor: errors.storeSlug ? "#f87171" : "#e5e7eb" }}>
                                    <span className="px-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 py-3 whitespace-nowrap font-medium">virsa.pk/</span>
                                    <input className="flex-1 px-3 py-3 text-sm outline-none bg-white" placeholder="your-store-name" value={form.storeSlug} onChange={(e) => set("storeSlug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
                                </div>
                                {errMsg("storeSlug")}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Product Category</label>
                                <select className={inputCls("category")} value={form.category} onChange={(e) => set("category", e.target.value)}>
                                    <option value="">Select a category...</option>
                                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {errMsg("category")}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5"><MapPin className="w-3.5 h-3.5 inline mr-1" />City</label>
                                    <input className={inputCls("city")} placeholder="Lahore" value={form.city} onChange={(e) => set("city", e.target.value)} />
                                    {errMsg("city")}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Address (Optional)</label>
                                    <input className={inputCls("address")} placeholder="Street, Area" value={form.address} onChange={(e) => set("address", e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Store Description</label>
                                <textarea className={inputCls("description") + " min-h-[100px] resize-none"} placeholder="Tell buyers what makes your store special (min. 20 characters)..." value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
                                <div className="flex justify-between items-center">
                                    {errMsg("description")}
                                    <span className={`text-xs ml-auto mt-1 ${form.description.length < 20 ? "text-gray-400" : "text-emerald-500"}`}>{form.description.length} / 20 min</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Social Links (Optional)</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><Globe className="w-4 h-4 text-gray-500" /></div>
                                        <input className={inputCls("website")} placeholder="https://yourwebsite.com" value={form.website} onChange={(e) => set("website", e.target.value)} />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0"><Instagram className="w-4 h-4 text-pink-500" /></div>
                                        <input className={inputCls("instagram")} placeholder="@yourhandle" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0"><Facebook className="w-4 h-4 text-blue-500" /></div>
                                        <input className={inputCls("facebook")} placeholder="facebook.com/yourpage" value={form.facebook} onChange={(e) => set("facebook", e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Documents & Bank ── */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 mb-1">Verification & Banking</h2>
                                <p className="text-sm text-gray-500">Required for account verification and payment processing.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">CNIC Number</label>
                                <input className={inputCls("cnic")} placeholder="12345-1234567-1" value={form.cnic}
                                    onChange={(e) => {
                                        let v = e.target.value.replace(/\D/g, "");
                                        if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);
                                        if (v.length > 13) v = v.slice(0, 13) + "-" + v.slice(13);
                                        set("cnic", v.slice(0, 15));
                                    }} />
                                {errMsg("cnic")}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Upload CNIC Copy</label>
                                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${form.cnicFile ? "border-emerald-400 bg-emerald-50" : "border-gray-300 hover:border-virsa-primary hover:bg-virsa-primary/5"}`}>
                                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => set("cnicFile", e.target.files?.[0]?.name ?? "")} />
                                    {form.cnicFile ? (
                                        <div className="text-center"><CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" /><p className="text-sm font-bold text-emerald-700">{form.cnicFile}</p></div>
                                    ) : (
                                        <div className="text-center"><UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" /><p className="text-sm font-bold text-gray-600">Click to upload</p><p className="text-xs text-gray-400 mt-1">PNG, JPG or PDF — max 5MB</p></div>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Business Type</label>
                                <select className={inputCls("businessType")} value={form.businessType} onChange={(e) => set("businessType", e.target.value)}>
                                    <option value="">Select type...</option>
                                    <option value="individual">Individual / Sole Proprietor</option>
                                    <option value="partnership">Partnership</option>
                                    <option value="private_limited">Private Limited Company</option>
                                    <option value="other">Other</option>
                                </select>
                                {errMsg("businessType")}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">NTN Number (Optional)</label>
                                <input className={inputCls("ntn")} placeholder="1234567-8" value={form.ntn} onChange={(e) => set("ntn", e.target.value)} />
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Bank Account Details</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Bank Name</label>
                                        <select className={inputCls("bankName")} value={form.bankName} onChange={(e) => set("bankName", e.target.value)}>
                                            <option value="">Select bank...</option>
                                            {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                        {errMsg("bankName")}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Account Title</label>
                                        <input className={inputCls("accountTitle")} placeholder="As per bank records" value={form.accountTitle} onChange={(e) => set("accountTitle", e.target.value)} />
                                        {errMsg("accountTitle")}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">IBAN</label>
                                        <input className={inputCls("iban")} placeholder="PK36SCBL0000001123456702" value={form.iban} onChange={(e) => set("iban", e.target.value.toUpperCase())} />
                                        {errMsg("iban")}
                                    </div>
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${form.agreed ? "border-emerald-400 bg-emerald-50" : errors.agreed ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"}`} onClick={() => set("agreed", !form.agreed)}>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${form.agreed ? "bg-emerald-500 border-emerald-500" : errors.agreed ? "border-red-400" : "border-gray-400"}`}>
                                        {form.agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        I agree to the Virsa Marketplace{" "}
                                        <Link href="/terms" className="text-virsa-primary font-bold hover:underline" onClick={(e) => e.stopPropagation()}>Terms & Conditions</Link>{" "}
                                        and{" "}
                                        <Link href="/privacy" className="text-virsa-primary font-bold hover:underline" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>. I confirm all provided information is accurate and complete.
                                    </p>
                                </label>
                                {errMsg("agreed")}
                            </div>
                        </div>
                    )}

                    {/* ── Navigation ── */}
                    <div className={`flex gap-4 mt-8 pt-6 border-t border-gray-100 ${step > 1 ? "justify-between" : "justify-end"}`}>
                        {step > 1 && (
                            <button onClick={back} className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        )}

                        {step < 3 ? (
                            <button onClick={next} className="flex items-center gap-2 px-8 py-3 bg-virsa-primary text-white font-bold rounded-xl hover:bg-virsa-primary/90 transition-all shadow-[0_4px_12px_rgba(71,112,76,0.3)] hover:shadow-[0_6px_20px_rgba(71,112,76,0.4)] hover:-translate-y-0.5">
                                Continue <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button onClick={submit} disabled={submitting} className="flex items-center gap-2 px-8 py-3 bg-virsa-primary text-white font-bold rounded-xl hover:bg-virsa-primary/90 transition-all shadow-[0_4px_12px_rgba(71,112,76,0.3)] disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5">
                                {submitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...</>
                                ) : (
                                    <><CheckCircle2 className="w-4 h-4" /> Submit Application</>
                                )}
                            </button>
                        )}
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-4">Step {step} of {STEPS.length}</p>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-virsa-primary font-bold hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
