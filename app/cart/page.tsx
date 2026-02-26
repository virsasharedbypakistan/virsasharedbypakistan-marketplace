import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, Tag } from "lucide-react";

export default function CartPage() {
    return (
        <div className="bg-gray-50/50 min-h-screen py-8 md:py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Shopping Cart</h1>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Cart Items List */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden hidden md:block mb-4">
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/50 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-6">Product</div>
                                <div className="col-span-2 text-center">Price</div>
                                <div className="col-span-2 text-center">Quantity</div>
                                <div className="col-span-2 text-right">Total</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden divide-y divide-gray-100">
                            {[1, 2].map((item) => (
                                <div key={item} className="p-6">
                                    {/* Vendor Header */}
                                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-50">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sold by:</span>
                                        <Link href={`/vendor/${item}`} className="text-sm font-bold text-virsa-primary hover:underline">
                                            {item === 1 ? "Tech Haven Official" : "Audio Dynamics"}
                                        </Link>
                                    </div>

                                    <div className="flex flex-col md:grid md:grid-cols-12 gap-6 items-start md:items-center">
                                        {/* Product Info */}
                                        <div className="md:col-span-6 flex gap-4 w-full">
                                            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex-shrink-0 border border-gray-200"></div>
                                            <div className="flex flex-col justify-center">
                                                <Link href={`/product/${item}`}>
                                                    <h3 className="font-bold text-gray-900 mb-1 hover:text-virsa-primary transition-colors line-clamp-2">
                                                        {item === 1 ? "Premium Wireless Noise-Cancelling Headphones Pro" : "Minimalist Mechanical Keyboard RGB"}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm text-gray-500 mb-2">Color: {item === 1 ? "Matte Black" : "Cloud White"}</p>
                                                <button className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1 w-fit group transition-colors">
                                                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Remove
                                                </button>
                                            </div>
                                        </div>

                                        {/* Price (Desktop) */}
                                        <div className="md:col-span-2 text-center hidden md:block">
                                            <span className="font-bold text-gray-900">${item === 1 ? "199.99" : "129.99"}</span>
                                        </div>

                                        {/* Quantity & Mobile Price */}
                                        <div className="md:col-span-2 flex items-center justify-between w-full md:justify-center">
                                            <div className="md:hidden font-bold text-gray-900">${item === 1 ? "199.99" : "129.99"}</div>
                                            <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl p-1 w-28">
                                                <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200">
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="font-bold text-gray-900 flex-1 text-center text-sm">{item === 1 ? "1" : "2"}</span>
                                                <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Total (Desktop) */}
                                        <div className="md:col-span-2 text-right hidden md:block">
                                            <span className="font-black text-gray-900 text-lg">${item === 1 ? "199.99" : "259.98"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <Link href="/products" className="text-virsa-primary font-bold hover:underline flex items-center gap-2">
                                &larr; Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            {/* Promo Code */}
                            <div className="mb-6 relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Enter promo code"
                                    className="w-full pl-9 pr-20 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-virsa-primary"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-black transition-colors">
                                    Apply
                                </button>
                            </div>

                            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-gray-100">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Subtotal (3 items)</span>
                                    <span className="font-medium text-gray-900">$459.97</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Shipping Estimate</span>
                                    <span className="font-medium text-gray-900">$12.50</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Tax Estimate</span>
                                    <span className="font-medium text-gray-900">$36.80</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="text-base font-bold text-gray-900">Total</span>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-gray-900 tracking-tight">$509.27</span>
                                    <p className="text-xs text-gray-500 mt-1">Includes all taxes</p>
                                </div>
                            </div>

                            <Link href="/checkout" className="w-full bg-virsa-primary hover:bg-virsa-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(71,112,76,0.2)] hover:-translate-y-0.5 transition-all text-lg group">
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                            </Link>

                            <div className="mt-6 flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-emerald-800 leading-relaxed font-medium">Safe and secure checkout. Your personal and payment information is encrypted and protected.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
