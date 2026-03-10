import { Clock, Zap, Flame, ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import DealsClientActions from "@/components/DealsClientActions";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daily Deals - Virsa Marketplace",
    description: "Discover amazing daily deals and discounts on top products. Limited time offers refreshed every day!",
};

// Revalidate every 5 minutes to keep deals fresh
export const revalidate = 300;

type Deal = {
    id: string;
    product_id: string;
    discount_percentage: number;
    deal_price: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    products: {
        id: string;
        name: string;
        slug: string;
        price: string;
        thumbnail_url: string | null;
        images: string[];
        average_rating: number;
        total_sold: number;
        vendor_id: string;
    };
    vendors: {
        id: string;
        store_name: string;
        logo_url: string | null;
    };
};

async function getDeals(): Promise<Deal[]> {
    try {
        const supabase = createClient();
        const now = new Date().toISOString();
        
        const { data, error } = await supabase
            .from('deals')
            .select(`
                *,
                products!inner (
                    id,
                    name,
                    slug,
                    price,
                    thumbnail_url,
                    images,
                    average_rating,
                    total_sold,
                    vendor_id
                ),
                vendors!inner (
                    id,
                    store_name,
                    logo_url
                )
            `)
            .eq('is_active', true)
            .lte('start_date', now)
            .gte('end_date', now)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching deals:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Failed to fetch deals:', error);
        return [];
    }
}

function calculateOriginalPrice(dealPrice: string, discount: number) {
    const price = parseFloat(dealPrice);
    const original = price / (1 - discount / 100);
    return Math.round(original);
}

export default async function DealsPage() {
    const deals = await getDeals();

    return (
        <div className="container mx-auto px-4 py-10">
            {/* Hero */}
            <div className="relative bg-gradient-to-br from-virsa-primary to-virsa-dark rounded-3xl p-8 md:p-12 mb-10 overflow-hidden text-white text-center">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 bg-virsa-danger text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                        <Flame className="w-3 h-3" /> LIMITED TIME OFFERS
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Daily Deals</h1>
                    <p className="text-white/80 text-lg mb-6 max-w-lg mx-auto">Handpicked discounts, refreshed every day. Don&apos;t miss out!</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-white/70 font-medium">
                        <Clock className="w-4 h-4" />
                        <span>Active deals: </span>
                        <span className="font-black text-white text-base">{deals.length}</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs - Client Component */}
            <DealsClientActions />

            {/* Deals Grid */}
            {deals.length === 0 ? (
                <div className="text-center py-20">
                    <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No active deals right now</h3>
                    <p className="text-gray-500 mb-6">Check back soon for amazing discounts!</p>
                    <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-virsa-primary text-white rounded-xl font-bold hover:bg-virsa-dark transition-colors">
                        Browse All Products <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {deals.map((deal) => {
                        const originalPrice = calculateOriginalPrice(deal.deal_price, deal.discount_percentage);
                        const imageUrl = deal.products.thumbnail_url || deal.products.images?.[0] || "/product_headphones.png";
                        
                        return (
                            <div key={deal.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col overflow-hidden hover:-translate-y-1">
                                {/* Image */}
                                <Link href={`/product/${deal.product_id}`} className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                                    <Image
                                        src={imageUrl}
                                        alt={deal.products.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-3 left-3 bg-virsa-danger text-white text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1">
                                        <Zap className="w-3 h-3" /> -{deal.discount_percentage}%
                                    </div>
                                </Link>

                                <div className="p-4 flex flex-col flex-1">
                                    <Link href={`/product/${deal.product_id}`} className="text-sm font-bold text-gray-900 hover:text-virsa-primary transition-colors line-clamp-2 mb-1 flex-1">
                                        {deal.products.name}
                                    </Link>
                                    <p className="text-xs text-gray-500 mb-2">by {deal.vendors.store_name}</p>

                                    <div className="flex items-center gap-1 mb-3">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < Math.floor(deal.products.average_rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500">({deal.products.total_sold} sold)</span>
                                    </div>

                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-lg font-black text-gray-900">Rs {parseFloat(deal.deal_price).toLocaleString()}</span>
                                        <span className="text-xs text-gray-400 line-through">Rs {originalPrice.toLocaleString()}</span>
                                    </div>

                                    {/* Stock bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                            <span>Sold: {deal.products.total_sold}</span>
                                            <span>Hurry, limited stock!</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                            <div className="h-full bg-virsa-danger rounded-full" style={{ width: `${Math.min((deal.products.total_sold / 200) * 100, 85)}%` }}></div>
                                        </div>
                                    </div>

                                    <Link 
                                        href={`/product/${deal.product_id}`}
                                        className="w-full py-2.5 bg-virsa-primary text-white rounded-xl text-sm font-bold hover:bg-virsa-dark transition-colors flex items-center justify-center gap-2"
                                    >
                                        View Deal
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="text-center mt-12">
                <Link href="/products" className="inline-flex items-center gap-2 text-virsa-primary font-bold hover:underline">
                    Browse All Products <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
