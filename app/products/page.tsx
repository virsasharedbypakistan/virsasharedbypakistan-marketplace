import Link from "next/link";
import { Filter, Star, ShoppingCart, SlidersHorizontal, ChevronRight, X } from "lucide-react";

export default function ProductsPage() {
    const categories = ["Electronics", "Fashion", "Home & Garden", "Beauty", "Sports", "Toys"];
    const brands = ["TechHaven", "StyleMates", "HomeLux", "FitPro", "GamerZ"];

    return (
        <div className="bg-gray-50/50 min-h-screen">
            {/* Breadcrumbs & Header */}
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
                            <span className="text-sm text-gray-500 font-medium">Showing <span className="text-gray-900 font-bold">1-24</span> of <span className="text-gray-900 font-bold">482</span> results</span>
                            <select className="bg-white border border-gray-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-virsa-primary/50 text-gray-700 font-medium shadow-sm cursor-pointer">
                                <option>Sort by Recommended</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Newest Arrivals</option>
                                <option>Highest Rated</option>
                            </select>
                            <button className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium">
                                <Filter className="w-4 h-4" /> Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-72 flex-shrink-0 hidden lg:block">
                        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 sticky top-24">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-virsa-primary" />
                                    Filters
                                </h2>
                                <button className="text-sm font-medium text-virsa-primary hover:text-virsa-primary/80">Clear All</button>
                            </div>

                            {/* Categories */}
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

                            {/* Price Range */}
                            <div className="mb-8">
                                <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
                                <div className="space-y-4">
                                    <input type="range" min="0" max="1000" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-virsa-primary" />
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                            <input type="number" placeholder="Min" className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-virsa-primary" />
                                        </div>
                                        <span className="text-gray-400">-</span>
                                        <div className="flex-1 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                            <input type="number" placeholder="Max" className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-virsa-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Brands */}
                            <div className="mb-8">
                                <h3 className="font-bold text-gray-900 mb-4">Brands</h3>
                                <div className="space-y-3">
                                    {brands.map((brand, i) => (
                                        <label key={i} className="flex items-center group cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-virsa-primary focus:ring-virsa-primary custom-checkbox" />
                                            <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{brand}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Ratings */}
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

                    {/* Product Grid */}
                    <div className="flex-1">
                        {/* Active Filters */}
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 flex items-center gap-2 shadow-sm">
                                Electronics <button className="hover:text-red-500"><X className="w-3 h-3" /></button>
                            </span>
                            <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 flex items-center gap-2 shadow-sm">
                                $50 - $250 <button className="hover:text-red-500"><X className="w-3 h-3" /></button>
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
                                <div key={item} className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
                                    <Link href={`/product/${item}`} className="relative aspect-square bg-gray-50 flex items-center justify-center p-6 overflow-hidden block">
                                        <div className="absolute inset-0 bg-virsa-light/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        {/* Placeholder for Product Image */}
                                        <div className="w-24 h-24 bg-gray-200 rounded-full group-hover:scale-110 transition-transform duration-500 shadow-inner"></div>

                                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                            {item % 3 === 0 && <span className="bg-virsa-danger text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wide">Sale</span>}
                                            {item % 4 === 0 && <span className="bg-gradient-to-r from-virsa-primary to-[#5b8c61] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wide">New</span>}
                                        </div>
                                    </Link>

                                    <div className="p-5 flex flex-col flex-1 relative">
                                        <button className="absolute -top-6 right-5 w-12 h-12 bg-white rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.12)] border border-gray-50 flex items-center justify-center text-gray-900 hover:bg-virsa-primary hover:text-white transition-all duration-300 z-20 group/btn">
                                            <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                        </button>

                                        <div className="text-[11px] font-bold tracking-wider text-virsa-primary mb-2 uppercase opacity-80">
                                            Premium Store
                                        </div>
                                        <Link href={`/product/${item}`}>
                                            <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 hover:text-virsa-primary cursor-pointer leading-tight group-hover:underline">
                                                Premium Wireless Noise-Cancelling Headphones Pro Edition
                                            </h3>
                                        </Link>

                                        <div className="flex items-center mb-4 mt-auto">
                                            <div className="flex text-virsa-secondary">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star key={star} className="w-3.5 h-3.5 fill-current" />
                                                ))}
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 ml-2">(124)</span>
                                        </div>

                                        <div className="flex items-baseline gap-2 pt-3 border-t border-gray-100">
                                            <span className="text-xl font-black text-gray-900 tracking-tight">${item * 19}.99</span>
                                            {item % 3 === 0 && <span className="text-xs font-bold text-gray-400 line-through">${item * 29}.99</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Elements */}
                        <div className="flex justify-center mt-12 mb-8">
                            <div className="inline-flex gap-2">
                                <button className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-virsa-primary hover:text-virsa-primary transition-colors disabled:opacity-50" disabled>
                                    &lt;
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-virsa-primary border border-virsa-primary flex items-center justify-center text-white font-bold shadow-md">
                                    1
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 font-bold hover:border-virsa-primary hover:text-virsa-primary transition-colors">
                                    2
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 font-bold hover:border-virsa-primary hover:text-virsa-primary transition-colors">
                                    3
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-virsa-primary hover:text-virsa-primary transition-colors">
                                    &gt;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
