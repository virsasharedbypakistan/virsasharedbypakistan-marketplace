"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, Tag, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function CartPage() {
    const { items, removeItem, updateQty, total, count, clearCart } = useCart();
    const [promoCode, setPromoCode] = useState("");
    const [promoApplied, setPromoApplied] = useState(false);

    const shipping = items.length > 0 ? 200 : 0;
    const discount = promoApplied ? total * 0.1 : 0;
    const grandTotal = total + shipping - discount;

    const handlePromo = () => {
        if (promoCode.toLowerCase() === "virsa10") setPromoApplied(true);
    };

    if (items.length === 0) {
        return (
            <div className="bg-gray-50/50 min-h-screen py-16">
                <div className="container mx-auto px-4 text-center">
                    <ShoppingCart className="w-20 h-20 mx-auto text-gray-200 mb-6" strokeWidth={1} />
                    <h1 className="text-3xl font-black text-gray-900 mb-3">Your cart is empty</h1>
                    <p className="text-gray-500 mb-8">Looks like you haven&apos;t added anything yet. Let&apos;s fix that!</p>
                    <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-virsa-primary text-white rounded-2xl font-bold hover:bg-virsa-dark transition-colors shadow-md">
                        Browse Products <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50/50 min-h-screen py-8 md:py-12">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Shopping Cart <span className="text-gray-400 font-medium text-xl ml-2">({count} items)</span>
                    </h1>
                    <button onClick={clearCart} className="text-sm text-red-500 font-bold hover:text-red-600 flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> Clear All
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Cart Items */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden hidden md:block mb-4">
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/50 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-6">Product</div>
                                <div className="col-span-2 text-center">Price</div>
                                <div className="col-span-2 text-center">Quantity</div>
                                <div className="col-span-2 text-right">Total</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                            {items.map((item) => (
                                <div key={item.id} className="p-6">
                                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Sold by:</span>
                                        <span className="text-sm font-bold text-virsa-primary">{item.vendor}</span>
                                    </div>

                                    <div className="flex flex-col md:grid md:grid-cols-12 gap-6 items-start md:items-center">
                                        <div className="md:col-span-6 flex gap-4 w-full">
                                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex-shrink-0 border border-gray-200 flex items-center justify-center text-gray-300">
                                                <ShoppingCart className="w-8 h-8" strokeWidth={1} />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <Link href={`/product/${item.id}`}>
                                                    <h3 className="font-bold text-gray-900 mb-1 hover:text-virsa-primary transition-colors line-clamp-2">{item.name}</h3>
                                                </Link>
                                                <p className="text-sm text-gray-500 mb-2">{item.price}</p>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1 w-fit group transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Remove
                                                </button>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 text-center hidden md:block">
                                            <span className="font-bold text-gray-900">Rs {item.priceNum.toLocaleString()}</span>
                                        </div>

                                        <div className="md:col-span-2 flex items-center justify-between w-full md:justify-center">
                                            <div className="md:hidden font-bold text-gray-900">Rs {item.priceNum.toLocaleString()}</div>
                                            <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl p-1 w-28">
                                                <button
                                                    onClick={() => updateQty(item.id, item.qty - 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="font-bold text-gray-900 flex-1 text-center text-sm">{item.qty}</span>
                                                <button
                                                    onClick={() => updateQty(item.id, item.qty + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 text-right hidden md:block">
                                            <span className="font-black text-gray-900 text-lg">Rs {(item.priceNum * item.qty).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <Link href="/products" className="text-virsa-primary font-bold hover:underline flex items-center gap-2">
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            {/* Promo Code */}
                            <div className="mb-6 relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder='Try "VIRSA10"'
                                    disabled={promoApplied}
                                    className="w-full pl-9 pr-20 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-virsa-primary disabled:opacity-60"
                                />
                                <button
                                    onClick={handlePromo}
                                    disabled={promoApplied}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-black transition-colors disabled:opacity-60"
                                >
                                    {promoApplied ? "Applied!" : "Apply"}
                                </button>
                            </div>
                            {promoApplied && (
                                <p className="text-xs font-bold text-emerald-600 -mt-4 mb-4">🎉 10% discount applied!</p>
                            )}

                            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-gray-100">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Subtotal ({count} items)</span>
                                    <span className="font-medium text-gray-900">Rs {total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Shipping (COD)</span>
                                    <span className="font-medium text-gray-900">Rs {shipping.toLocaleString()}</span>
                                </div>
                                {promoApplied && (
                                    <div className="flex justify-between items-center text-emerald-600">
                                        <span>Promo Discount (10%)</span>
                                        <span className="font-medium">- Rs {discount.toFixed(0)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="text-base font-bold text-gray-900">Total</span>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-gray-900 tracking-tight">Rs {Math.round(grandTotal).toLocaleString()}</span>
                                    <p className="text-xs text-gray-500 mt-1">Cash on Delivery</p>
                                </div>
                            </div>

                            <Link href="/checkout" className="w-full bg-virsa-primary hover:bg-virsa-dark text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 transition-all text-lg group">
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                            </Link>

                            <div className="mt-6 flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-emerald-800 leading-relaxed font-medium">Pay safely with Cash on Delivery. No card required — pay when your order arrives.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
