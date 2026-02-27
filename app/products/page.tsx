"use client";

import Link from "next/link";
import { Filter, Star, ShoppingCart, SlidersHorizontal, ChevronRight, X, Heart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useState } from "react";

const PRODUCTS = [
    { id: 1, name: "Premium Wireless Noise-Cancelling Headphones Pro", price: "Rs 19,999", priceNum: 19999, vendor: "Tech Haven PK", rating: 5, badge: null },
    { id: 2, name: "Minimalist Mechanical Keyboard RGB Backlit", price: "Rs 12,999", priceNum: 12999, vendor: "Electronics Pro", rating: 4, badge: "New" },
    { id: 3, name: "Portable Fast Charge Power Bank 20000mAh", price: "Rs 3,499", priceNum: 3499, vendor: "Tech Haven PK", rating: 5, badge: "Sale" },
    { id: 4, name: "Smart Watch Series 8 with Health Monitor", price: "Rs 34,999", priceNum: 34999, vendor: "Fashion Hub", rating: 4, badge: null },
    { id: 5, name: "Ergonomic Office Chair Lumbar Support", price: "Rs 28,500", priceNum: 28500, vendor: "Home Essentials", rating: 5, badge: "Hot" },
    { id: 6, name: "Noise-Isolating In-Ear Monitors IEM Pro", price: "Rs 8,999", priceNum: 8999, vendor: "Electronics Pro", rating: 4, badge: null },
    { id: 7, name: "Compact Mirrorless Camera 24MP 4K Video", price: "Rs 89,999", priceNum: 89999, vendor: "Tech Haven PK", rating: 5, badge: "New" },
    { id: 8, name: "Stainless Steel Water Bottle 1L Insulated", price: "Rs 1,899", priceNum: 1899, vendor: "Home Essentials", rating: 4, badge: null },
    { id: 9, name: "Gaming Mouse 16000 DPI RGB Wired", price: "Rs 4,500", priceNum: 4500, vendor: "Electronics Pro", rating: 5, badge: "Sale" },
    { id: 10, name: "Premium Leather Laptop Bag 15 inch", price: "Rs 6,999", priceNum: 6999, vendor: "Fashion Hub", rating: 4, badge: null },
    { id: 11, name: "Wireless Earbuds ANC Active Noise Cancelling", price: "Rs 9,999", priceNum: 9999, vendor: "Tech Haven PK", rating: 5, badge: null },
    { id: 12, name: "Smart Home Security Camera Indoor 1080p", price: "Rs 7,500", priceNum: 7500, vendor: "Electronics Pro", rating: 4, badge: "New" },
];

