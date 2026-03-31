"use client";

import { useState, useEffect } from "react";
import { Star, Search, Package } from "lucide-react";
import Image from "next/image";

type Product = {
    id: string;
    name: string;
    price: number;
    thumbnail_url: string | null;
    images: string[];
    is_featured: boolean;
    show_on_homepage: boolean;
    average_rating: number;
    total_reviews: number;
    vendors: { store_name: string };
    categories: { name: string } | null;
};

export default function AdminFeaturedProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch("/api/admin/products");
            if (response.ok) {
                const result = await response.json();
                setProducts(result.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFeatured = async (productId: string, currentStatus: boolean) => {
        setUpdating(productId);
        try {
            const response = await fetch(`/api/admin/products/${productId}/featured`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_featured: !currentStatus })
            });

            if (response.ok) {
                setProducts(prev => prev.map(p => 
                    p.id === productId ? { ...p, is_featured: !currentStatus } : p
                ));
            } else {
                const error = await response.json();
                alert(error.error || "Failed to update featured status");
            }
        } catch (error) {
            console.error("Failed to toggle featured:", error);
            alert("Failed to update featured status");
        } finally {
            setUpdating(null);
        }
    };

    const toggleHomepage = async (productId: string, currentStatus: boolean) => {
        setUpdating(productId);
        try {
            const response = await fetch(`/api/admin/products/${productId}/homepage`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ show_on_homepage: !currentStatus })
            });

            if (response.ok) {
                setProducts(prev => prev.map(p => 
                    p.id === productId ? { ...p, show_on_homepage: !currentStatus } : p
                ));
            } else {
                const error = await response.json();
                alert(error.error || "Failed to update homepage visibility");
            }
        } catch (error) {
            console.error("Failed to toggle homepage:", error);
            alert("Failed to update homepage visibility");
        } finally {
            setUpdating(null);
        }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vendors.store_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const featuredProducts = filtered.filter(p => p.is_featured);
    const homepageProducts = featuredProducts.filter(p => p.show_on_homepage);
    const nonFeaturedProducts = filtered.filter(p => !p.is_featured);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-virsa-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Products Management</h1>
                <p className="text-gray-500 mt-1 text-sm">Select products to feature on the homepage (showing 6 products)</p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search products or stores..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary"
                    />
                </div>
            </div>

            {/* Homepage Products Section */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-green-50">
                    <h2 className="text-lg font-bold text-gray-900">Showing on Homepage ({homepageProducts.length}/6)</h2>
                    <p className="text-sm text-gray-500 mt-1">These products are currently visible on the homepage</p>
                </div>
                <div className="p-6">
                    {homepageProducts.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="font-medium">No products showing on homepage</p>
                            <p className="text-sm mt-1">Toggle the eye icon on featured products below to show them</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {homepageProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onToggleFeatured={toggleFeatured}
                                    onToggleHomepage={toggleHomepage}
                                    updating={updating === product.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Featured Products Section */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-virsa-primary/5">
                    <h2 className="text-lg font-bold text-gray-900">Featured Products ({featuredProducts.length})</h2>
                    <p className="text-sm text-gray-500 mt-1">Mark products as featured and control homepage visibility</p>
                </div>
                <div className="p-6">
                    {featuredProducts.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="font-medium">No featured products yet</p>
                            <p className="text-sm mt-1">Click the star icon on products below to feature them</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {featuredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onToggleFeatured={toggleFeatured}
                                    onToggleHomepage={toggleHomepage}
                                    updating={updating === product.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* All Products Section */}
            <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">All Products</h2>
                    <p className="text-sm text-gray-500 mt-1">Click the star to add/remove from featured</p>
                </div>
                <div className="p-6">
                    {nonFeaturedProducts.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="font-medium">No products found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {nonFeaturedProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onToggleFeatured={toggleFeatured}
                                    onToggleHomepage={toggleHomepage}
                                    updating={updating === product.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ProductCard({ 
    product, 
    onToggleFeatured,
    onToggleHomepage,
    updating 
}: { 
    product: Product; 
    onToggleFeatured: (id: string, current: boolean) => void;
    onToggleHomepage: (id: string, current: boolean) => void;
    updating: boolean;
}) {
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative aspect-square bg-gray-50">
                <Image
                    src={product.thumbnail_url || product.images[0] || "/product_headphones.png"}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                />
                {product.show_on_homepage && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        On Homepage
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="text-xs font-semibold text-virsa-primary mb-1">{product.vendors.store_name}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center mb-2">
                    <div className="flex text-virsa-secondary">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-3 h-3 ${star <= Math.round(product.average_rating) ? "fill-current" : "text-gray-200"}`} />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">({product.total_reviews})</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-lg font-bold text-gray-900">Rs {product.price.toLocaleString()}</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onToggleFeatured(product.id, product.is_featured)}
                            disabled={updating}
                            className={`p-2 rounded-lg transition-colors ${
                                product.is_featured
                                    ? "bg-virsa-secondary text-virsa-primary hover:bg-virsa-secondary/80"
                                    : "bg-gray-100 text-gray-400 hover:bg-virsa-secondary/20 hover:text-virsa-secondary"
                            } disabled:opacity-50`}
                            title={product.is_featured ? "Remove from featured" : "Add to featured"}
                        >
                            <Star className={`w-4 h-4 ${product.is_featured ? "fill-current" : ""}`} />
                        </button>
                        {product.is_featured && (
                            <button
                                onClick={() => onToggleHomepage(product.id, product.show_on_homepage)}
                                disabled={updating}
                                className={`p-2 rounded-lg transition-colors ${
                                    product.show_on_homepage
                                        ? "bg-green-500 text-white hover:bg-green-600"
                                        : "bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500"
                                } disabled:opacity-50`}
                                title={product.show_on_homepage ? "Hide from homepage" : "Show on homepage"}
                            >
                                {product.show_on_homepage ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
