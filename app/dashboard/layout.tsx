"use client";

import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Heart, Star, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function CustomerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, profile, signOut, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [showGuestToast, setShowGuestToast] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (!loading && user?.user_metadata?.is_guest && pathname && pathname !== "/dashboard") {
            setShowGuestToast(true);
            const timer = setTimeout(() => setShowGuestToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [loading, user, pathname]);

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Orders", href: "/dashboard/orders", icon: ShoppingBag },
        { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
        { name: "My Reviews", href: "/dashboard/reviews", icon: Star },
        { name: "Account Settings", href: "/dashboard/settings", icon: Settings },
    ];

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-10">
                <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
                    <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
                    <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (user?.user_metadata?.is_guest) {
        return (
            <div className="container mx-auto px-4 py-12">
                {showGuestToast && (
                    <div className="fixed top-20 right-6 z-50">
                        <div className="bg-white border border-amber-100 shadow-lg rounded-xl px-4 py-3 text-sm text-amber-700">
                            Dashboard access requires a registered account.
                        </div>
                    </div>
                )}
                <div className="bg-white rounded-[28px] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 max-w-2xl">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard is for registered users</h1>
                    <p className="text-gray-600 mt-3">
                        You are browsing as a guest. Create an account to access your dashboard, orders, and saved items.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            onClick={() => router.push("/register")}
                            className="px-5 py-2.5 rounded-xl bg-virsa-primary text-white font-semibold hover:bg-virsa-primary/90 transition-colors"
                        >
                            Create Account
                        </button>
                        <button
                            onClick={() => router.push("/login")}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="px-5 py-2.5 rounded-xl text-red-600 font-semibold hover:bg-red-50 transition-colors"
                        >
                            Exit Guest Session
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 sticky top-24">
                        <div className="flex items-center gap-4 mb-8">
                            {profile?.avatar_url ? (
                                <div className="w-12 h-12 rounded-full overflow-hidden shadow-md relative">
                                    <Image
                                        src={profile.avatar_url}
                                        alt={profile.full_name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-virsa-primary text-white flex items-center justify-center text-xl font-bold shadow-md">
                                    {profile?.full_name ? getInitials(profile.full_name) : "U"}
                                </div>
                            )}
                            <div>
                                <h2 className="font-bold text-gray-900">{profile?.full_name || "User"}</h2>
                                <p className="text-xs text-gray-500">{user?.email || ""}</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-virsa-light/50 hover:text-virsa-primary transition-colors group"
                                >
                                    <item.icon className="w-5 h-5 text-gray-400 group-hover:text-virsa-primary transition-colors" />
                                    {item.name}
                                </Link>
                            ))}

                            <div className="pt-4 mt-4 border-t border-gray-100">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
