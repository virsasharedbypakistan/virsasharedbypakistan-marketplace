"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Store, Clock, CheckCircle2, XCircle, Eye, ChevronRight, Search,
    Filter, Download, MapPin, Phone, Mail, Calendar, Building2,
    FileText, CreditCard, AlertCircle, MessageSquare, X, RefreshCcw,
    User, ShieldCheck, Loader2
} from "lucide-react";

/* ─── Types ─── */
type AppStatus = "Pending" | "Under Review" | "Approved" | "Rejected";

type Application = {
    id: string;
    storeName: string;
    category: string;
    ownerName: string;
    email: string;
    phone: string;
    city: string;
    businessType: string;
    cnic: string;
    bankName: string;
    iban: string;
    description: string;
    submittedAt: string;
    status: AppStatus;
    reviewNote?: string;
    socialLinks: { website?: string; instagram?: string };
    docsUploaded: boolean;
};

/* ─── Mock Data ─── */
const INITIAL_APPS: Application[] = [
    {
        id: "APP-001", storeName: "StyleMates Boutique", category: "Fashion & Clothing",
        ownerName: "Anam Tariq", email: "anam@stylematespk.com", phone: "03211234567",
        city: "Lahore", businessType: "Individual / Sole Proprietor",
        cnic: "35202-1234567-1", bankName: "HBL", iban: "PK36HABB0000001234567802",
        description: "Premium women's fashion boutique offering local and imported clothing collections. Serving customers since 2020 through physical stores and now expanding online.",
        submittedAt: "Feb 28, 2026 – 7:34 AM", status: "Pending",
        socialLinks: { instagram: "@stylematespk" }, docsUploaded: true,
    },
    {
        id: "APP-002", storeName: "Home Luxe Store", category: "Home & Garden",
        ownerName: "Fahad Mehmood", email: "fahad@homeluxe.pk", phone: "03001122334",
        city: "Karachi", businessType: "Private Limited Company",
        cnic: "42201-9988776-5", bankName: "Meezan Bank", iban: "PK70MEZN0000001122334455",
        description: "High-end home décor and furniture retailer. Registered private limited company with 5 years of e-commerce experience.",
        submittedAt: "Feb 27, 2026 – 2:10 PM", status: "Under Review",
        socialLinks: { website: "https://homeluxe.pk", instagram: "@homeluxepk" }, docsUploaded: true,
    },
    {
        id: "APP-003", storeName: "TechZone PK", category: "Electronics",
        ownerName: "Bilal Qureshi", email: "bilal@techzone.pk", phone: "03451239876",
        city: "Islamabad", businessType: "Partnership",
        cnic: "61101-5566778-3", bankName: "Bank Alfalah", iban: "PK30ALFA0001001234567890",
        description: "Authorized reseller of consumer electronics including laptops, phones, and accessories. Partnered with Samsung and Xiaomi.",
        submittedAt: "Feb 26, 2026 – 10:55 AM", status: "Pending",
        socialLinks: { website: "https://techzone.pk" }, docsUploaded: false,
    },
    {
        id: "APP-004", storeName: "Beauty Bloom PK", category: "Beauty & Health",
        ownerName: "Sana Mirza", email: "sana@beautybloom.pk", phone: "03129988776",
        city: "Rawalpindi", businessType: "Individual / Sole Proprietor",
        cnic: "37405-7788990-4", bankName: "MCB", iban: "PK07MUCB0000001100231702",
        description: "Skincare and beauty products marketplace. Stocks 200+ authentic international and local beauty brands.",
        submittedAt: "Feb 25, 2026 – 9:00 AM", status: "Approved",
        reviewNote: "All documents verified. Store approved and activated.",
        socialLinks: { instagram: "@beautybloompk" }, docsUploaded: true,
    },
    {
        id: "APP-005", storeName: "QuickShip Electronics", category: "Electronics",
        ownerName: "Imran Siddique", email: "imran@quickship.pk", phone: "03331122445",
        city: "Faisalabad", businessType: "Individual / Sole Proprietor",
        cnic: "33102-1122334-7", bankName: "UBL", iban: "PK29UNIL0010001234567890",
        description: "Budget electronics retailer.",
        submittedAt: "Feb 24, 2026 – 3:30 PM", status: "Rejected",
        reviewNote: "Insufficient documentation. CNIC copy is blurry and business description is too vague. Please reapply with proper details.",
        socialLinks: {}, docsUploaded: false,
    },
];

