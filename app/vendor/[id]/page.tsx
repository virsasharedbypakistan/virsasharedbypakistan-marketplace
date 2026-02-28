"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Calendar, ShieldCheck, Package, ShoppingCart, Heart, Check, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

const PRODUCT_IMAGES: Record<number, string> = {
    1: "/product_headphones.png",
    2: "/product_keyboard.png",
    3: "/product_watch.png",
    4: "/product_watch.png",
    5: "/product_headphones.png",
    6: "/product_keyboard.png",
    7: "/cat_electronics.png",
    8: "/product_keyboard.png",
};

const VENDOR_LOGOS: Record<string, string> = {
    "1": "/vendor_logo_1.png",
    "2": "/vendor_logo_2.png",
    "3": "/vendor_logo_1.png",
    "4": "/vendor_logo_2.png",
};

const VENDOR_BANNERS: Record<string, string> = {
    "1": "/hero_banner.png",
    "2": "/cat_fashion.png",
    "3": "/cat_electronics.png",
    "4": "/cat_home.png",
};

const VENDOR_DATA = [
    { id: "1", name: "Tech Haven PK", tagline: "Premium electronics, accessories & smart home devices. Authorized seller for top brands.", city: "Lahore", rating: 4.9, reviews: 1240, products: 320, joined: "Oct 2021", category: "Electronics" },
    { id: "2", name: "Fashion Hub", tagline: "Latest trends from local & international fashion brands in Pakistan.", city: "Karachi", rating: 4.6, reviews: 892, products: 580, joined: "Jan 2022", category: "Fashion" },
    { id: "3", name: "Electronics Pro", tagline: "Professional electronics for every need — from home to office.", city: "Islamabad", rating: 4.7, reviews: 654, products: 210, joined: "Mar 2022", category: "Electronics" },
    { id: "4", name: "Home Essentials", tagline: "Everything you need to make your home a haven.", city: "Lahore", rating: 4.5, reviews: 421, products: 450, joined: "Jun 2022", category: "Home & Kitchen" },
];

const STORE_PRODUCTS = [
    { id: 1, name: "Premium Wireless Headphones Pro", price: "Rs 19,999", priceNum: 19999, vendor: "Tech Haven PK", rating: 4.9, badge: "Best Seller" },
    { id: 2, name: "Mechanical Keyboard RGB Backlit", price: "Rs 12,999", priceNum: 12999, vendor: "Tech Haven PK", rating: 4.7, badge: null },
    { id: 3, name: "Portable Fast-Charge Power Bank", price: "Rs 3,499", priceNum: 3499, vendor: "Tech Haven PK", rating: 4.8, badge: "Sale" },
    { id: 4, name: "Smart Watch Series 8 GPS", price: "Rs 34,999", priceNum: 34999, vendor: "Tech Haven PK", rating: 4.6, badge: null },
    { id: 5, name: "Wireless Earbuds ANC", price: "Rs 9,999", priceNum: 9999, vendor: "Tech Haven PK", rating: 4.9, badge: "New" },
    { id: 6, name: "USB-C 4-Port Hub Compact", price: "Rs 2,499", priceNum: 2499, vendor: "Tech Haven PK", rating: 4.5, badge: null },
    { id: 7, name: "Compact Mirrorless Camera 24MP", price: "Rs 89,999", priceNum: 89999, vendor: "Tech Haven PK", rating: 4.9, badge: "Top Pick" },
    { id: 8, name: "Gaming Mouse 16000 DPI RGB", price: "Rs 4,500", priceNum: 4500, vendor: "Tech Haven PK", rating: 4.7, badge: null },
];

const CATEGORIES = [
    { name: "Audio & Headphones", count: 48, icon: "🎧" },
    { name: "Smart Watches", count: 32, icon: "⌚" },
    { name: "Cameras", count: 29, icon: "📷" },
    { name: "Accessories", count: 110, icon: "🔌" },
    { name: "Gaming", count: 55, icon: "🎮" },
    { name: "Power & Charging", count: 46, icon: "🔋" },
];

