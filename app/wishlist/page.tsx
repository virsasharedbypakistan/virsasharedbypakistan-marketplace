"use client";

import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

export default function WishlistPage() {
    const { items, remove, clear } = useWishlist();
    const { addItem } = useCart();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <Heart className="w-20 h-20 mx-auto text-gray-200 mb-6" strokeWidth={1} />
                <h1 className="text-3xl font-black text-gray-900 mb-3">Your wishlist is empty</h1>
                <p className="text-gray-500 mb-8">Save items you love to come back to them later.</p>
                <Link href="/products" className="inline-block px-8 py-3 bg-virsa-primary text-white rounded-2xl font-bold hover:bg-virsa-dark transition-colors shadow-md">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Wishlist</h1>
                    <p className="text-gray-500 mt-1 text-sm">{items.length} saved items</p>
                </div>
                <button
                    onClick={clear}
                    className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-2 px-4 py-2 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100"
                >
                    <Trash2 className="w-4 h-4" /> Clear All
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col overflow-hidden">
                        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                            <ShoppingCart className="w-16 h-16 text-gray-200" strokeWidth={1} />
                            {item.badge && (
                                <span className="absolute top-3 left-3 bg-virsa-danger text-white text-[10px] font-bold px-2 py-1 rounded-lg">{item.badge}</span>
                            )}
                            <button
                                onClick={() => remove(item.id)}
                                className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                                title="Remove from wishlist"
                            >
                                <Heart className="w-4 h-4 fill-current" />
                            </button>
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                            <Link href={`/product/${item.id}`} className="text-sm font-bold text-gray-900 hover:text-virsa-primary transition-colors line-clamp-2 mb-1 flex-1">
                                {item.name}
                            </Link>
                            <p className="text-xs text-gray-500 mb-3">by {item.vendor}</p>

                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-lg font-black text-gray-900">{item.price}</span>
                                {item.originalPrice && (
                                    <span className="text-xs text-gray-400 line-through">{item.originalPrice}</span>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    addItem({ id: item.id, name: item.name, price: item.price, priceNum: item.priceNum, vendor: item.vendor });
                                    remove(item.id);
                                }}
                                className="w-full py-2.5 bg-virsa-primary text-white rounded-xl text-sm font-bold hover:bg-virsa-dark transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-4 h-4" /> Move to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
