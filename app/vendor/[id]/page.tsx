import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Calendar, ShieldCheck, Package, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import VendorProductsClient from "@/components/VendorProductsClient";
import type { Metadata } from "next";

type Vendor = {
    id: string;
    store_name: string;
    store_description: string | null;
    logo_url: string | null;
    banner_url: string | null;
    city: string | null;
    average_rating: number;
    total_reviews: number;
    created_at: string;
};

type Product = {
    id: string;
    name: string;
    slug: string;
    price: string;
    thumbnail_url: string | null;
    images: string[];
    average_rating: number;
    total_sold: number;
    stock: number;
};

type Review = {
    id: string;
    rating: number;
    body: string | null;
    created_at: string;
    users: {
        full_name: string;
    };
};

async function getVendor(id: string): Promise<Vendor | null> {
    try {
        const supabase = await createClient();
        
        const { data, error } = await supabase
            .from('vendors')
            .select('*')
            .eq('id', id)
            .eq('status', 'approved')
            .single();

        if (error || !data) {
            console.error('Error fetching vendor:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Failed to fetch vendor:', error);
        return null;
    }
}

async function getVendorProducts(vendorId: string): Promise<Product[]> {
    try {
        const supabase = await createClient();
        
        const { data, error } = await supabase
            .from('products')
            .select('id, name, slug, price, thumbnail_url, images, average_rating, total_sold, stock')
            .eq('vendor_id', vendorId)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
}

async function getVendorReviews(vendorId: string): Promise<Review[]> {
    try {
        const supabase = await createClient();
        
        // First get product IDs for this vendor
        const { data: productData } = await supabase
            .from('products')
            .select('id')
            .eq('vendor_id', vendorId);

        if (!productData || productData.length === 0) {
            return [];
        }

        const productIds = productData.map((p: { id: string }) => p.id);

        // Then get reviews for those products
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                id,
                rating,
                body,
                created_at,
                users!inner (
                    full_name
                )
            `)
            .in('product_id', productIds)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }

        // Transform the data to match our type
        return (data || []).map((review: any) => ({
            id: review.id,
            rating: review.rating,
            body: review.body,
            created_at: review.created_at,
            users: {
                full_name: review.users.full_name
            }
        }));
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const vendor = await getVendor(id);
    
    if (!vendor) {
        return {
            title: 'Vendor Not Found - Virsa Marketplace',
        };
    }

    return {
        title: `${vendor.store_name} - Virsa Marketplace`,
        description: vendor.store_description || `Shop from ${vendor.store_name} on Virsa Marketplace`,
    };
}

// Revalidate every 10 minutes
export const revalidate = 600;

export default async function VendorPublicPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const [vendor, products, reviews] = await Promise.all([
        getVendor(id),
        getVendorProducts(id),
        getVendorReviews(id),
    ]);

    if (!vendor) {
        notFound();
    }

    const joinedDate = new Date(vendor.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const productCount = products.length;

    return (
        <div className="bg-gray-50/50 min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100 px-4 py-3">
                <div className="container mx-auto max-w-6xl flex items-center text-sm text-gray-500">
                    <Link href="/" className="hover:text-virsa-primary transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <Link href="/vendors" className="hover:text-virsa-primary transition-colors">Stores</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <span className="text-gray-900 font-medium">{vendor.store_name}</span>
                </div>
            </div>

            {/* Cover & Header */}
            <div className="bg-white border-b border-gray-100">
                {/* Banner */}
                <div className="h-48 md:h-64 w-full relative overflow-hidden bg-gradient-to-r from-virsa-primary via-virsa-primary/80 to-virsa-secondary">
                    {vendor.banner_url && (
                        <Image
                            src={vendor.banner_url}
                            alt={`${vendor.store_name} banner`}
                            fill
                            className="object-cover"
                            priority
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-virsa-primary/60 via-virsa-primary/40 to-transparent" />
                </div>

                <div className="container mx-auto px-4 max-w-6xl relative">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 -mt-16 mb-6 relative z-10">
                        {/* Vendor logo */}
                        <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-3xl p-2 shadow-xl border border-gray-100 flex-shrink-0 overflow-hidden relative">
                            {vendor.logo_url ? (
                                <Image
                                    src={vendor.logo_url}
                                    alt={vendor.store_name}
                                    fill
                                    className="object-cover rounded-2xl"
                                />
                            ) : (
                                <div className="w-full h-full bg-virsa-primary/10 rounded-2xl flex items-center justify-center">
                                    <span className="text-4xl font-black text-virsa-primary">
                                        {vendor.store_name[0]}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col justify-end py-2">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-extrabold text-gray-900">{vendor.store_name}</h1>
                                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-100">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                                        </span>
                                    </div>
                                    {vendor.store_description && (
                                        <p className="text-gray-500 mb-3 max-w-xl text-sm">{vendor.store_description}</p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
                                        <span className="flex items-center gap-1 font-bold text-amber-500">
                                            <Star className="w-4 h-4 fill-current" /> {vendor.average_rating.toFixed(1)}
                                            <span className="text-gray-400 font-normal">({vendor.total_reviews.toLocaleString()} reviews)</span>
                                        </span>
                                        {vendor.city && (
                                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" /> {vendor.city}</span>
                                        )}
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" /> Joined {joinedDate}</span>
                                        <span className="flex items-center gap-1"><Package className="w-4 h-4 text-gray-400" /> {productCount} Products</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section - Client Component */}
            <VendorProductsClient 
                products={products} 
                reviews={reviews}
                vendorName={vendor.store_name}
                vendorRating={vendor.average_rating}
                totalReviews={vendor.total_reviews}
            />
        </div>
    );
}
