import { Star, ThumbsUp, MoreVertical, Search, Filter } from "lucide-react";
import Link from "next/link";

export default function CustomerReviewsPage() {
    const reviews = [
        {
            id: 1,
            productId: 1,
            productName: "Premium Wireless Noise-Cancelling Headphones Pro",
            productImage: "/placeholder-headphone.jpg",
            rating: 5,
            date: "October 20, 2023",
            title: "Best headphones I've ever owned!",
            content: "The sound quality is absolutely incredible. The noise cancellation works perfectly on my daily commute. Battery life is also exactly as advertised. Very comfortable even after wearing them for hours.",
            helpfulCount: 24,
            verifiedPurchase: true
        },
        {
            id: 2,
            productId: 2,
            productName: "Smart Fitness Watch Series 5",
            productImage: "/placeholder-watch.jpg",
            rating: 4,
            date: "September 15, 2023",
            title: "Great features, styling is okay",
            content: "I love all the health tracking features and the screen is very bright. My only complaint is that the included band feels a bit cheap. I had to buy a separate one.",
            helpfulCount: 5,
            verifiedPurchase: true
        },
        {
            id: 3,
            productId: 3,
            productName: "Minimalist Desk Lamp",
            productImage: "/placeholder-lamp.jpg",
            rating: 5,
            date: "August 2, 2023",
            title: "Perfect for my home office",
            content: "Sleek, bright, and the adjustable color temperature is exactly what I needed for late-night working sessions.",
            helpfulCount: 12,
            verifiedPurchase: true
        }
    ];

    const generateStars = (rating: number) => {
        return Array(5).fill(0).map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-200"}`}
            />
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Reviews</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">Manage and edit your past reviews</p>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search reviews..."
                            className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                    <p className="text-sm font-medium text-gray-500 mt-1">Total Reviews</p>
                </div>
                <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-gray-900">4.7</p>
                    <p className="text-sm font-medium text-gray-500 mt-1">Average Rating</p>
                </div>
                <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-gray-900">41</p>
                    <p className="text-sm font-medium text-gray-500 mt-1">Helpful Votes</p>
                </div>
                <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 text-center flex items-center justify-center">
                    <button className="text-sm font-bold text-virsa-primary hover:text-virsa-primary/80 transition-colors">
                        Pending Reviews (2)
                    </button>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col sm:flex-row gap-6">
                        {/* Product Info Sidebar */}
                        <div className="w-full sm:w-48 flex-shrink-0">
                            <Link href={`/product/${review.productId}`} className="block group">
                                <div className="aspect-square bg-gray-50 rounded-xl mb-3 border border-gray-100 flex items-center justify-center overflow-hidden">
                                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-virsa-primary transition-colors line-clamp-2">
                                    {review.productName}
                                </h3>
                            </Link>
                        </div>

                        {/* Review Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex">
                                            {generateStars(review.rating)}
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{review.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                        <span>{review.date}</span>
                                        {review.verifiedPurchase && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span className="text-emerald-600 font-bold">Verified Purchase</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                {review.content}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <span className="text-xs font-medium text-gray-500">
                                    {review.helpfulCount} people found this helpful
                                </span>
                                <div className="flex items-center gap-3">
                                    <button className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                        Edit Review
                                    </button>
                                    <button className="px-4 py-2 text-xs font-bold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
