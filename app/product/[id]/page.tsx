"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShieldCheck, Truck, RotateCcw, Heart, Minus, Plus, ShoppingCart, ShoppingBag, ChevronRight, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useRouter } from "next/navigation";

type Product = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    short_description: string | null;
    price: number;
    sale_price: number | null;
    stock: number;
    images: string[];
    thumbnail_url: string | null;
    status: string;
    average_rating: number;
    total_reviews: number;
    vendors: {
        id: string;
        store_name: string;
    };
    categories: {
        name: string;
    } | null;
};

type Review = {
    id: string;
    rating: number;
    title: string | null;
    comment: string;
    created_at: string;
    users: {
        full_name: string;
    };
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const { addItem, loading: cartLoading } = useCart();
    const { toggle, isInWishlist, loading: wishlistLoading } = useWishlist();

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [activeTab, setActiveTab] = useState("description");
    const [selectedImage, setSelectedImage] = useState<string>("");

    const wishlisted = isInWishlist(id);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data.data);
                    // Set initial image when product loads
                    const images = data.data.images.length > 0 ? data.data.images : [data.data.thumbnail_url || "/product_headphones.png"];
                    setSelectedImage(images[0]);
                } else {
                    console.error("Product not found");
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/reviews?product_id=${id}`);
                if (res.ok) {
                    const result = await res.json();
                    const reviewList = result.data?.data || result.data || [];
                    setReviews(Array.isArray(reviewList) ? reviewList : []);
                }
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            }
        };

        fetchProduct();
        fetchReviews();
    }, [id]);

    const handleAddToCart = async () => {
        await addItem(id, qty);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = async () => {
        await addItem(id, qty);
        router.push("/checkout");
    };

    const handleWishlistToggle = async () => {
        await toggle(id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="inline-block w-8 h-8 border-4 border-virsa-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
                <Link href="/products" className="text-virsa-primary font-bold hover:underline">
                    Browse Products
                </Link>
            </div>
        );
    }

    const effectivePrice = product.sale_price || product.price;
    const hasDiscount = product.sale_price && product.sale_price < product.price;
    const images = product.images.length > 0 ? product.images : [product.thumbnail_url || "/product_headphones.png"];

    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-gray-50/50 border-b border-gray-100">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
                        <Link href="/" className="hover:text-virsa-primary transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                        <Link href="/products" className="hover:text-virsa-primary transition-colors">
                            {product.categories?.name || "Products"}
                        </Link>
                        <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                        <span className="text-gray-900 font-medium truncate">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    <div className="w-full lg:w-1/2 flex flex-col gap-4">
                        <div className="aspect-square bg-gray-50 rounded-[32px] border border-gray-100 relative overflow-hidden group">
                            <Image
                                src={selectedImage}
                                alt={product.name}
                                fill
                                priority
                                className="object-contain p-8 group-hover:scale-105 transition-transform duration-700 ease-out"
                            />

                            {hasDiscount && (
                                <div className="absolute top-6 left-6 z-20">
                                    <span className="bg-virsa-danger text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wide">
                                        Sale {Math.round(((product.price - product.sale_price!) / product.price) * 100)}%
                                    </span>
                                </div>
                            )}
                            <div className="absolute top-6 right-6 z-20">
                                <button
                                    onClick={handleWishlistToggle}
                                    disabled={wishlistLoading}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur text-gray-600 hover:text-red-500 hover:bg-white'}`}
                                    title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                >
                                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {images.slice(0, 4).map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`aspect-square rounded-2xl border-2 overflow-hidden relative transition-all ${selectedImage === img ? 'border-virsa-primary ring-1 ring-virsa-primary/30' : 'border-gray-100 hover:border-gray-300'}`}
                                    >
                                        <Image src={img} alt={`View ${idx + 1}`} fill className="object-contain p-2" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-full lg:w-1/2 flex flex-col">
                        <div className="mb-6">
                            <Link href={`/vendor/${product.vendors.id}`} className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <span className="text-sm font-bold text-virsa-primary">{product.vendors.store_name}</span>
                            </Link>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-[1.2] mb-4">{product.name}</h1>

                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center text-virsa-secondary">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`w-5 h-5 ${star <= Math.round(product.average_rating) ? "fill-current" : "text-gray-300"}`} />
                                    ))}
                                </div>
                                <div className="text-sm font-bold text-gray-900">{product.average_rating.toFixed(1)}</div>
                                <div className="text-sm text-gray-500 hover:text-virsa-primary cursor-pointer underline underline-offset-4" onClick={() => setActiveTab("reviews")}>
                                    ({product.total_reviews} reviews)
                                </div>
                                <div className={`text-sm font-bold px-2 py-0.5 rounded-full ${product.stock > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                                </div>
                            </div>

                            <div className="flex items-end gap-3 mb-8">
                                <span className="text-4xl font-black text-gray-900 tracking-tight">Rs {effectivePrice.toLocaleString()}</span>
                                {hasDiscount && (
                                    <span className="text-lg font-bold text-gray-400 line-through mb-1">Rs {product.price.toLocaleString()}</span>
                                )}
                            </div>

                            {product.short_description && (
                                <p className="text-gray-600 leading-relaxed mb-8 text-lg font-light">
                                    {product.short_description}
                                </p>
                            )}
                        </div>

                        <div className="h-px bg-gray-100 w-full mb-8" />

                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <div className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-2xl p-2 w-full sm:w-40 h-14">
                                <button 
                                    onClick={() => setQty(Math.max(1, qty - 1))} 
                                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold text-gray-900">{qty}</span>
                                <button 
                                    onClick={() => setQty(Math.min(product.stock, qty + 1))} 
                                    disabled={qty >= product.stock}
                                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-xl transition-all disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={cartLoading || product.stock === 0}
                                className={`flex-1 h-14 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed ${addedToCart ? 'bg-emerald-600 text-white' : 'bg-virsa-primary hover:bg-virsa-dark text-white'}`}
                            >
                                {addedToCart ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={product.stock === 0}
                                className="h-14 px-8 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ShoppingBag className="w-5 h-5 flex-shrink-0" /> Buy Now
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-gray-50 rounded-[20px] border border-gray-100">
                            {[
                                { icon: ShieldCheck, title: "1 Year Warranty", desc: "Full protection" },
                                { icon: Truck, title: "COD Available", desc: "Pay on delivery" },
                                { icon: RotateCcw, title: "7-Day Returns", desc: "Hassle-free process" },
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <badge.icon className="w-5 h-5 text-virsa-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900">{badge.title}</h4>
                                        <p className="text-[10px] text-gray-500">{badge.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-20">
                    <div className="flex gap-8 border-b border-gray-200 px-4 overflow-x-auto">
                        {[
                            { key: "description", label: "Description" },
                            { key: "reviews", label: `Reviews (${product.total_reviews})` },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`pb-4 text-base font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab.key ? 'text-virsa-primary border-virsa-primary' : 'text-gray-500 border-transparent hover:text-gray-900'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="py-8 max-w-4xl text-gray-600 leading-relaxed text-lg font-light">
                        {activeTab === "description" && (
                            <div>
                                {product.description ? (
                                    <p className="whitespace-pre-wrap">{product.description}</p>
                                ) : (
                                    <p>{product.short_description || "No description available."}</p>
                                )}
                            </div>
                        )}
                        {activeTab === "reviews" && (
                            <div className="space-y-6">
                                {reviews.length === 0 ? (
                                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                                ) : (
                                    reviews.map((review) => (
                                        <div key={review.id} className="border border-gray-100 rounded-2xl p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-gray-900">{review.users.full_name}</p>
                                                    <div className="flex mt-1">
                                                        {[...Array(5)].map((_, s) => (
                                                            <Star key={s} className={`w-4 h-4 ${s < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                                            </div>
                                            {review.title && <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>}
                                            <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