const REVIEWS = [
    { name: "Ahmed K.", rating: 5, date: "Feb 2025", text: "Excellent service and fast delivery. Product quality is top-notch. Highly recommend Tech Haven!" },
    { name: "Sana M.", rating: 5, date: "Jan 2025", text: "Got my headphones in 2 days. Completely authentic product with original warranty. Will buy again." },
    { name: "Usman T.", rating: 4, date: "Jan 2025", text: "Good variety of products. Packaging was secure and the item matches the description perfectly." },
    { name: "Aisha B.", rating: 5, date: "Dec 2024", text: "Best electronics store on the platform. Prices are competitive and customer support is very helpful." },
];

const POLICIES = [
    { title: "Return Policy", icon: "↩️", text: "We accept returns within 7 days of delivery. Item must be in original condition with packaging intact. COD orders returned to our warehouse — refund processed within 3-5 working days." },
    { title: "Delivery Policy", icon: "🚚", text: "We deliver all across Pakistan. Standard delivery takes 2-4 working days. Express delivery (1-2 days) available in Lahore, Karachi, and Islamabad." },
    { title: "Warranty", icon: "🛡️", text: "All electronics come with manufacturer's warranty. Duration varies by product (3 months – 2 years). Our team will assist with warranty claims." },
    { title: "Cash on Delivery", icon: "💵", text: "COD is available for all our products. Payment is collected at your doorstep when you receive your order." },
];

function ProductCard({ item, vendorName }: { item: typeof STORE_PRODUCTS[0]; vendorName: string }) {
    const { addItem } = useCart();
    const { toggle, isInWishlist } = useWishlist();
    const [added, setAdded] = useState(false);
    const wishlisted = isInWishlist(item.id);

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem({ id: item.id, name: item.name, price: item.price, priceNum: item.priceNum, vendor: vendorName });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        toggle({ id: item.id, name: item.name, price: item.price, priceNum: item.priceNum, vendor: vendorName, badge: item.badge });
    };

    return (
        <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
            <Link href={`/product/${item.id}`} className="relative aspect-square bg-gray-50 overflow-hidden block">
                <Image
                    src={PRODUCT_IMAGES[item.id] ?? "/product_headphones.png"}
                    alt={item.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
                {item.badge && (
                    <span className="absolute top-4 left-4 bg-virsa-danger text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10">{item.badge}</span>
                )}
                <button onClick={handleWishlist} className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all z-10 ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}>
                    <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
            </Link>

            <div className="p-5 flex flex-col flex-1 relative">
                <button
                    onClick={handleAdd}
                    className={`absolute -top-6 right-5 w-12 h-12 rounded-full shadow-lg border border-gray-50 flex items-center justify-center transition-all duration-300 z-20 ${added ? 'bg-emerald-500 text-white' : 'bg-white text-gray-900 hover:bg-virsa-primary hover:text-white'}`}
                >
                    {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                </button>

                <Link href={`/product/${item.id}`}>
                    <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 hover:text-virsa-primary leading-tight">{item.name}</h3>
                </Link>

                <div className="flex items-center mb-4 mt-auto">
                    <div className="flex text-virsa-secondary">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(item.rating) ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1.5">{item.rating}</span>
                </div>

                <div className="pt-3 border-t border-gray-100">
                    <span className="text-xl font-black text-gray-900">{item.price}</span>
                </div>
            </div>
        </div>
    );
}

