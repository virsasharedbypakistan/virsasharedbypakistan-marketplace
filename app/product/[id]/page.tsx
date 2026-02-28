"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShieldCheck, Truck, RotateCcw, Heart, Minus, Plus, ShoppingCart, ShoppingBag, ChevronRight, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useRouter } from "next/navigation";

// Per-product image gallery mapping
const PRODUCT_IMAGES: Record<number, string[]> = {
    1: ["/product_headphones.png", "/product_keyboard.png", "/product_watch.png", "/cat_electronics.png"],
    2: ["/product_keyboard.png", "/product_headphones.png", "/cat_electronics.png", "/product_watch.png"],
    3: ["/product_watch.png", "/product_headphones.png", "/product_keyboard.png", "/cat_electronics.png"],
    4: ["/product_watch.png", "/product_keyboard.png", "/product_headphones.png", "/cat_electronics.png"],
    5: ["/cat_home.png", "/cat_beauty.png", "/product_backpack.png", "/cat_sports.png"],
    6: ["/product_headphones.png", "/product_watch.png", "/product_keyboard.png", "/cat_electronics.png"],
    7: ["/cat_electronics.png", "/product_keyboard.png", "/product_headphones.png", "/product_watch.png"],
    8: ["/cat_home.png", "/cat_beauty.png", "/cat_sports.png", "/product_backpack.png"],
    9: ["/product_keyboard.png", "/cat_electronics.png", "/product_headphones.png", "/product_watch.png"],
    10: ["/product_backpack.png", "/product_sneakers.png", "/cat_fashion.png", "/cat_sports.png"],
    11: ["/product_headphones.png", "/product_keyboard.png", "/product_watch.png", "/cat_electronics.png"],
    12: ["/cat_electronics.png", "/product_watch.png", "/product_headphones.png", "/product_keyboard.png"],
};
const DEFAULT_IMAGES = ["/product_headphones.png", "/product_keyboard.png", "/product_watch.png", "/cat_electronics.png"];

