"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CreditCard, ShieldCheck, MapPin, Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

type OrderSuccess = {
    orderId: string;
    orderNumber: string;
};

export default function CheckoutPage() {
    const router = useRouter();
    const { items, total, count, refreshCart } = useCart();
    const { user } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [city, setCity] = useState("");
    const [province, setProvince] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState<OrderSuccess | null>(null);

    const shippingTotal = items.length > 0 ? 150 : 0;
    const grandTotal = total + shippingTotal;

    useEffect(() => {
        if (!email && user?.email) {
            setEmail(user.email);
        }
    }, [email, user]);

    const ensureGuestProfile = async () => {
        if (user && !user.user_metadata?.is_guest) return true;

        const res = await fetch("/api/auth/guest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, full_name: fullName }),
        });

        if (!res.ok) {
            const payload = await res.json();
            setError(payload.error || "Failed to start guest checkout");
            return false;
        }

        return true;
    };

    const handlePlaceOrder = async () => {
        setError("");

        if (!items.length) {
            setError("Your cart is empty.");
            return;
        }

        if (!fullName.trim() || !email.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !province.trim()) {
            setError("Please complete all required shipping fields.");
            return;
        }

        setSubmitting(true);

        try {
            const guestReady = await ensureGuestProfile();
            if (!guestReady) return;

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shipping_address: {
                        full_name: fullName,
                        phone,
                        address_line_1: addressLine1,
                        address_line_2: addressLine2 || undefined,
                        city,
                        province,
                        postal_code: postalCode || undefined,
                    },
                    contact_email: email,
                    items: items.map((item) => ({
                        product_id: item.product_id,
                        quantity: item.qty,
                    })),
                    notes: notes || undefined,
                }),
            });

            const payload = await res.json();

            if (!res.ok) {
                setError(payload.error || "Failed to place order");
                return;
            }

            setSuccess({
                orderId: payload.data.order_id,
                orderNumber: payload.data.order_number,
            });
            await refreshCart();
        } catch (err) {
            console.error("Failed to place order:", err);
            setError("Failed to place order");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50/50 min-h-screen py-8 md:py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-8">
                    <Link href="/cart" className="text-sm font-bold text-gray-500 hover:text-virsa-primary transition-colors flex items-center gap-2 w-fit mb-4">
                        &larr; Back to Cart
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
                </div>

                {success && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                    <Check className="h-6 w-6" />
                                </div>
                                <p className="text-sm font-bold text-emerald-700">Order placed successfully</p>
                                <p className="text-xl font-black text-gray-900 mt-1">Order #{success.orderNumber}</p>
                                <p className="text-sm text-gray-600 mt-2">We sent your confirmation email and will notify you when the order ships.</p>
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setSuccess(null)}
                                    className="w-full py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => router.push("/products")}
                                    className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700"
                                >
                                    Continue shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Main Checkout Flow */}
                    <div className="w-full lg:w-2/3 space-y-6">
                        {!user && (
                            <div className="bg-white rounded-[24px] border border-amber-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                                <p className="text-sm font-bold text-amber-700">Guest checkout enabled</p>
                                <p className="text-sm text-gray-600 mt-1">You can place this order without creating a full account.</p>
                            </div>
                        )}

                        {/* Step 1: Shipping Address */}
                        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-8 h-8 rounded-full bg-virsa-primary text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">1</div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    Shipping Address
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm mb-4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm mb-4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm mb-4"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Street Address</label>
                                    <input
                                        type="text"
                                        value={addressLine1}
                                        onChange={(e) => setAddressLine1(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm mb-4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">City</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm mb-4"
                                    />
                                </div>
                                <div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">State</label>
                                            <input
                                                type="text"
                                                value={province}
                                                onChange={(e) => setProvince(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm mb-4"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">ZIP Code</label>
                                            <input
                                                type="text"
                                                value={postalCode}
                                                onChange={(e) => setPostalCode(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm mb-4"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Apartment / Suite (Optional)</label>
                                    <input
                                        type="text"
                                        value={addressLine2}
                                        onChange={(e) => setAddressLine2(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Order Notes (Optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:bg-white transition-all text-sm"
                                    />
                                </div>
                                {error && (
                                    <div className="col-span-1 md:col-span-2 text-sm font-bold text-red-600">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Delivery Options */}
                        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-gray-400" />
                                        Delivery Options
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">Standard delivery (3-5 business days).</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Payment */}
                        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-gray-400" />
                                        Payment Details
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">Cash on delivery only for now.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Information</h2>

                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 border border-gray-200 relative">
                                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ring-2 ring-white">
                                                {item.qty}
                                            </span>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{item.name}</h3>
                                            <span className="font-bold text-gray-900 text-sm mt-1">Rs {item.priceNum.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 text-sm mb-6 pt-6 border-t border-gray-100">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">Rs {total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-medium text-gray-900">Rs {shippingTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Items</span>
                                    <span className="font-medium text-gray-900">{count}</span>
                                </div>
                            </div>

                            <div className="flex flex-col mb-8 pt-6 border-t border-gray-100">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-base font-bold text-gray-900">Total</span>
                                    <span className="text-3xl font-black text-gray-900 tracking-tight">Rs {grandTotal.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Cash on Delivery</p>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={submitting || items.length === 0}
                                className="w-full bg-virsa-primary hover:bg-virsa-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(71,112,76,0.2)] hover:-translate-y-0.5 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Check className="w-5 h-5 flex-shrink-0" />
                                {submitting ? "Placing Order..." : "Place Order"}
                            </button>

                            <div className="mt-6 flex flex-col items-center gap-3">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                    <ShieldCheck className="w-4 h-4" /> SECURE ENCRYPTED CHECKOUT
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
