"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Heart, User, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { count: cartCount } = useCart();
    const { count: wishlistCount } = useWishlist();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

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
        { label: "Shop", href: "/products" },
        { label: "Stores", href: "/vendors" },
        { label: "Daily Deals", href: "/deals", hot: true },
        { label: "Contact", href: "/contact" },
    ];

    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm">
            {/* Top Header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <div className="relative h-12 w-32 md:h-14 md:w-40">
                            <Image
                                src="/virsa-logo.png"
                                alt="Virsa Marketplace Logo"
                                fill
                                className="object-contain"
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
                    <div className="flex items-center gap-3 md:gap-6 text-gray-700">
                        {/* Wishlist */}
                        <Link href="/wishlist" className="hover:text-virsa-primary transition-colors flex flex-col items-center gap-1 relative">
                            <div className="relative">
                                <Heart className="w-6 h-6" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-virsa-danger text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                        {wishlistCount > 9 ? "9+" : wishlistCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] hidden md:block font-medium">Wishlist</span>
                        </Link>

                        {/* Cart */}
                        <Link href="/cart" className="hover:text-virsa-primary transition-colors flex flex-col items-center gap-1 relative">
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6" />
                                <span className="absolute -top-1.5 -right-1.5 bg-virsa-danger text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            </div>
                            <span className="text-[10px] hidden md:block font-medium">Cart</span>
                        </Link>

                        {/* Account */}
                        <Link href="/login" className="hover:text-virsa-primary transition-colors flex flex-col items-center gap-1">
                            <User className="w-6 h-6" />
                            <span className="text-[10px] hidden md:block font-medium">Account</span>
                        </Link>

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
