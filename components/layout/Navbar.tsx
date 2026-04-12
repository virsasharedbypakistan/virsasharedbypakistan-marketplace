"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Heart, User, Menu, X, LogOut } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
    const { count: cartCount } = useCart();
    const { count: wishlistCount } = useWishlist();
    const { user, profile, signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Show navbar when scrolling up or at the top
            if (currentScrollY < lastScrollY || currentScrollY < 10) {
                setIsVisible(true);
            } 
            // Hide navbar when scrolling down (after 10px threshold)
            else if (currentScrollY > lastScrollY && currentScrollY > 10) {
                setIsVisible(false);
                setShowUserMenu(false); // Close user menu when hiding
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
            setMobileOpen(false);
        }
    };

    const navLinks = [
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: "Stores", href: "/vendors" },
        { label: "Daily Deals", href: "/deals", hot: true },
        { label: "Contact", href: "/contact" },
    ];

    return (
        <header className={`bg-white sticky top-0 z-50 shadow-sm transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            {/* Top Header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <div className="relative h-20 w-52 md:h-24 md:w-64">
                            <Image
                                src="/virsa-logo.png"
                                alt="Virsa Marketplace Logo"
                                fill
                                className="object-contain drop-shadow-md"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Search Bar (Desktop) */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for products, vendors, categories..."
                                className="w-full border border-gray-300 rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary transition-colors"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1 bottom-1 bg-virsa-primary text-white p-2 rounded-full hover:bg-virsa-primary/90 transition-colors"
                                aria-label="Search"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </form>

                    {/* User Actions */}
                    <div className="flex items-center gap-4 md:gap-5 text-gray-700">
                        {/* Wishlist */}
                        <Link href="/wishlist" className="group flex flex-col items-center gap-1 min-w-[56px] text-gray-700 hover:text-virsa-primary transition-colors">
                            <span className="relative w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                <Heart className="w-5 h-5" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-virsa-danger text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold leading-none">
                                        {wishlistCount > 9 ? "9+" : wishlistCount}
                                    </span>
                                )}
                            </span>
                            <span className="text-[10px] hidden md:block font-medium">Wishlist</span>
                        </Link>

                        {/* Notifications */}
                        <div className="flex flex-col items-center gap-1 min-w-[56px]">
                            <NotificationBell role="customer" />
                            <span className="text-[10px] hidden md:block font-medium">Alerts</span>
                        </div>

                        {/* Cart */}
                        <Link href="/cart" className="group flex flex-col items-center gap-1 min-w-[56px] text-gray-700 hover:text-virsa-primary transition-colors">
                            <span className="relative w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                <ShoppingCart className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 bg-virsa-danger text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold leading-none">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            </span>
                            <span className="text-[10px] hidden md:block font-medium">Cart</span>
                        </Link>

                        {/* Account */}
                        {user && profile ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="group flex flex-col items-center gap-1 min-w-[56px] text-gray-700 hover:text-virsa-primary transition-colors"
                                >
                                    <span className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                        {profile.avatar_url ? (
                                            <span className="w-5 h-5 rounded-full overflow-hidden">
                                                <Image src={profile.avatar_url} alt={profile.full_name} width={20} height={20} />
                                            </span>
                                        ) : (
                                            <User className="w-5 h-5" />
                                        )}
                                    </span>
                                    <span className="text-[10px] hidden md:block font-medium">{profile.full_name.split(' ')[0]}</span>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                        <Link
                                            href={profile.role === 'admin' ? '/admin/dashboard' : profile.role === 'vendor' ? '/vendor/dashboard' : '/dashboard'}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                await signOut();
                                                setShowUserMenu(false);
                                                router.push('/');
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="group flex flex-col items-center gap-1 min-w-[56px] text-gray-700 hover:text-virsa-primary transition-colors">
                                <span className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                    <User className="w-5 h-5" />
                                </span>
                                <span className="text-[10px] hidden md:block font-medium">Account</span>
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden hover:text-virsa-primary transition-colors"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mt-4 md:hidden relative w-full">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-virsa-primary"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Search className="w-5 h-5" />
                    </button>
                </form>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:block bg-virsa-primary text-white">
                <div className="container mx-auto px-4">
                    <ul className="flex items-center space-x-8 text-sm font-medium h-12">
                        <li>
                            <Link href="/products" className="bg-virsa-secondary text-virsa-primary h-12 flex items-center px-6 font-bold hover:bg-virsa-secondary/90 transition-colors">
                                <Menu className="w-5 h-5 mr-2" />
                                All Categories
                            </Link>
                        </li>
                        {navLinks.map((link) => (
                            <li key={link.href} className="relative">
                                <Link href={link.href} className="hover:text-virsa-secondary transition-colors flex items-center gap-1">
                                    {link.label}
                                    {link.hot && (
                                        <span className="absolute -top-2 -right-4 bg-virsa-danger text-[9px] px-1 rounded font-bold">HOT</span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Mobile Navigation Drawer */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <ul className="flex flex-col py-2">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center px-6 py-3 text-sm font-medium text-gray-700 hover:bg-virsa-primary/5 hover:text-virsa-primary transition-colors"
                                >
                                    {link.label}
                                    {link.hot && (
                                        <span className="ml-2 bg-virsa-danger text-white text-[9px] px-1.5 py-0.5 rounded font-bold">HOT</span>
                                    )}
                                </Link>
                            </li>
                        ))}
                        <li className="border-t border-gray-100 mt-2 pt-2">
                            <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center px-6 py-3 text-sm font-medium text-gray-700 hover:bg-virsa-primary/5 hover:text-virsa-primary transition-colors">
                                <User className="w-4 h-4 mr-3" /> Sign In / Account
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </header>
    );
}
