"use client";

import Link from "next/link";
import Image from "next/image";
import { Filter, Star, ShoppingCart, SlidersHorizontal, ChevronRight, X, Heart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useState, useEffect } from "react";

type Product = {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    thumbnail_url: string | null;
    images: string[];
    average_rating: number;
    total_reviews: number;
    vendors: {
        store_name: string;
    };
};

function ProductCard({ item }: { item: Product }) {
    const { addItem, loading: cartLoading } = useCart();
    const { toggle, isInWishlist, loading: wishlistLoading } = useWishlist();
    const [added, setAdded] = useState(false);
    const wishlisted = isInWishlist(item.id);

    const effectivePrice = item.sale_price || item.price;
    const hasDiscount = item.sale_price && item.sale_price < item.price;

    const handleAdd = async (e: React.MouseEvent) => {
        e.preventDefault();
        await addItem(item.id, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const handleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        await toggle(item.id);
    };

    return (
        <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
            <Link href={`/product/${item.id}`} className="relative aspect-square bg-gray-50 overflow-hidden block">
                <Image
                    src={item.thumbnail_url || item.images?.[0] || "/product_headphones.png"}
                    alt={item.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
                {hasDiscount && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-virsa-danger text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wide">Sale</span>
                    </div>
                )}
                <button
                    onClick={handleWishlist}
                    disabled={wishlistLoading}
                    className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all z-10 ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
                >
                    <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
            </Link>

            <div className="p-5 flex flex-col flex-1 relative">
                <button
                    onClick={handleAdd}
                    disabled={cartLoading}
                    className={`absolute -top-6 right-5 w-12 h-12 rounded-full shadow-lg border border-gray-50 flex items-center justify-center transition-all duration-300 z-20 ${added ? 'bg-emerald-500 text-white' : 'bg-white text-gray-900 hover:bg-virsa-primary hover:text-white'}`}
                    title="Add to cart"
                >
                    {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                </button>

                <div className="text-[11px] font-bold tracking-wider text-virsa-primary mb-2 uppercase opacity-80">{item.vendors.store_name}</div>
                <Link href={`/product/${item.id}`}>
                    <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 hover:text-virsa-primary cursor-pointer leading-tight">{item.name}</h3>
                </Link>

                <div className="flex items-center mb-4 mt-auto">
                    <div className="flex text-virsa-secondary">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(item.average_rating) ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 ml-2">({item.total_reviews})</span>
                </div>

                <div className="flex items-baseline gap-2 pt-3 border-t border-gray-100">
                    <span className="text-xl font-black text-gray-900 tracking-tight">Rs {effectivePrice.toLocaleString()}</span>
                    {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">Rs {item.price.toLocaleString()}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState("newest");

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/products?page=${page}&limit=12&sort=${sort}`);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page, sort]);

    const categories = ["Electronics", "Fashion", "Home & Garden", "Beauty", "Sports", "Toys"];
    const brands = ["TechHaven", "StyleMates", "HomeLux", "FitPro", "GamerZ"];

    return (
        <div className="bg-gray-50/50 min-h-screen">
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-virsa-primary transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-gray-900 font-medium">All Products</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">All Products</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 font-medium">Showing <span className="text-gray-900 font-bold">{products.length}</span> products</span>
                            <select 
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="bg-white border border-gray-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-virsa-primary/50 text-gray-700 font-medium shadow-sm cursor-pointer"
                            >
                                <option value="newest">Newest Arrivals</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-72 flex-shrink-0 hidden lg:block">
                        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 sticky top-24">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-virsa-primary" />
                                    Filters
                                </h2>
                                <button className="text-sm font-medium text-virsa-primary hover:text-virsa-primary/80">Clear All</button>
                            </div>

                            <div className="mb-8">
                                <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                                <div className="space-y-3">
                                    {categories.map((cat, i) => (
                                        <label key={i} className="flex items-center group cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-virsa-primary focus:ring-virsa-primary custom-checkbox" />
                                            <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
                                <div className="space-y-4">
                                    <input type="range" min="0" max="1000" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-virsa-primary" />
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rs </span>
                                            <input type="number" placeholder="Min" className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-virsa-primary" />
                                        </div>
                                        <span className="text-gray-400">-</span>
                                        <div className="flex-1 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rs </span>
                                            <input type="number" placeholder="Max" className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-virsa-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-4">Ratings</h3>
                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <label key={rating} className="flex items-center group cursor-pointer text-sm">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-virsa-primary focus:ring-virsa-primary custom-checkbox mr-3" />
                                            <div className="flex text-virsa-secondary">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-current" : "text-gray-300"}`} />
                                                ))}
                                            </div>
                                            <span className="ml-2 text-gray-600">&amp; up</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="flex-1">
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="inline-block w-8 h-8 border-4 border-virsa-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-500 mt-4">Loading products...</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.map((item) => (
                                        <ProductCard key={item.id} item={item} />
                                    ))}
                                </div>

                                {products.length === 0 && (
                                    <div className="text-center py-20">
                                        <p className="text-gray-500">No products found</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
