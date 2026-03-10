"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, Heart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

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

type Props = {
    products: Product[];
    reviews: Review[];
    vendorName: string;
    vendorRating: number;
    totalReviews: number;
};

function ProductCard({ item, vendorName }: { item: Product; vendorName: string }) {
    const { addItem } = useCart();
    const { toggle, isInWishlist } = useWishlist();
    const [added, setAdded] = useState(false);
    const wishlisted = isInWishlist(item.id);

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem(item.id);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        toggle(item.id);
    };

    const imageUrl = item.thumbnail_url || item.images?.[0] || "/product_headphones.png";

    return (
        <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
            <Link href={`/product/${item.id}`} className="relative aspect-square bg-gray-50 overflow-hidden block">
                <Image
                    src={imageUrl}
                    alt={item.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
                {item.stock === 0 && (
                    <span className="absolute top-4 left-4 bg-gray-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10">Out of Stock</span>
                )}
                <button onClick={handleWishlist} className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all z-10 ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}>
                    <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
            </Link>

            <div className="p-5 flex flex-col flex-1 relative">
                <button
                    onClick={handleAdd}
                    disabled={item.stock === 0}
                    className={`absolute -top-6 right-5 w-12 h-12 rounded-full shadow-lg border border-gray-50 flex items-center justify-center transition-all duration-300 z-20 ${added ? 'bg-emerald-500 text-white' : item.stock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900 hover:bg-virsa-primary hover:text-white'}`}
                >
                    {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                </button>

                <Link href={`/product/${item.id}`}>
                    <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 hover:text-virsa-primary leading-tight">{item.name}</h3>
                </Link>

                <div className="flex items-center mb-4 mt-auto">
                    <div className="flex text-virsa-secondary">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(item.average_rating) ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1.5">{item.average_rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400 ml-2">({item.total_sold} sold)</span>
                </div>

                <div className="pt-3 border-t border-gray-100">
                    <span className="text-xl font-black text-gray-900">Rs {parseFloat(item.price).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}

export default function VendorProductsClient({ products, reviews, vendorName, vendorRating, totalReviews }: Props) {
    const [activeTab, setActiveTab] = useState("products");
    const [sortBy, setSortBy] = useState("popularity");

    const tabs = [
        { key: "products", label: `All Products (${products.length})` },
        { key: "reviews", label: `Reviews (${totalReviews.toLocaleString()})` },
    ];

    // Sort products
    const sortedProducts = [...products].sort((a, b) => {
        switch (sortBy) {
            case "price-low":
                return parseFloat(a.price) - parseFloat(b.price);
            case "price-high":
                return parseFloat(b.price) - parseFloat(a.price);
            case "newest":
                return 0; // Already sorted by created_at desc
            case "popularity":
            default:
                return b.total_sold - a.total_sold;
        }
    });

    return (
        <>
            {/* Tabs */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex gap-1 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`pb-4 px-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab.key ? 'text-virsa-primary border-virsa-primary' : 'text-gray-500 border-transparent hover:text-gray-900'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="container mx-auto px-4 py-8 max-w-6xl">

                {/* ── All Products ── */}
                {activeTab === "products" && (
                    <>
                        {products.length > 0 ? (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">All Products</h2>
                                    <select 
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-white border border-gray-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-virsa-primary/50 text-gray-700 font-medium shadow-sm cursor-pointer"
                                    >
                                        <option value="popularity">Sort by Popularity</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="newest">Newest Arrivals</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {sortedProducts.map((item) => (
                                        <ProductCard key={item.id} item={item} vendorName={vendorName} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShoppingCart className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Yet</h3>
                                <p className="text-gray-500">This vendor hasn't listed any products yet. Check back soon!</p>
                            </div>
                        )}
                    </>
                )}

                {/* ── Reviews ── */}
                {activeTab === "reviews" && (
                    <>
                        {reviews.length > 0 ? (
                            <div className="flex flex-col md:flex-row gap-8 mb-8">
                                {/* Summary */}
                                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center w-full md:w-64 flex-shrink-0">
                                    <span className="text-6xl font-black text-gray-900 mb-1">{vendorRating.toFixed(1)}</span>
                                    <div className="flex mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-5 h-5 ${i < Math.floor(vendorRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500">{totalReviews.toLocaleString()} total reviews</p>
                                </div>

                                {/* Reviews list */}
                                <div className="flex-1 space-y-4">
                                    {reviews.map((review) => {
                                        const reviewDate = new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                        return (
                                            <div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-virsa-primary/10 text-virsa-primary flex items-center justify-center font-bold text-sm">
                                                            {review.users.full_name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{review.users.full_name}</p>
                                                            <div className="flex mt-0.5">
                                                                {[...Array(5)].map((_, s) => (
                                                                    <Star key={s} className={`w-3.5 h-3.5 ${s < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-400">{reviewDate}</span>
                                                </div>
                                                {review.body && (
                                                    <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Star className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
                                <p className="text-gray-500">Be the first to review products from this vendor!</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
