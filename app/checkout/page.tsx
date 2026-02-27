import Link from "next/link";
import { Check, CreditCard, ShieldCheck, MapPin, Truck } from "lucide-react";

export default function CheckoutPage() {
    return (
        <div className="bg-gray-50/50 min-h-screen py-8 md:py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-8">
                    <Link href="/cart" className="text-sm font-bold text-gray-500 hover:text-virsa-primary transition-colors flex items-center gap-2 w-fit mb-4">
                        &larr; Back to Cart
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Main Checkout Flow */}
                    <div className="w-full lg:w-2/3 space-y-6">

                        {/* Step 1: Shipping Address */}
                        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-8 h-8 rounded-full bg-virsa-primary text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">1</div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    Shipping Address
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                                    <input type="text" defaultValue="Alex Doe" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm mb-4" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                                    <input type="email" defaultValue="alex@example.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm mb-4" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                                    <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm mb-4" />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Street Address</label>
                                    <input type="text" defaultValue="123 Innovation Way" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm mb-4" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">City</label>
                                    <input type="text" defaultValue="San Francisco" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm mb-4" />
                                </div>
                                <div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">State</label>
                                            <input type="text" defaultValue="CA" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm mb-4" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">ZIP Code</label>
                                            <input type="text" defaultValue="94103" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm mb-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-1 md:col-span-2 pt-2">
                                    <button className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-md">
                                        Save & Continue Delivery
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Delivery Options */}
                        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8 opacity-60 pointer-events-none">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-gray-400" />
                                    Delivery Options
                                </h2>
                            </div>
                        </div>

                        {/* Step 3: Payment */}
                        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8 opacity-60 pointer-events-none">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-gray-400" />
                                    Payment Details
                                </h2>
                            </div>
                        </div>

                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Information</h2>

                            {/* Items List */}
                            <div className="space-y-4 mb-6">
                                {[1, 2].map((item) => (
                                    <div key={item} className="flex gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 border border-gray-200 relative">
                                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ring-2 ring-white">
                                                {item === 1 ? "1" : "2"}
                                            </span>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="font-bold text-gray-900 text-sm line-clamp-2">
                                                {item === 1 ? "Premium Wireless Noise-Cancelling Headphones Pro" : "Minimalist Mechanical Keyboard RGB"}
                                            </h3>
                                            <span className="font-bold text-gray-900 text-sm mt-1">Rs {item === 1 ? "199.99" : "129.99"}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 text-sm mb-6 pt-6 border-t border-gray-100">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">Rs 459.97</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-medium text-gray-900">Rs 12.50</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Taxes</span>
                                    <span className="font-medium text-gray-900">Rs 36.80</span>
                                </div>
                            </div>

                            <div className="flex flex-col mb-8 pt-6 border-t border-gray-100">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-base font-bold text-gray-900">Total</span>
                                    <span className="text-3xl font-black text-gray-900 tracking-tight">Rs 509.27</span>
                                </div>
                            </div>

                            <button className="w-full bg-virsa-primary hover:bg-virsa-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(71,112,76,0.2)] hover:-translate-y-0.5 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                <Check className="w-5 h-5 flex-shrink-0" />
                                Place Order
                            </button>

                            <div className="mt-6 flex flex-col items-center gap-3">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                    <ShieldCheck className="w-4 h-4" /> SECURE ENCRYPTED CHECKOUT
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
