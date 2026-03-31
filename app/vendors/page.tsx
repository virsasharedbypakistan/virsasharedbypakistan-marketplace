import { Star, Package, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import VendorsSearchClient from "@/components/VendorsSearchClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Stores - Virsa Marketplace",
    description: "Discover trusted local stores and vendors across Pakistan, all curated on one platform.",
};

// Revalidate every 10 minutes
export const revalidate = 600;

type Vendor = {
    id: string;
    store_name: string;
    description: string | null;
    logo_url: string | null;
    banner_url: string | null;
    phone: string | null;
    average_rating: number;
    total_reviews: number;
    status: string;
    created_at: string;
};

type VendorWithProducts = Vendor & {
    product_count: number;
};

async function getVendors(searchQuery?: string): Promise<VendorWithProducts[]> {
    try {
        // Get only approved vendors
        let query = supabaseAdmin
            .from('vendors')
            .select('*')
            .eq('status', 'approved')
            .order('average_rating', { ascending: false });

        if (searchQuery) {
            const trimmed = searchQuery.trim();
            if (trimmed) {
                query = query.or(`store_name.ilike.%${trimmed}%,description.ilike.%${trimmed}%`);
            }
        }

        const { data: vendors, error } = await query;

        if (error) {
            console.error('Error fetching vendors:', error);
            return [];
        }

        if (!vendors || vendors.length === 0) {
            return [];
        }

        // Get product counts for each vendor (only active products)
        const vendorIds = vendors.map(v => v.id);
        const { data: productCounts } = await supabaseAdmin
            .from('products')
            .select('vendor_id')
            .in('vendor_id', vendorIds)
            .eq('status', 'active');

        // Count products per vendor
        const countMap: Record<string, number> = {};
        productCounts?.forEach(p => {
            countMap[p.vendor_id] = (countMap[p.vendor_id] || 0) + 1;
        });

        // Combine data
        return vendors.map((vendor: any) => ({
            ...vendor,
            product_count: countMap[vendor.id] || 0,
        }));
    } catch (error) {
        console.error('Failed to fetch vendors:', error);
        return [];
    }
}

export default async function VendorsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
    const vendors = await getVendors(q);

    return (
        <div className="container mx-auto px-4 py-10">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Our Stores</h1>
                <p className="text-gray-500 max-w-xl mx-auto">Discover trusted local stores and vendors across Pakistan, all curated on one platform.</p>
            </div>

            {/* Search + Filter - Client Component */}
            <VendorsSearchClient initialQuery={q || ""} />

            {/* Vendor Grid */}
            {vendors.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {q ? "No stores match your search" : "No Vendors Yet"}
                    </h3>
                    <p className="text-gray-500">
                        {q ? "Try a different store name or keyword." : "Check back soon for amazing stores!"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {vendors.map((vendor) => {
                        const badge = vendor.average_rating >= 4.8 ? "Top Rated" : vendor.average_rating >= 4.5 ? "Trusted" : null;
                        
                        return (
                            <div key={vendor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col group overflow-hidden">
                                {/* Store Banner */}
                                <div className="h-24 bg-gradient-to-br from-virsa-primary/80 to-virsa-dark relative flex items-end p-4">
                                    {badge && (
                                        <span className="absolute top-3 right-3 bg-virsa-secondary text-virsa-primary text-[10px] font-bold px-2 py-1 rounded-full">
                                            {badge}
                                        </span>
                                    )}
                                    {/* Avatar */}
                                    <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-xl bg-white shadow-md border border-gray-100 flex items-center justify-center overflow-hidden">
                                        {vendor.logo_url ? (
                                            <Image
                                                src={vendor.logo_url}
                                                alt={vendor.store_name}
                                                width={56}
                                                height={56}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="font-black text-virsa-primary text-xl">
                                                {vendor.store_name[0]}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-8 px-4 pb-4 flex flex-col flex-1">
                                    <div className="mb-3">
                                        <h3 className="font-bold text-gray-900 leading-tight">{vendor.store_name}</h3>
                                        {vendor.description && (
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{vendor.description}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            {vendor.average_rating.toFixed(1)} ({vendor.total_reviews.toLocaleString()})
                                        </span>
                                        {vendor.phone && (
                                            <span className="flex items-center gap-1 truncate">
                                                📞 {vendor.phone}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                            <Package className="w-3 h-3" /> {vendor.product_count} Products
                                        </span>
                                    </div>

                                    <Link 
                                        href={`/vendor/${vendor.id}`} 
                                        className="mt-auto w-full py-2.5 border-2 border-virsa-primary text-virsa-primary rounded-xl text-sm font-bold hover:bg-virsa-primary hover:text-white transition-colors flex items-center justify-center gap-2 group-hover:bg-virsa-primary group-hover:text-white"
                                    >
                                        Visit Store <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