export default function VendorPublicPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [activeTab, setActiveTab] = useState("products");

    const vendor = VENDOR_DATA.find((v) => v.id === id) ?? VENDOR_DATA[0];

    const tabs = [
        { key: "products", label: `All Products (${vendor.products})` },
        { key: "categories", label: "Categories" },
        { key: "reviews", label: `Reviews (${vendor.reviews.toLocaleString()})` },
        { key: "policies", label: "Store Policies" },
    ];

    return (
        <div className="bg-gray-50/50 min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100 px-4 py-3">
                <div className="container mx-auto max-w-6xl flex items-center text-sm text-gray-500">
                    <Link href="/" className="hover:text-virsa-primary transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <Link href="/vendors" className="hover:text-virsa-primary transition-colors">Stores</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <span className="text-gray-900 font-medium">{vendor.name}</span>
                </div>
            </div>

            {/* Cover & Header */}
            <div className="bg-white border-b border-gray-100">
                {/* Banner with real image */}
                <div className="h-48 md:h-64 w-full relative overflow-hidden">
                    <Image
                        src={VENDOR_BANNERS[id] ?? "/hero_banner.png"}
                        alt={`${vendor.name} banner`}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-virsa-primary/80 via-virsa-primary/50 to-transparent" />
                </div>

                <div className="container mx-auto px-4 max-w-6xl relative">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 -mt-16 mb-6 relative z-10">
                        {/* Real vendor logo */}
                        <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-3xl p-2 shadow-xl border border-gray-100 flex-shrink-0 overflow-hidden relative">
                            <Image
                                src={VENDOR_LOGOS[id] ?? "/vendor_logo_1.png"}
                                alt={vendor.name}
                                fill
                                className="object-cover rounded-2xl"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col justify-end py-2">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-extrabold text-gray-900">{vendor.name}</h1>
                                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-100">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                                        </span>
                                    </div>
                                    <p className="text-gray-500 mb-3 max-w-xl text-sm">{vendor.tagline}</p>
                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
                                        <span className="flex items-center gap-1 font-bold text-amber-500">
                                            <Star className="w-4 h-4 fill-current" /> {vendor.rating}
                                            <span className="text-gray-400 font-normal">({vendor.reviews.toLocaleString()} reviews)</span>
                                        </span>
                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" /> {vendor.city}</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" /> Joined {vendor.joined}</span>
                                        <span className="flex items-center gap-1"><Package className="w-4 h-4 text-gray-400" /> {vendor.products} Products</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
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
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">All Products</h2>
                            <select className="bg-white border border-gray-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-virsa-primary/50 text-gray-700 font-medium shadow-sm cursor-pointer">
                                <option>Sort by Popularity</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Newest Arrivals</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {STORE_PRODUCTS.map((item) => (
                                <ProductCard key={item.id} item={item} vendorName={vendor.name} />
                            ))}
                        </div>
                    </>
                )}

                {/* ── Categories ── */}
                {activeTab === "categories" && (
                    <>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by Category</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setActiveTab("products")}
                                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left flex items-center gap-5 group"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-virsa-light/30 flex items-center justify-center text-3xl flex-shrink-0">
                                        {cat.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-virsa-primary transition-colors">{cat.name}</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">{cat.count} products</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* ── Reviews ── */}
                {activeTab === "reviews" && (
                    <>
                        <div className="flex flex-col md:flex-row gap-8 mb-8">
                            {/* Summary */}
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center w-full md:w-64 flex-shrink-0">
                                <span className="text-6xl font-black text-gray-900 mb-1">{vendor.rating}</span>
                                <div className="flex mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(vendor.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500">{vendor.reviews.toLocaleString()} total reviews</p>
                                <div className="w-full mt-4 pt-4 border-t border-gray-100 space-y-2">
                                    {[5, 4, 3, 2, 1].map((star) => {
                                        const pcts: Record<number, number> = { 5: 78, 4: 14, 3: 5, 2: 2, 1: 1 };
                                        return (
                                            <div key={star} className="flex items-center gap-2 text-xs">
                                                <span className="w-4 text-gray-500 font-medium">{star}</span>
                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pcts[star]}%` }} />
                                                </div>
                                                <span className="w-8 text-gray-400 text-right">{pcts[star]}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Reviews list */}
                            <div className="flex-1 space-y-4">
                                {REVIEWS.map((review, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-virsa-primary/10 text-virsa-primary flex items-center justify-center font-bold text-sm">
                                                    {review.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{review.name}</p>
                                                    <div className="flex mt-0.5">
                                                        {[...Array(5)].map((_, s) => (
                                                            <Star key={s} className={`w-3.5 h-3.5 ${s < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">{review.date}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ── Store Policies ── */}
                {activeTab === "policies" && (
                    <>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Store Policies</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {POLICIES.map((policy) => (
                                <div key={policy.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">{policy.icon}</span>
                                        <h3 className="font-bold text-gray-900">{policy.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{policy.text}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