/* ─── Helpers ─── */
const STATUS_STYLE: Record<AppStatus, string> = {
    "Pending": "bg-amber-50 text-amber-700 border-amber-200",
    "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
    "Approved": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Rejected": "bg-red-50 text-red-700 border-red-200",
};

const STATUS_ICON: Record<AppStatus, React.ReactNode> = {
    "Pending": <Clock className="w-3.5 h-3.5" />,
    "Under Review": <Eye className="w-3.5 h-3.5" />,
    "Approved": <CheckCircle2 className="w-3.5 h-3.5" />,
    "Rejected": <XCircle className="w-3.5 h-3.5" />,
};

/* ─── Detail Modal ─── */
function DetailModal({
    app,
    onClose,
    onApprove,
    onStartReview,
    onReject,
}: {
    app: Application;
    onClose: () => void;
    onApprove: (id: string) => void;
    onStartReview: (id: string) => void;
    onReject: (id: string, note: string) => void;
}) {
    const [rejecting, setRejecting] = useState(false);
    const [rejectNote, setRejectNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleReject = async () => {
        if (!rejectNote.trim()) return;
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 800));
        onReject(app.id, rejectNote);
        setSubmitting(false);
    };

    const handleApprove = async () => {
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 800));
        onApprove(app.id);
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/60 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-extrabold text-gray-900">{app.storeName}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{app.id} · Submitted {app.submittedAt}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[app.status]}`}>
                            {STATUS_ICON[app.status]} {app.status}
                        </span>
                        <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    {/* Store + Owner */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-virsa-primary/5 rounded-2xl p-4 border border-virsa-primary/10">
                            <p className="text-xs font-bold text-virsa-primary uppercase tracking-wider mb-3 flex items-center gap-1"><Store className="w-3.5 h-3.5" /> Store Info</p>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-gray-500">Name:</span> <span className="font-bold text-gray-900 ml-1">{app.storeName}</span></p>
                                <p><span className="text-gray-500">Category:</span> <span className="font-bold text-gray-900 ml-1">{app.category}</span></p>
                                <p><span className="text-gray-500">Business:</span> <span className="font-medium text-gray-800 ml-1">{app.businessType}</span></p>
                                <p className="flex items-center gap-1 text-gray-500"><MapPin className="w-3.5 h-3.5" /><span className="font-medium text-gray-800">{app.city}</span></p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Owner Info</p>
                            <div className="space-y-2 text-sm">
                                <p className="font-bold text-gray-900">{app.ownerName}</p>
                                <p className="flex items-center gap-1.5 text-gray-600"><Mail className="w-3.5 h-3.5 text-gray-400" />{app.email}</p>
                                <p className="flex items-center gap-1.5 text-gray-600"><Phone className="w-3.5 h-3.5 text-gray-400" />{app.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Store Description</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{app.description}</p>
                    </div>

                    {/* Documents & Bank */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Documents</p>
                            <div className="space-y-2.5 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">CNIC</span>
                                    <span className="font-mono text-gray-800 font-medium text-xs">{app.cnic}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">CNIC Copy</span>
                                    {app.docsUploaded
                                        ? <span className="text-emerald-600 font-bold text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Uploaded</span>
                                        : <span className="text-red-500 font-bold text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Missing</span>}
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Bank Details</p>
                            <div className="space-y-2.5 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Bank</span>
                                    <span className="font-bold text-gray-800">{app.bankName}</span>
                                </div>
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-gray-500 flex-shrink-0">IBAN</span>
                                    <span className="font-mono text-gray-800 text-xs text-right break-all">{app.iban}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social */}
                    {(app.socialLinks.website || app.socialLinks.instagram) && (
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-sm space-y-1">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Social Links</p>
                            {app.socialLinks.website && <p><span className="text-gray-500">Website:</span> <a href={app.socialLinks.website} className="text-virsa-primary font-medium ml-1 hover:underline" target="_blank" rel="noreferrer">{app.socialLinks.website}</a></p>}
                            {app.socialLinks.instagram && <p><span className="text-gray-500">Instagram:</span> <span className="font-medium text-gray-800 ml-1">{app.socialLinks.instagram}</span></p>}
                        </div>
                    )}

                    {/* Previous review note */}
                    {app.reviewNote && (
                        <div className={`rounded-2xl p-4 border text-sm ${app.status === "Approved" ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                            <p className={`text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${app.status === "Approved" ? "text-emerald-700" : "text-red-700"}`}>
                                <MessageSquare className="w-3.5 h-3.5" /> Admin Note
                            </p>
                            <p className={app.status === "Approved" ? "text-emerald-800" : "text-red-800"}>{app.reviewNote}</p>
                        </div>
                    )}

                    {/* Rejection input */}
                    {rejecting && (
                        <div className="bg-red-50 rounded-2xl p-4 border border-red-100 space-y-3">
                            <p className="text-sm font-bold text-red-700 flex items-center gap-2"><XCircle className="w-4 h-4" /> Rejection Reason</p>
                            <textarea
                                className="w-full text-sm border border-red-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                                rows={3}
                                placeholder="Explain why this application is being rejected (visible to the applicant)..."
                                value={rejectNote}
                                onChange={e => setRejectNote(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button onClick={() => setRejecting(false)} className="flex-1 py-2 rounded-xl bg-white border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50">Cancel</button>
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectNote.trim() || submitting}
                                    className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Rejecting...</> : "Confirm Reject"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                {(app.status === "Pending" || app.status === "Under Review") && !rejecting && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex flex-wrap gap-3 flex-shrink-0">
                        {app.status === "Pending" && (
                            <button
                                onClick={() => onStartReview(app.id)}
                                className="flex-1 min-w-[120px] py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                <Eye className="w-4 h-4" /> Mark Under Review
                            </button>
                        )}
                        <button
                            onClick={handleApprove}
                            disabled={submitting}
                            className="flex-1 min-w-[120px] py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Approve
                        </button>
                        <button
                            onClick={() => setRejecting(true)}
                            className="flex-1 min-w-[120px] py-3 rounded-xl bg-white border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            <XCircle className="w-4 h-4" /> Reject
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Main Page ─── */
export default function AdminApplicationsPage() {
    const [apps, setApps] = useState<Application[]>(INITIAL_APPS);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<AppStatus | "All">("All");
    const [selected, setSelected] = useState<Application | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleApprove = (id: string) => {
        const app = apps.find(a => a.id === id);
        setApps(prev => prev.map(a => a.id === id ? { ...a, status: "Approved", reviewNote: "All documents verified. Store approved and activated." } : a));
        setSelected(null);
        showToast(`✅ ${app?.storeName} has been approved and is now live.`);
    };

    const handleStartReview = (id: string) => {
        setApps(prev => prev.map(a => a.id === id ? { ...a, status: "Under Review" } : a));
        setSelected(prev => prev ? { ...prev, status: "Under Review" } : prev);
        showToast("Marked as Under Review.");
    };

    const handleReject = (id: string, note: string) => {
        const app = apps.find(a => a.id === id);
        setApps(prev => prev.map(a => a.id === id ? { ...a, status: "Rejected", reviewNote: note } : a));
        setSelected(null);
        showToast(`Application from ${app?.storeName} has been rejected.`, "error");
    };

    const counts: Record<AppStatus | "All", number> = {
        All: apps.length,
        Pending: apps.filter(a => a.status === "Pending").length,
        "Under Review": apps.filter(a => a.status === "Under Review").length,
        Approved: apps.filter(a => a.status === "Approved").length,
        Rejected: apps.filter(a => a.status === "Rejected").length,
    };

    const filtered = apps
        .filter(a => statusFilter === "All" || a.status === statusFilter)
        .filter(a =>
            a.storeName.toLowerCase().includes(search.toLowerCase()) ||
            a.ownerName.toLowerCase().includes(search.toLowerCase()) ||
            a.email.toLowerCase().includes(search.toLowerCase()) ||
            a.id.toLowerCase().includes(search.toLowerCase())
        );

    return (
        <div className="space-y-6" onClick={() => { }}>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1 text-sm text-gray-500">
                        <Link href="/admin/dashboard" className="hover:text-virsa-primary transition-colors">Dashboard</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-gray-900 font-medium">Vendor Applications</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-virsa-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-virsa-primary" />
                        </div>
                        Vendor Applications
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Review, approve, or reject vendor registration requests.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <Link
                        href="/admin/dashboard/vendors"
                        className="flex items-center gap-2 px-4 py-2.5 bg-virsa-primary text-white font-bold rounded-xl hover:bg-virsa-primary/90 transition-colors shadow-sm text-sm"
                    >
                        <Store className="w-4 h-4" /> All Vendors
                    </Link>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {([
                    { label: "Total", key: "All", icon: FileText, color: "text-gray-600", bg: "bg-gray-100" },
                    { label: "Pending", key: "Pending", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Under Review", key: "Under Review", icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Approved", key: "Approved", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                ] as const).map(({ label, key, icon: Icon, color, bg }) => (
                    <button
                        key={key}
                        onClick={() => setStatusFilter(key as AppStatus | "All")}
                        className={`bg-white rounded-[20px] p-5 border flex items-center gap-4 transition-all text-left ${statusFilter === key ? "border-virsa-primary ring-1 ring-virsa-primary/20 shadow-md" : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"}`}
                    >
                        <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center flex-shrink-0`}><Icon className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</p>
                            <p className="text-2xl font-black text-gray-900 leading-none mt-0.5">{counts[key as keyof typeof counts]}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by store name, owner, email or application ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-virsa-primary focus:ring-2 focus:ring-virsa-primary/20"
                    />
                </div>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl flex-shrink-0">
                    {(["All", "Pending", "Under Review", "Approved", "Rejected"] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${statusFilter === s ? "bg-white shadow text-virsa-primary" : "text-gray-500 hover:text-gray-800"}`}
                        >
                            {s} {s === "All" ? `(${counts.All})` : `(${counts[s as AppStatus]})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Applications Cards */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center text-gray-400">
                    <Building2 className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-bold text-gray-600">No applications found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                    <button onClick={() => { setSearch(""); setStatusFilter("All"); }} className="mt-4 text-sm text-virsa-primary font-bold hover:underline flex items-center gap-1">
                        <RefreshCcw className="w-3.5 h-3.5" /> Reset Filters
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(app => (
                        <div
                            key={app.id}
                            className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all group ${app.status === "Pending" ? "border-amber-200 bg-amber-50/20" : app.status === "Under Review" ? "border-blue-200 bg-blue-50/10" : "border-gray-100"}`}
                        >
                            <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {/* Icon & Store Name */}
                                <div className="w-12 h-12 rounded-2xl bg-virsa-primary/10 flex items-center justify-center flex-shrink-0 text-virsa-primary font-black text-lg">
                                    {app.storeName[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="font-extrabold text-gray-900">{app.storeName}</span>
                                        <span className="text-xs text-gray-400 font-mono">{app.id}</span>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_STYLE[app.status]}`}>
                                            {STATUS_ICON[app.status]} {app.status}
                                        </span>
                                        {!app.docsUploaded && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200"><AlertCircle className="w-3 h-3" /> Missing Docs</span>}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{app.ownerName}</span>
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{app.email}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.city}</span>
                                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{app.category}</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{app.submittedAt}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {app.status === "Pending" && (
                                        <>
                                            <button onClick={() => handleApprove(app.id)} className="px-3 py-2 text-xs font-bold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">Approve</button>
                                            <button onClick={() => setSelected(app)} className="px-3 py-2 text-xs font-bold bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors">Reject</button>
                                        </>
                                    )}
                                    {app.status === "Under Review" && (
                                        <button onClick={() => handleApprove(app.id)} className="px-3 py-2 text-xs font-bold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">Approve</button>
                                    )}
                                    <button
                                        onClick={() => setSelected(app)}
                                        className="px-3 py-2 text-xs font-bold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                                    >
                                        <Eye className="w-3.5 h-3.5" /> View
                                    </button>
                                </div>
                            </div>

                            {/* Review note strip */}
                            {app.reviewNote && (
                                <div className={`px-5 py-2.5 text-xs border-t flex items-center gap-2 ${app.status === "Approved" ? "bg-emerald-50/50 border-emerald-100 text-emerald-700" : "bg-red-50/50 border-red-100 text-red-700"}`}>
                                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="line-clamp-1">{app.reviewNote}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selected && (
                <DetailModal
                    app={selected}
                    onClose={() => setSelected(null)}
                    onApprove={handleApprove}
                    onStartReview={handleStartReview}
                    onReject={handleReject}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold ${toast.type === "success" ? "bg-gray-900" : "bg-red-600"}`}>
                    {toast.type === "success" ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5" />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
