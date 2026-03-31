"use client";

import { useState, useEffect } from "react";
import { Star, Search, Store } from "lucide-react";
import Image from "next/image";

type Vendor = {
    id: string;
    store_name: string;
    store_slug: string;
    description: string | null;
    logo_url: string | null;
    banner_url: string | null;
    is_featured: boolean;
    show_on_homepage: boolean;
    average_rating: number;
    total_reviews: number;
    product_count: number;
};

export default function AdminFeaturedStoresPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const response = await fetch("/api/admin/vendors");
            if (response.ok) {
                const result = await response.json();
                setVendors(result.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch vendors:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFeatured = async (vendorId: string, currentStatus: boolean) => {
        setUpdating(vendorId);
        try {
            const response = await fetch(`/api/admin/vendors/${vendorId}/featured`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_featured: !currentStatus })
            });

            if (response.ok) {
                setVendors(prev => prev.map(v => 
                    v.id === vendorId ? { ...v, is_featured: !currentStatus } : v
                ));
            } else {
                const error = await response.json();
                alert(error.error || "Failed to update featured status");
            }
        } catch (error) {
            console.error("Failed to toggle featured:", error);
            alert("Failed to update featured status");
        } finally {
            setUpdating(null);
        }
    };

    const toggleHomepage = async (vendorId: string, currentStatus: boolean) => {
        setUpdating(vendorId);
        try {
            const response = await fetch(`/api/admin/vendors/${vendorId}/homepage`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ show_on_homepage: !currentStatus })
            });

            if (response.ok) {
                setVendors(prev => prev.map(v => 
                    v.id === vendorId ? { ...v, show_on_homepage: !currentStatus } : v
                ));
            } else {
                const error = await response.json();
                alert(error.error || "Failed to update homepage visibility");
            }
        } catch (error) {
            console.error("Failed to toggle homepage:", error);
            alert("Failed to update homepage visibility");
        } finally {
            setUpdating(null);
        }
    };

    const filtered = vendors.filter(v =>
        v.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const featuredVendors = filtered.filter(v => v.is_featured);
    const homepageVendors = featuredVendors.filter(v => v.show_on_homepage);
    const nonFeaturedVendors = filtered.filter(v => !v.is_featured);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-virsa-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Stores Management</h1>
                <p className="text-gray-500 mt-1 text-sm">Select stores to feature on the homepage</p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search stores..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary"
                    />
                </div>
            </div>

            {/* Homepage Stores Section */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-green-50">
                    <h2 className="text-lg font-bold text-gray-900">Showing on Homepage ({homepageVendors.length}/4)</h2>
                    <p className="text-sm text-gray-500 mt-1">These stores are currently visible on the homepage</p>
                </div>
                <div className="p-6">
                    {homepageVendors.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Store className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="font-medium">No stores showing on homepage</p>
                            <p className="text-sm mt-1">Toggle the eye icon on featured stores below to show them</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {homepageVendors.map(vendor => (
                                <VendorCard
                                    key={vendor.id}
                                    vendor={vendor}
                                    onToggleFeatured={toggleFeatured}
                                    onToggleHomepage={toggleHomepage}
                                    updating={updating === vendor.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Featured Stores Section */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-virsa-primary/5">
                    <h2 className="text-lg font-bold text-gray-900">Featured Stores ({featuredVendors.length})</h2>
                    <p className="text-sm text-gray-500 mt-1">Mark stores as featured and control homepage visibility</p>
                </div>
                <div className="p-6">
                    {featuredVendors.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Store className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="font-medium">No featured stores yet</p>
                            <p className="text-sm mt-1">Click the star icon on stores below to feature them</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {featuredVendors.map(vendor => (
                                <VendorCard
                                    key={vendor.id}
                                    vendor={vendor}
                                    onToggleFeatured={toggleFeatured}
                                    onToggleHomepage={toggleHomepage}
                                    updating={updating === vendor.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* All Stores Section */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">All Stores</h2>
                    <p className="text-sm text-gray-500 mt-1">Click the star to add/remove from featured</p>
                </div>
                <div className="p-6">
                    {nonFeaturedVendors.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Store className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="font-medium">No stores found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {nonFeaturedVendors.map(vendor => (
                                <VendorCard
                                    key={vendor.id}
                                    vendor={vendor}
                                    onToggleFeatured={toggleFeatured}
                                    onToggleHomepage={toggleHomepage}
                                    updating={updating === vendor.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function VendorCard({ 
    vendor, 
    onToggleFeatured,
    onToggleHomepage,
    updating 
}: { 
    vendor: Vendor; 
    onToggleFeatured: (id: string, current: boolean) => void;
    onToggleHomepage: (id: string, current: boolean) => void;
    updating: boolean;
}) {
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            {/* Banner */}
            <div className="relative h-24 bg-gradient-to-r from-virsa-primary to-virsa-primary/80">
                {vendor.banner_url && (
                    <Image
                        src={vendor.banner_url}
                        alt={vendor.store_name}
                        fill
                        className="object-cover"
                    />
                )}
                {vendor.show_on_homepage && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        On Homepage
                    </div>
                )}
            </div>
            
            {/* Logo */}
            <div className="relative px-4 -mt-10">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white bg-white shadow-md">
                    <Image
                        src={vendor.logo_url || "/cat_electronics.png"}
                        alt={vendor.store_name}
                        width={80}
                        height={80}
                        className="object-cover"
                    />
                </div>
            </div>

            <div className="p-4 pt-2">
                <h3 className="font-bold text-gray-900 text-base mb-1">{vendor.store_name}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{vendor.description || "No description"}</p>
                
                <div className="flex items-center mb-3">
                    <div className="flex text-virsa-secondary">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-3 h-3 ${star <= Math.round(vendor.average_rating) ? "fill-current" : "text-gray-200"}`} />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">({vendor.total_reviews})</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-600">{vendor.product_count} products</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onToggleFeatured(vendor.id, vendor.is_featured)}
                            disabled={updating}
                            className={`p-2 rounded-lg transition-colors ${
                                vendor.is_featured
                                    ? "bg-virsa-secondary text-virsa-primary hover:bg-virsa-secondary/80"
                                    : "bg-gray-100 text-gray-400 hover:bg-virsa-secondary/20 hover:text-virsa-secondary"
                            } disabled:opacity-50`}
                            title={vendor.is_featured ? "Remove from featured" : "Add to featured"}
                        >
                            <Star className={`w-4 h-4 ${vendor.is_featured ? "fill-current" : ""}`} />
                        </button>
                        {vendor.is_featured && (
                            <button
                                onClick={() => onToggleHomepage(vendor.id, vendor.show_on_homepage)}
                                disabled={updating}
                                className={`p-2 rounded-lg transition-colors ${
                                    vendor.show_on_homepage
                                        ? "bg-green-500 text-white hover:bg-green-600"
                                        : "bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500"
                                } disabled:opacity-50`}
                                title={vendor.show_on_homepage ? "Hide from homepage" : "Show on homepage"}
                            >
                                {vendor.show_on_homepage ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
