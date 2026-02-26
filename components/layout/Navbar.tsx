import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Heart, User, Menu } from "lucide-react";

export default function Navbar() {
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

                    {/* Search Bar (Hidden on Mobile, shown on md) */}
                    <div className="hidden md:flex flex-1 max-w-2xl">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search for products, vendors, categories..."
                                className="w-full border border-gray-300 rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:border-virsa-primary focus:ring-1 focus:ring-virsa-primary transition-colors"
                            />
                            <button
                                className="absolute right-1 top-1 bottom-1 bg-virsa-primary text-white p-2 rounded-full hover:bg-virsa-primary/90 transition-colors"
                                aria-label="Search"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center gap-3 md:gap-6 text-gray-700">
                        <Link href="/wishlist" className="hover:text-virsa-primary transition-colors flex flex-col items-center gap-1">
                            <Heart className="w-6 h-6" />
                            <span className="text-[10px] hidden md:block font-medium">Wishlist</span>
                        </Link>
                        <Link href="/cart" className="hover:text-virsa-primary transition-colors flex flex-col items-center gap-1 relative">
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6" />
                                <span className="absolute -top-1.5 -right-1.5 bg-virsa-danger text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
                            </div>
                            <span className="text-[10px] hidden md:block font-medium">Cart</span>
                        </Link>
                        <Link href="/login" className="hover:text-virsa-primary transition-colors flex flex-col items-center gap-1">
                            <User className="w-6 h-6" />
                            <span className="text-[10px] hidden md:block font-medium">Account</span>
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button className="md:hidden hover:text-virsa-primary transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Mobile Search - Visible only on small screens */}
                <div className="mt-4 md:hidden relative w-full">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-virsa-primary"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Navigation Links - Bottom Header */}
            <nav className="hidden md:block bg-virsa-primary text-white">
                <div className="container mx-auto px-4">
                    <ul className="flex items-center space-x-8 text-sm font-medium h-12">
                        <li>
                            <div className="bg-virsa-secondary text-virsa-primary h-12 flex items-center px-6 font-bold cursor-pointer hover:bg-virsa-secondary/90 transition-colors">
                                <Menu className="w-5 h-5 mr-2" />
                                All Categories
                            </div>
                        </li>
                        <li><Link href="/" className="hover:text-virsa-secondary transition-colors">Home</Link></li>
                        <li><Link href="/products" className="hover:text-virsa-secondary transition-colors">Shop</Link></li>
                        <li><Link href="/vendors" className="hover:text-virsa-secondary transition-colors">Stores</Link></li>
                        <li><Link href="/deals" className="hover:text-virsa-secondary transition-colors text-virsa-secondary relative">
                            Daily Deals
                            <span className="absolute -top-2 -right-4 bg-virsa-danger text-[9px] px-1 rounded font-bold">HOT</span>
                        </Link></li>
                        <li><Link href="/contact" className="hover:text-virsa-secondary transition-colors">Contact</Link></li>
                    </ul>
                </div>
            </nav>
        </header>
    );
}