const PRODUCT = {
    id: 1,
    name: "Premium Wireless Noise-Cancelling Headphones Pro Edition",
    price: "Rs 19,999",
    priceNum: 19999,
    originalPrice: "Rs 24,999",
    vendor: "Tech Haven PK",
    rating: 4.8,
    reviews: 124,
    stock: 45,
    badge: "Sale 20%",
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const productId = parseInt(id) || 1;

    const { addItem } = useCart();
    const { toggle, isInWishlist } = useWishlist();
    const router = useRouter();

    const [qty, setQty] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [selectedColor, setSelectedColor] = useState("black");
    const [activeTab, setActiveTab] = useState("description");

    const images = PRODUCT_IMAGES[productId] ?? DEFAULT_IMAGES;
    const [selectedImage, setSelectedImage] = useState(images[0]);

    const wishlisted = isInWishlist(productId);

    const handleAddToCart = () => {
        addItem({ id: productId, name: PRODUCT.name, price: PRODUCT.price, priceNum: PRODUCT.priceNum, vendor: PRODUCT.vendor });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        addItem({ id: productId, name: PRODUCT.name, price: PRODUCT.price, priceNum: PRODUCT.priceNum, vendor: PRODUCT.vendor });
        router.push("/checkout");
    };

    const handleWishlistToggle = () => {
        toggle({ id: productId, name: PRODUCT.name, price: PRODUCT.price, priceNum: PRODUCT.priceNum, originalPrice: PRODUCT.originalPrice, vendor: PRODUCT.vendor, badge: PRODUCT.badge });
    };

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Breadcrumbs */}
            <div className="bg-gray-50/50 border-b border-gray-100">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
                        <Link href="/" className="hover:text-virsa-primary transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                        <Link href="/products" className="hover:text-virsa-primary transition-colors">Electronics</Link>
                        <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                        <span className="text-gray-900 font-medium truncate">{PRODUCT.name}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    {/* Product Gallery */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-4">
                        {/* Main image */}
                        <div className="aspect-square bg-gray-50 rounded-[32px] border border-gray-100 relative overflow-hidden group">
                            <Image
                                src={selectedImage}
                                alt={PRODUCT.name}
                                fill
                                priority
                                className="object-contain p-8 group-hover:scale-105 transition-transform duration-700 ease-out"
                            />

                            <div className="absolute top-6 left-6 z-20">
                                <span className="bg-virsa-danger text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wide">{PRODUCT.badge}</span>
                            </div>
                            <div className="absolute top-6 right-6 z-20">
                                <button
                                    onClick={handleWishlistToggle}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur text-gray-600 hover:text-red-500 hover:bg-white'}`}
                                    title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                >
                                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`aspect-square rounded-2xl border-2 overflow-hidden relative transition-all ${selectedImage === img ? 'border-virsa-primary ring-1 ring-virsa-primary/30' : 'border-gray-100 hover:border-gray-300'}`}
                                >
                                    <Image src={img} alt={`View ${idx + 1}`} fill className="object-contain p-2" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="w-full lg:w-1/2 flex flex-col">
                        <div className="mb-6">
                            <Link href={`/vendor/1`} className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <span className="text-sm font-bold text-virsa-primary">{PRODUCT.vendor}</span>
                            </Link>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-[1.2] mb-4">{PRODUCT.name}</h1>

                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center text-virsa-secondary">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`w-5 h-5 ${star <= 4 ? "fill-current" : "text-gray-300"}`} />
                                    ))}
                                </div>
                                <div className="text-sm font-bold text-gray-900">{PRODUCT.rating}</div>
                                <div className="text-sm text-gray-500 hover:text-virsa-primary cursor-pointer underline underline-offset-4" onClick={() => setActiveTab("reviews")}>({PRODUCT.reviews} reviews)</div>
                                <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">In Stock ({PRODUCT.stock})</div>
                            </div>

                            <div className="flex items-end gap-3 mb-8">
                                <span className="text-4xl font-black text-gray-900 tracking-tight">{PRODUCT.price}</span>
                                <span className="text-lg font-bold text-gray-400 line-through mb-1">{PRODUCT.originalPrice}</span>
                            </div>

                            <p className="text-gray-600 leading-relaxed mb-8 text-lg font-light">
                                Experience industry-leading noise cancellation, crystal-clear sound, and all-day comfort with our flagship wireless headphones.
                            </p>
                        </div>

                        <div className="h-px bg-gray-100 w-full mb-8" />

                        {/* Color Selection */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                                Color: <span className="text-gray-500 font-medium normal-case ml-1 capitalize">{selectedColor}</span>
                            </h3>
                            <div className="flex gap-3">
                                {[
                                    { key: "black", bg: "bg-gray-900" },
                                    { key: "white", bg: "bg-gray-100 border border-gray-200" },
                                    { key: "navy", bg: "bg-blue-900" },
                                ].map((color) => (
                                    <button
                                        key={color.key}
                                        onClick={() => setSelectedColor(color.key)}
                                        className={`w-12 h-12 rounded-full border-2 p-1 flex items-center justify-center transition-colors ${selectedColor === color.key ? 'border-gray-900' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <span className={`w-full h-full ${color.bg} rounded-full block`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <div className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-2xl p-2 w-full sm:w-40 h-14">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold text-gray-900">{qty}</span>
                                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className={`flex-1 h-14 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 transition-all w-full ${addedToCart ? 'bg-emerald-600 text-white' : 'bg-virsa-primary hover:bg-virsa-dark text-white'}`}
                            >
                                {addedToCart ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="h-14 px-8 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                            >
                                <ShoppingBag className="w-5 h-5 flex-shrink-0" /> Buy Now
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-gray-50 rounded-[20px] border border-gray-100">
                            {[
                                { icon: ShieldCheck, title: "1 Year Warranty", desc: "Full protection" },
                                { icon: Truck, title: "COD Available", desc: "Pay on delivery" },
                                { icon: RotateCcw, title: "7-Day Returns", desc: "Hassle-free process" },
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <badge.icon className="w-5 h-5 text-virsa-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">{badge.title}</h4>
                                        <p className="text-[10px] text-gray-500">{badge.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-20">
                    <div className="flex gap-8 border-b border-gray-200 px-4 overflow-x-auto">
                        {[
                            { key: "description", label: "Description" },
                            { key: "specs", label: "Specifications" },
                            { key: "reviews", label: `Reviews (${PRODUCT.reviews})` },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`pb-4 text-base font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab.key ? 'text-virsa-primary border-virsa-primary' : 'text-gray-500 border-transparent hover:text-gray-900'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="py-8 max-w-4xl text-gray-600 leading-relaxed text-lg font-light">
                        {activeTab === "description" && (
                            <>
                                <p className="mb-6">The Premium Wireless Noise-Cancelling Headphones Pro Edition represent the pinnacle of audio engineering. Designed for discerning audiophiles and frequent travelers alike, these headphones automatically adapt to your environment, tuning out distractions so you can focus purely on the music.</p>
                                <ul className="list-disc pl-6 space-y-3 font-medium text-gray-700 text-base">
                                    <li>Industry-leading active noise cancellation (ANC)</li>
                                    <li>Up to 30 hours of battery life with quick charging</li>
                                    <li>Touch sensor controls for music, calls, and voice assistant</li>
                                    <li>Speak-to-chat technology reduces volume during conversations</li>
                                </ul>
                            </>
                        )}
                        {activeTab === "specs" && (
                            <div className="space-y-3 text-base text-gray-700 font-medium">
                                {[["Driver Size", "40mm dynamic drivers"], ["Frequency Response", "4Hz – 40kHz"], ["Battery Life", "30 hours (ANC on)"], ["Charging", "USB-C, 10 min = 5 hours"], ["Weight", "254g"], ["Connectivity", "Bluetooth 5.2, NFC"], ["Noise Reduction", "Up to -30dB"]].map(([k, v]) => (
                                    <div key={k} className="flex border-b border-gray-100 pb-3">
                                        <span className="w-48 font-bold text-gray-900">{k}</span>
                                        <span className="text-gray-600">{v}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === "reviews" && (
                            <div className="space-y-6">
                                {[
                                    { name: "Ahmed K.", rating: 5, text: "Absolutely amazing sound quality. The ANC is unreal — background noise just disappears!", date: "Oct 20, 2023" },
                                    { name: "Sara M.", rating: 4, text: "Very comfortable even after long use. Battery lasts easily 2 days. Slightly expensive but worth it.", date: "Oct 15, 2023" },
                                ].map((review, i) => (
                                    <div key={i} className="border border-gray-100 rounded-2xl p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-gray-900">{review.name}</p>
                                                <div className="flex mt-1">
                                                    {[...Array(5)].map((_, s) => (
                                                        <Star key={s} className={`w-4 h-4 ${s < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">{review.date}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">{review.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
