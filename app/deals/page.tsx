import { Clock, Zap, Flame, ChevronRight, ShoppingCart, Heart, Star } from "lucide-react";
import Link from "next/link";

export default function DealsPage() {
    const deals = [
        { id: 1, name: "Premium Wireless Noise-Cancelling Headphones Pro", price: "Rs 19,999", originalPrice: "Rs 34,999", discount: "43%", vendor: "Tech Haven PK", rating: 4.8, sold: 124, badge: "Best Seller" },
        { id: 2, name: "Smart Watch Series 8 GPS + Cellular", price: "Rs 34,999", originalPrice: "Rs 55,000", discount: "36%", vendor: "Electronics Pro", rating: 4.7, sold: 89, badge: "Flash Deal" },
        { id: 3, name: "Ergonomic Office Chair with Lumbar Support", price: "Rs 22,500", originalPrice: "Rs 35,000", discount: "35%", vendor: "Home Essentials", rating: 4.5, sold: 56, badge: null },
        { id: 4, name: "Premium Skincare Routine Bundle (5 Products)", price: "Rs 4,999", originalPrice: "Rs 7,500", discount: "33%", vendor: "Beauty Store", rating: 4.9, sold: 310, badge: "Hot Deal" },
        { id: 5, name: "Portable Bluetooth Speaker 360° Sound", price: "Rs 5,499", originalPrice: "Rs 8,000", discount: "31%", vendor: "Tech Haven PK", rating: 4.6, sold: 78, badge: null },
        { id: 6, name: "Nike Air Max 270 Running Shoes", price: "Rs 13,999", originalPrice: "Rs 19,999", discount: "30%", vendor: "Fashion Hub", rating: 4.8, sold: 201, badge: "Top Rated" },
        { id: 7, name: "DSLR Camera Bag Waterproof, Multi-Pocket", price: "Rs 3,999", originalPrice: "Rs 5,500", discount: "27%", vendor: "Sports World PK", rating: 4.4, sold: 45, badge: null },
        { id: 8, name: "Stainless Steel Cookware Set (7 Pieces)", price: "Rs 8,999", originalPrice: "Rs 12,000", discount: "25%", vendor: "Home Essentials", rating: 4.7, sold: 132, badge: null },
    ];

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
                        <span>Deals reset in: </span>
                        <span className="font-black text-white text-base">08:42:15</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
                {["All Deals", "Flash Sales", "Best Sellers", "Electronics", "Fashion", "Home", "Beauty"].map((tab, i) => (
                    <button key={tab} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${i === 0 ? 'bg-virsa-primary text-white border-virsa-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-virsa-primary hover:text-virsa-primary'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Deals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {deals.map((deal) => (
                    <div key={deal.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col overflow-hidden hover:-translate-y-1">
                        {/* Image placeholder */}
                        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                            <ShoppingCart className="w-16 h-16 text-gray-200" strokeWidth={1} />
                            <div className="absolute top-3 left-3 bg-virsa-danger text-white text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <Zap className="w-3 h-3" /> -{deal.discount}
                            </div>
                            {deal.badge && (
                                <div className="absolute top-3 right-10 bg-virsa-secondary text-virsa-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {deal.badge}
                                </div>
                            )}
                            <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm">
                                <Heart className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                            <Link href={`/product/${deal.id}`} className="text-sm font-bold text-gray-900 hover:text-virsa-primary transition-colors line-clamp-2 mb-1 flex-1">
                                {deal.name}
                            </Link>
                            <p className="text-xs text-gray-500 mb-2">by {deal.vendor}</p>

                            <div className="flex items-center gap-1 mb-3">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(deal.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                                <span className="text-xs text-gray-500">({deal.sold} sold)</span>
                            </div>

                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-lg font-black text-gray-900">{deal.price}</span>
                                <span className="text-xs text-gray-400 line-through">{deal.originalPrice}</span>
                            </div>

                            {/* Stock bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                    <span>Sold: {deal.sold}</span>
                                    <span>Hurry, limited stock!</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                    <div className="h-full bg-virsa-danger rounded-full" style={{ width: `${Math.min((deal.sold / 200) * 100, 85)}%` }}></div>
                                </div>
                            </div>

                            <button className="w-full py-2.5 bg-virsa-primary text-white rounded-xl text-sm font-bold hover:bg-virsa-dark transition-colors flex items-center justify-center gap-2">
                                <ShoppingCart className="w-4 h-4" /> Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-12">
                <Link href="/products" className="inline-flex items-center gap-2 text-virsa-primary font-bold hover:underline">
                    Browse All Products <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
