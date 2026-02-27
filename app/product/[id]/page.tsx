"use client";

import { use } from "react";
import Link from "next/link";
import { Star, ShieldCheck, Truck, RotateCcw, Heart, Share2, Minus, Plus, ShoppingCart, ShoppingBag, ChevronRight } from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unwrappedParams = use(params);

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Breadcrumbs */}
            <div className="bg-gray-50/50 border-b border-gray-100">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center text-sm text-gray-500 overflow-x-auto whitespace-nowrap hide-scrollbar">
                        <Link href="/" className="hover:text-virsa-primary transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                        <Link href="/products" className="hover:text-virsa-primary transition-colors">Electronics</Link>
                        <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                        <Link href="/products?category=audio" className="hover:text-virsa-primary transition-colors">Audio</Link>
                        <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                        <span className="text-gray-900 font-medium truncate">Premium Wireless Noise-Cancelling Headphones Pro</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    {/* Product Gallery */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-4">
                        <div className="aspect-square bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-center p-8 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-virsa-light/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            {/* Decorative background blur */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl opacity-50 mix-blend-overlay"></div>

                            {/* Main Image Placeholder */}
                            <div className="w-full h-full bg-gray-200 rounded-2xl relative z-10 shadow-inner group-hover:scale-105 transition-transform duration-700 ease-out"></div>

                            <div className="absolute top-6 left-6 z-20">
                                <span className="bg-virsa-danger text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wide">Sale 20%</span>
                            </div>
                            <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                                <button className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white shadow-sm transition-all">
                                    <Heart className="w-5 h-5" />
                                </button>
                                <button className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:text-virsa-primary hover:bg-white shadow-sm transition-all">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((thumb) => (
                                <div key={thumb} className={`aspect-square rounded-2xl border-2 flex items-center justify-center cursor-pointer overflow-hidden transition-all ${thumb === 1 ? 'border-virsa-primary bg-virsa-light/10' : 'border-gray-100 bg-gray-50 hover:border-gray-300'}`}>
                                    {/* Thumbnail Placeholder */}
                                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="w-full lg:w-1/2 flex flex-col">
                        <div className="mb-6">
                            <Link href="/vendor/1" className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                                <div className="w-6 h-6 bg-virsa-primary/10 rounded-full flex items-center justify-center">
                                    <span className="w-3 h-3 border-2 border-virsa-primary rounded-sm border-t-0 border-r-0 -rotate-45 block transform -translate-y-0.5"></span>
                                </div>
                                <span className="text-sm font-bold text-gray-700 group-hover:text-virsa-primary transition-colors">Tech Haven Official</span>
                            </Link>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-[1.2] mb-4">
                                Premium Wireless Noise-Cancelling Headphones Pro Edition
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center text-virsa-secondary">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`w-5 h-5 ${star === 5 ? "text-gray-300" : "fill-current"}`} />
                                    ))}
                                </div>
                                <div className="text-sm font-bold text-gray-900">4.8</div>
                                <div className="text-sm text-gray-500 hover:text-virsa-primary cursor-pointer underline underline-offset-4">(124 verified reviews)</div>
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">In Stock (45)</div>
                            </div>

                            <div className="flex items-end gap-3 mb-8">
                                <span className="text-4xl font-black text-gray-900 tracking-tight">Rs 199.99</span>
                                <span className="text-lg font-bold text-gray-400 line-through mb-1">Rs 249.99</span>
                                <span className="text-sm font-bold text-virsa-danger bg-virsa-danger/10 px-2 py-1 rounded-md mb-1 ml-2">Save Rs 50.00</span>
                            </div>

                            <p className="text-gray-600 leading-relaxed mb-8 text-lg font-light">
                                Experience industry-leading noise cancellation, crystal-clear sound, and all-day comfort with our flagship wireless headphones. Perfect for travel, work, or pure musical enjoyment.
                            </p>
                        </div>

                        <div className="h-px bg-gray-100 w-full mb-8"></div>

                        {/* Variations */}
                        <div className="space-y-6 mb-8">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Color: <span className="text-gray-500 font-medium normal-case ml-1">Matte Black</span></h3>
                                </div>
                                <div className="flex gap-3">
                                    <button className="w-12 h-12 rounded-full border-2 border-gray-900 p-1 flex items-center justify-center">
                                        <span className="w-full h-full bg-gray-900 rounded-full block"></span>
                                    </button>
                                    <button className="w-12 h-12 rounded-full border-2 border-transparent hover:border-gray-200 p-1 flex items-center justify-center transition-colors">
                                        <span className="w-full h-full bg-gray-100 border border-gray-200 rounded-full block"></span>
                                    </button>
                                    <button className="w-12 h-12 rounded-full border-2 border-transparent hover:border-gray-200 p-1 flex items-center justify-center transition-colors">
                                        <span className="w-full h-full bg-blue-900 rounded-full block"></span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <div className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-2xl p-2 w-full sm:w-40 h-14">
                                <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold text-gray-900">1</span>
                                <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <button className="flex-1 h-14 bg-virsa-primary hover:bg-virsa-primary/90 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(71,112,76,0.2)] hover:-translate-y-0.5 transition-all w-full">
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </button>
                            <button className="h-14 px-8 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                                <ShoppingBag className="w-5 h-5 flex-shrink-0" />
                                Buy Now
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-gray-50 rounded-[20px] border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <ShieldCheck className="w-5 h-5 text-virsa-primary" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900">1 Year Warranty</h4>
                                    <p className="text-[10px] text-gray-500">Full protection</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Truck className="w-5 h-5 text-virsa-primary" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900">Free Shipping</h4>
                                    <p className="text-[10px] text-gray-500">On orders over Rs 50</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <RotateCcw className="w-5 h-5 text-virsa-primary" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900">30-Day Returns</h4>
                                    <p className="text-[10px] text-gray-500">Hassle-free process</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs (Simplified UI for now) */}
                <div className="mt-20">
                    <div className="flex gap-8 border-b border-gray-200 px-4 overflow-x-auto hide-scrollbar">
                        <button className="pb-4 text-base font-bold text-virsa-primary border-b-2 border-virsa-primary whitespace-nowrap">Product Description</button>
                        <button className="pb-4 text-base font-bold text-gray-500 hover:text-gray-900 whitespace-nowrap transition-colors">Specifications</button>
                        <button className="pb-4 text-base font-bold text-gray-500 hover:text-gray-900 whitespace-nowrap transition-colors">Vendor Info</button>
                        <button className="pb-4 text-base font-bold text-gray-500 hover:text-gray-900 whitespace-nowrap transition-colors flex items-center gap-2">Reviews <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">124</span></button>
                    </div>
                    <div className="py-8 max-w-4xl text-gray-600 leading-relaxed text-lg font-light">
                        <p className="mb-6">
                            The Premium Wireless Noise-Cancelling Headphones Pro Edition represent the pinnacle of audio engineering. Designed for discerning audiophiles and frequent travelers alike, these headphones automatically adapt to your environment, tuning out distractions so you can focus purely on the music or the silence.
                        </p>
                        <ul className="list-disc pl-6 space-y-3 mb-6 font-medium text-gray-700 text-base">
                            <li>Industry-leading active noise cancellation (ANC) with Dual Noise Sensor technology</li>
                            <li>Up to 30 hours of battery life with quick charging (10 min charge for 5 hours of playback)</li>
                            <li>Touch sensor controls to pause/play/skip tracks, control volume, activate your voice assistant, and answer phone calls</li>
                            <li>Speak-to-chat technology automatically reduces volume during conversations</li>
                            <li>Superior call quality with precise voice pickup</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
