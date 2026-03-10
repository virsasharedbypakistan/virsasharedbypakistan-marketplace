"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, MoreVertical, Search, X, CheckCircle2, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Review = {
    id: string;
    product_id: string;
    rating: number;
    title: string | null;
    comment: string;
    created_at: string;
    products: {
        id: string;
        name: string;
        thumbnail_url: string | null;
    };
};

export default function CustomerReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const [editModal, setEditModal] = useState<{ open: boolean; review: Review | null }>({ open: false, review: null });
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ rating: 5, title: "", content: "" });
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch("/api/reviews?user_reviews=true");
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const openEdit = (review: Review) => {
        setEditForm({ rating: review.rating, title: review.title || "", content: review.comment });
        setEditModal({ open: true, review });
        setMenuOpen(null);
        setSaveSuccess(false);
    };

    const handleSave = async () => {
        if (!editModal.review) return;

        try {
            const res = await fetch(`/api/reviews/${editModal.review.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating: editForm.rating,
                    title: editForm.title,
                    comment: editForm.content,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setReviews(prev => prev.map(r => r.id === editModal.review!.id ? data.data : r));
                setSaveSuccess(true);
            } else {
                alert("Failed to update review");
            }
        } catch (error) {
            console.error("Failed to update review:", error);
            alert("Failed to update review");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/reviews/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setReviews(prev => prev.filter(r => r.id !== id));
            } else {
                alert("Failed to delete review");
            }
        } catch (error) {
            console.error("Failed to delete review:", error);
            alert("Failed to delete review");
        }
        setDeleteConfirm(null);
    };

    const generateStars = (rating: number) => {
        return Array(5).fill(0).map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-200"}`} />
        ));
    };

    const filteredReviews = reviews.filter(r =>
        r.products.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
    const reviewToDelete = reviews.find(r => r.id === deleteConfirm);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="inline-block w-8 h-8 border-4 border-virsa-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Reviews</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">Manage and edit your past reviews</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search reviews..."
                        className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                    <p className="text-sm font-medium text-gray-500 mt-1">Total Reviews</p>
                </div>
                <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                        <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 mt-1">Average Rating</p>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {filteredReviews.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[24px] border border-gray-100">
                        <Star className="w-12 h-12 text-gray-200 mb-3" />
                        <p className="text-gray-500 font-medium">No reviews found</p>
                    </div>
                )}
                {filteredReviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col sm:flex-row gap-6">
                        {/* Product Info Sidebar */}
                        <div className="w-full sm:w-44 flex-shrink-0">
                            <Link href={`/product/${review.product_id}`} className="block group">
                                <div className="aspect-square bg-gray-50 rounded-xl mb-3 border border-gray-100 overflow-hidden relative">
                                    <Image src={review.products.thumbnail_url || "/product_headphones.png"} alt={review.products.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-virsa-primary transition-colors line-clamp-2">
                                    {review.products.name}
                                </h3>
                            </Link>
                        </div>

                        {/* Review Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex">{generateStars(review.rating)}</div>
                                        {review.title && <span className="text-sm font-bold text-gray-900">{review.title}</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Action Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setMenuOpen(menuOpen === review.id ? null : review.id)}
                                        className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                    {menuOpen === review.id && (
                                        <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 w-36">
                                            <button onClick={() => openEdit(review)} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                                ✏️ Edit Review
                                            </button>
                                            <button onClick={() => { setDeleteConfirm(review.id); setMenuOpen(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm leading-relaxed mb-6">{review.comment}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <span className="text-xs font-medium text-gray-500"></span>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => openEdit(review)}
                                        className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    >
                                        Edit Review
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(review.id)}
                                        className="px-4 py-2 text-xs font-bold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Review Modal */}
            {editModal.open && editModal.review && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setEditModal({ open: false, review: null })}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Edit Review</h2>
                            <button onClick={() => setEditModal({ open: false, review: null })} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {saveSuccess ? (
                            <div className="p-10 text-center">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Review Updated!</h3>
                                <p className="text-gray-500 text-sm mb-6">Your changes have been saved successfully.</p>
                                <button onClick={() => setEditModal({ open: false, review: null })} className="px-6 py-2.5 bg-virsa-primary text-white rounded-xl font-bold hover:bg-virsa-primary/90 transition-colors">
                                    Done
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 space-y-5">
                                {/* Product Preview */}
                                <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                                        <Image src={editModal.review.products.thumbnail_url || "/product_headphones.png"} alt={editModal.review.products.name} fill className="object-cover" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 line-clamp-2">{editModal.review.products.name}</p>
                                </div>

                                {/* Star Rating */}
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-2">Rating</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button key={s} onClick={() => setEditForm(f => ({ ...f, rating: s }))}>
                                                <Star className={`w-8 h-8 transition-colors ${s <= editForm.rating ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-200"}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Review Title</label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                                    />
                                </div>

                                {/* Review Content */}
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Your Review</label>
                                    <textarea
                                        rows={4}
                                        value={editForm.content}
                                        onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setEditModal({ open: false, review: null })} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={!editForm.content.trim()}
                                        className="flex-1 py-3 rounded-xl bg-virsa-primary text-white font-bold hover:bg-virsa-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm !== null && reviewToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Review?</h3>
                            <p className="text-sm text-gray-500 mb-1">This will permanently delete your review for</p>
                            <p className="text-sm font-bold text-gray-900 mb-6">"{reviewToDelete.title}"</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close menu */}
            {menuOpen !== null && (
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
            )}
        </div>
    );
}
