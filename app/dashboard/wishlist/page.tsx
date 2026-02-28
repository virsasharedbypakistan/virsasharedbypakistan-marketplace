"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Trash2, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type WishlistItem = {
    id: number;
    name: string;
    price: number;
    originalPrice: number | null;
    rating: number;
    reviews: number;
    inStock: boolean;
    image: string;
    discount: number | null;
};

export default function CustomerWishlistPage() {
    const [items, setItems] = useState<WishlistItem[]>([
        {
            id: 1,
            name: "Heritage Embroidered Shawl",
            price: 199.99,
            originalPrice: 249.99,
            rating: 4.8,
            reviews: 1240,
            inStock: true,
            image: "/images/products/product1.jpg",
            discount: 20
        },
        {
            id: 2,
            name: "Hand-Painted Pottery Set",
            price: 299.99,
            originalPrice: null,
            rating: 4.9,
            reviews: 890,
            inStock: false,
            image: "/images/products/product2.jpg",
            discount: null
        },
        {
            id: 3,
            name: "Traditional Ajrak Fabric",
            price: 129.50,
            originalPrice: 150.00,
            rating: 4.7,
            reviews: 450,
            inStock: true,
            image: "/images/products/product1.jpg",
            discount: 14
        },
        {
            id: 4,
            name: "Handwoven Sindhi Basket",
            price: 499.99,
            originalPrice: 599.99,
            rating: 4.6,
            reviews: 320,
            inStock: true,
            image: "/images/products/product2.jpg",
            discount: 17
        }
    ]);

    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [addedToCart, setAddedToCart] = useState<number[]>([]);
    const [cartToast, setCartToast] = useState<string | null>(null);

    const handleRemove = (id: number) => {
        setItems(prev => prev.filter(i => i.id !== id));
        setConfirmDelete(null);
    };

    const handleAddToCart = (item: WishlistItem) => {
        setAddedToCart(prev => [...prev, item.id]);
        setCartToast(item.name);
        setTimeout(() => {
            setCartToast(null);
        }, 3000);
    };

    const itemToDelete = items.find(i => i.id === confirmDelete);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Wishlist</h1>
                <p className="text-sm font-medium text-gray-500">{items.length} items</p>
            </div>

            {/* Wishlist Grid */}
            {items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                            {/* Image Container */}
                            <div className="relative aspect-square bg-gray-50 overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                {/* Remove Button */}
                                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => setConfirmDelete(item.id)}
                                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-100 text-red-500 flex items-center justify-center hover:bg-red-50 hover:text-red-600 shadow-sm transition-colors"
                                        title="Remove from wishlist"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Discount Badge */}
                                {item.discount && (
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm tracking-wide">
                                            -{item.discount}%
                                        </span>
                                    </div>
                                )}

                                {/* Out of Stock Overlay */}
                                {!item.inStock && (
                                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                                        <span className="bg-gray-900 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-sm tracking-wide">
                                            Out of Stock
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <div className="flex text-amber-400">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{item.rating}</span>
                                    <span className="text-xs font-medium text-gray-400">({item.reviews})</span>
                                </div>

                                <Link href="/product/1" className="group-hover:text-virsa-primary transition-colors inline-block focus:outline-none">
                                    <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2 mb-3">
                                        {item.name}
                                    </h3>
                                </Link>

                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-black text-gray-900">Rs {item.price}</span>
                                        {item.originalPrice && (
                                            <span className="text-xs font-bold text-gray-400 line-through">Rs {item.originalPrice}</span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => item.inStock && handleAddToCart(item)}
                                        disabled={!item.inStock}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${addedToCart.includes(item.id)
                                            ? "bg-emerald-500 text-white"
                                            : item.inStock
                                                ? "bg-gray-900 text-white hover:bg-virsa-primary hover:shadow-lg hover:shadow-virsa-primary/20 hover:-translate-y-0.5"
                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            }`}
                                        title={addedToCart.includes(item.id) ? "Added!" : item.inStock ? "Add to Cart" : "Out of Stock"}
                                    >
                                        {addedToCart.includes(item.id) ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            <ShoppingCart className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm text-center px-4">
                    <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
                        <Heart className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-8 max-w-md">Looks like you haven&apos;t added anything to your wishlist yet. Discover amazing products and save them for later.</p>
                    <Link href="/" className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-virsa-primary transition-all duration-300 shadow-lg hover:shadow-virsa-primary/25 hover:-translate-y-0.5">
                        Start Shopping
                    </Link>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete !== null && itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Remove Item?</h3>
                            <p className="text-sm text-gray-500 mb-1">Are you sure you want to remove</p>
                            <p className="text-sm font-bold text-gray-900 mb-6 line-clamp-2">"{itemToDelete.name}"</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleRemove(confirmDelete)}
                                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Toast */}
            {cartToast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white pl-4 pr-5 py-3.5 rounded-2xl shadow-2xl max-w-xs animate-in slide-in-from-bottom-4 duration-300">
                    <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-400">Added to cart</p>
                        <p className="text-sm font-bold line-clamp-1">{cartToast}</p>
                    </div>
                    <button onClick={() => setCartToast(null)} className="ml-2 text-gray-400 hover:text-white flex-shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
