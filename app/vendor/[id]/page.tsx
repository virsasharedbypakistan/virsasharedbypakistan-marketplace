"use client";

import { use } from "react";
import Link from "next/link";
import { Star, MapPin, Calendar, ShieldCheck, Mail, MessageSquare, ShoppingCart } from "lucide-react";

export default function VendorPublicPage({ params }: { params: Promise<{ id: string }> }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unwrappedParams = use(params);

    return (
        <div className="bg-gray-50/50 min-h-screen pb-20">
            {/* Vendor Cover Photo & Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="h-48 md:h-64 lg:h-80 w-full bg-gradient-to-r from-virsa-primary to-[#2a452d] relative overflow-hidden">
                    {/* Abstract background shapes */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform origin-bottom border-l border-white/10"></div>
                    <div className="absolute bottom-0 left-10 w-64 h-64 bg-virsa-secondary/20 rounded-full blur-3xl mix-blend-overlay"></div>
                </div>

                <div className="container mx-auto px-4 max-w-6xl relative">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 -mt-16 sm:-mt-20 lg:-mt-24 mb-6 md:mb-10 relative z-10">
                        {/* Vendor Logo */}
                        <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-white rounded-3xl p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 flex-shrink-0">
                            <div className="w-full h-full bg-gray-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                <span className="w-12 h-12 border-4 border-gray-300 rounded-sm border-t-0 border-r-0 -rotate-45 block transform -translate-y-1"></span>
                            </div>
                        </div>

                        {/* Vendor Info Desktop */}
                        <div className="flex-1 flex flex-col justify-end pt-2 md:pt-0">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full h-full pb-2">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Tech Haven Official</h1>
                                        <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm border border-emerald-100">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                                        </div>
                                    </div>
                                    <p className="text-gray-500 mb-4 max-w-xl">Premium electronics, accessories, and smart home devices. Authorized seller for top international brands.</p>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-gray-600">
                                        <div className="flex items-center gap-1.5 hover:text-virsa-primary cursor-pointer group">
                                            <div className="flex text-virsa-secondary">
                                                <Star className="w-4 h-4 fill-current" />
                                            </div>
                                            <span className="text-gray-900 font-bold group-hover:underline">4.9 Rating</span>
                                            <span className="text-gray-400 font-normal">(1.2k reviews)</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-gray-400" /> San Francisco, CA
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-gray-400" /> Joined Oct 2021
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-4 md:mt-0">
                                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors shadow-sm">
                                        <MessageSquare className="w-4 h-4" /> Message
                                    </button>
                                    <button className="flex items-center gap-2 px-5 py-2.5 bg-virsa-primary hover:bg-virsa-primary/90 text-white font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(71,112,76,0.2)] hover:-translate-y-0.5">
                                        <Mail className="w-4 h-4" /> Follow Store
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex gap-8 overflow-x-auto hide-scrollbar">
                        <button className="pb-4 text-sm font-bold text-virsa-primary border-b-2 border-virsa-primary whitespace-nowrap">All Products (245)</button>
                        <button className="pb-4 text-sm font-bold text-gray-500 hover:text-gray-900 whitespace-nowrap transition-colors">Categories</button>
                        <button className="pb-4 text-sm font-bold text-gray-500 hover:text-gray-900 whitespace-nowrap transition-colors">Reviews</button>
                        <button className="pb-4 text-sm font-bold text-gray-500 hover:text-gray-900 whitespace-nowrap transition-colors">Store Policies</button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
                    <select className="bg-white border border-gray-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-virsa-primary/50 text-gray-700 font-medium shadow-sm cursor-pointer">
                        <option>Sort by Popularity</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Newest Arrivals</option>
                    </select>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                        <div key={item} className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
                            <Link href={`/product/${item}`} className="relative aspect-square bg-gray-50 flex items-center justify-center p-6 overflow-hidden block">
                                <div className="absolute inset-0 bg-virsa-light/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-24 h-24 bg-gray-200 rounded-full group-hover:scale-110 transition-transform duration-500 shadow-inner"></div>
                            </Link>

                            <div className="p-5 flex flex-col flex-1 relative">
                                <button className="absolute -top-6 right-5 w-12 h-12 bg-white rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.12)] border border-gray-50 flex items-center justify-center text-gray-900 hover:bg-virsa-primary hover:text-white transition-all duration-300 z-20 group/btn">
                                    <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                </button>

                                <Link href={`/product/${item}`}>
                                    <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 hover:text-virsa-primary cursor-pointer leading-tight group-hover:underline">
                                        High Performance Tech Gadget Pro {item}
                                    </h3>
                                </Link>

                                <div className="flex items-center mb-4 mt-auto">
                                    <div className="flex text-virsa-secondary">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-900 ml-1.5">4.9</span>
                                    <span className="text-xs text-gray-400 ml-1">(42)</span>
                                </div>

                                <div className="flex items-baseline gap-2 pt-3 border-t border-gray-100">
                                    <span className="text-xl font-black text-gray-900 tracking-tight">${item * 29}.99</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
