import { Heart, ShoppingCart, Trash2, Package } from "lucide-react";
import Link from "next/link";

export default function CustomerWishlistPage() {
    const wishlistItems = [
        {
            id: 1,
            name: "Premium Wireless Noise-Cancelling Headphones Pro",
            price: 199.99,
            originalPrice: 249.99,
            rating: 4.8,
            reviews: 1240,
            inStock: true,
            image: "/placeholder-headphone.jpg",
            discount: 20
        },
        {
            id: 2,
            name: "Smart Fitness Watch Series 5",
            price: 299.99,
            originalPrice: null,
            rating: 4.9,
            reviews: 890,
            inStock: false,
            image: "/placeholder-watch.jpg",
            discount: null
        },
        {
            id: 3,
            name: "Mechanical Gaming Keyboard RGB",
            price: 129.50,
            originalPrice: 150.00,
            rating: 4.7,
            reviews: 450,
            inStock: true,
            image: "/placeholder-keyboard.jpg",
            discount: 14
        },
        {
            id: 4,
            name: "Ultra-Wide Gaming Monitor 34\"",
            price: 499.99,
            originalPrice: 599.99,
            rating: 4.6,
            reviews: 320,
            inStock: true,
            image: "/placeholder-monitor.jpg",
            discount: 17
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Wishlist</h1>
                <p className="text-sm font-medium text-gray-500">{wishlistItems.length} items</p>
            </div>

            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                        {/* Image Container */}
                        <div className="relative aspect-square bg-gray-50 p-6 flex flex-col items-center justify-center">
                            {/* Actions Overlay */}
                            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-100 text-red-500 flex items-center justify-center hover:bg-red-50 hover:text-red-600 shadow-sm transition-colors" title="Remove from wishlist">
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

                            {/* Stock Badge */}
                            {!item.inStock && (
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="bg-gray-900 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm tracking-wide">
                                        Out of Stock
                                    </span>
                                </div>
                            )}

                            {/* Placeholder Icon */}
                            <Package className="w-20 h-20 text-gray-300 group-hover:scale-110 transition-transform duration-500 ease-out" />
                        </div>

                        {/* Content Container */}
                        <div className="p-5 flex-1 flex flex-col relative bg-white">
                            {/* Rating */}
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex text-amber-400">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{item.rating}</span>
                                    <span className="text-xs font-medium text-gray-400">({item.reviews})</span>
                                </div>
                            </div>

                            {/* Title */}
                            <Link href="/product/1" className="group-hover:text-virsa-primary transition-colors inline-block focus:outline-none">
                                <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2 mb-3">
                                    {item.name}
                                </h3>
                            </Link>

                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                {/* Price */}
                                <div className="flex flex-col">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-lg font-black text-gray-900">Rs {item.price}</span>
                                    </div>
                                    {item.originalPrice && (
                                        <span className="text-xs font-bold text-gray-400 line-through">
                                            Rs {item.originalPrice}
                                        </span>
                                    )}
                                </div>

                                {/* Add to Cart Action */}
                                <button
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${item.inStock
                                        ? "bg-gray-900 text-white hover:bg-virsa-primary hover:shadow-lg hover:shadow-virsa-primary/20 hover:-translate-y-0.5"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        }`}
                                    disabled={!item.inStock}
                                    title={item.inStock ? "Add to Cart" : "Out of Stock"}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {wishlistItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm text-center px-4">
                    <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
                        <Heart className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your wishlist yet. Discover amazing products and save them for later.</p>
                    <Link href="/" className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-virsa-primary transition-all duration-300 shadow-lg hover:shadow-virsa-primary/25 hover:-translate-y-0.5">
                        Start Shopping
                    </Link>
                </div>
            )}
        </div>
    );
}