function ProductCard({ item }: { item: typeof PRODUCTS[0] }) {
    const { addItem } = useCart();
    const { toggle, isInWishlist } = useWishlist();
    const [added, setAdded] = useState(false);
    const wishlisted = isInWishlist(item.id);

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem({ id: item.id, name: item.name, price: item.price, priceNum: item.priceNum, vendor: item.vendor });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        toggle({ id: item.id, name: item.name, price: item.price, priceNum: item.priceNum, vendor: item.vendor, badge: item.badge });
    };

    return (
        <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
            <Link href={`/product/${item.id}`} className="relative aspect-square bg-gray-50 flex items-center justify-center p-6 overflow-hidden block">
                <div className="absolute inset-0 bg-virsa-light/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-24 h-24 bg-gray-200 rounded-full group-hover:scale-110 transition-transform duration-500 shadow-inner" />
                {item.badge && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-virsa-danger text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wide">{item.badge}</span>
                    </div>
                )}
                {/* Wishlist heart */}
                <button
                    onClick={handleWishlist}
                    className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all z-10 ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
                >
                    <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
            </Link>

            <div className="p-5 flex flex-col flex-1 relative">
                {/* Add to Cart floating button */}
                <button
                    onClick={handleAdd}
                    className={`absolute -top-6 right-5 w-12 h-12 rounded-full shadow-lg border border-gray-50 flex items-center justify-center transition-all duration-300 z-20 ${added ? 'bg-emerald-500 text-white' : 'bg-white text-gray-900 hover:bg-virsa-primary hover:text-white'}`}
                    title="Add to cart"
                >
                    {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                </button>

                <div className="text-[11px] font-bold tracking-wider text-virsa-primary mb-2 uppercase opacity-80">{item.vendor}</div>
                <Link href={`/product/${item.id}`}>
                    <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 hover:text-virsa-primary cursor-pointer leading-tight">{item.name}</h3>
                </Link>

                <div className="flex items-center mb-4 mt-auto">
                    <div className="flex text-virsa-secondary">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-3.5 h-3.5 ${star <= item.rating ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 ml-2">(124)</span>
                </div>

                <div className="flex items-baseline gap-2 pt-3 border-t border-gray-100">
                    <span className="text-xl font-black text-gray-900 tracking-tight">{item.price}</span>
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const categories = ["Electronics", "Fashion", "Home & Garden", "Beauty", "Sports", "Toys"];
    const brands = ["TechHaven", "StyleMates", "HomeLux", "FitPro", "GamerZ"];

    return (
        <div className="bg-gray-50/50 min-h-screen">
            {/* Breadcrumbs & Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-virsa-primary transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-gray-900 font-medium">All Products</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">All Products</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 font-medium">Showing <span className="text-gray-900 font-bold">1-24</span> of <span className="text-gray-900 font-bold">482</span> results</span>
                            <select className="bg-white border border-gray-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-virsa-primary/50 text-gray-700 font-medium shadow-sm cursor-pointer">
                                <option>Sort by Recommended</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Newest Arrivals</option>
                                <option>Highest Rated</option>
                            </select>
                            <button className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium">
                                <Filter className="w-4 h-4" /> Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-72 flex-shrink-0 hidden lg:block">
                        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 sticky top-24">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-virsa-primary" />
                                    Filters
                                </h2>
                                <button className="text-sm font-medium text-virsa-primary hover:text-virsa-primary/80">Clear All</button>
                            </div>

                            {/* Categories */}
                            <div className="mb-8">
                                <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                                <div className="space-y-3">
                                    {categories.map((cat, i) => (
                                        <label key={i} className="flex items-center group cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-virsa-primary focus:ring-virsa-primary custom-checkbox" />
                                            <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mb-8">
                                <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
                                <div className="space-y-4">
                                    <input type="range" min="0" max="1000" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-virsa-primary" />
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rs </span>
                                            <input type="number" placeholder="Min" className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-virsa-primary" />
                                        </div>
                                        <span className="text-gray-400">-</span>
                                        <div className="flex-1 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rs </span>
                                            <input type="number" placeholder="Max" className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-virsa-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Brands */}
                            <div className="mb-8">
                                <h3 className="font-bold text-gray-900 mb-4">Brands</h3>
                                <div className="space-y-3">
                                    {brands.map((brand, i) => (
                                        <label key={i} className="flex items-center group cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-virsa-primary focus:ring-virsa-primary custom-checkbox" />
                                            <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{brand}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Ratings */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4">Ratings</h3>
                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <label key={rating} className="flex items-center group cursor-pointer text-sm">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-virsa-primary focus:ring-virsa-primary custom-checkbox mr-3" />
                                            <div className="flex text-virsa-secondary">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-current" : "text-gray-300"}`} />
                                                ))}
                                            </div>
                                            <span className="ml-2 text-gray-600">&amp; up</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {/* Active Filters */}
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 flex items-center gap-2 shadow-sm">
                                Electronics <button className="hover:text-red-500"><X className="w-3 h-3" /></button>
                            </span>
                            <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 flex items-center gap-2 shadow-sm">
                                Rs 50 - Rs 250 <button className="hover:text-red-500"><X className="w-3 h-3" /></button>
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {PRODUCTS.map((item) => (
                                <ProductCard key={item.id} item={item} />
                            ))}
                        </div>

                        {/* Pagination Elements */}
                        <div className="flex justify-center mt-12 mb-8">
                            <div className="inline-flex gap-2">
                                <button className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-virsa-primary hover:text-virsa-primary transition-colors disabled:opacity-50" disabled>
                                    &lt;
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-virsa-primary border border-virsa-primary flex items-center justify-center text-white font-bold shadow-md">
                                    1
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 font-bold hover:border-virsa-primary hover:text-virsa-primary transition-colors">
                                    2
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 font-bold hover:border-virsa-primary hover:text-virsa-primary transition-colors">
                                    3
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-virsa-primary hover:text-virsa-primary transition-colors">
                                    &gt;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
