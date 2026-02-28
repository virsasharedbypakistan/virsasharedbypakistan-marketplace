import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand Info */}
                    <div>
                        <div className="relative h-12 w-36 mb-6">
                            <Image
                                src="/virsa-logo.png"
                                alt="Virsa Marketplace"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                            Virsa is your premier multi-vendor marketplace platform, connecting buyers with thousands of trusted sellers offering quality products.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-virsa-primary hover:bg-virsa-primary hover:text-white transition-all">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-virsa-primary hover:bg-virsa-primary hover:text-white transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-virsa-primary hover:bg-virsa-primary hover:text-white transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-virsa-primary hover:bg-virsa-primary hover:text-white transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link href="/about" className="text-gray-600 hover:text-virsa-primary transition-colors text-sm">About Us</Link></li>
                            <li><Link href="/contact" className="text-gray-600 hover:text-virsa-primary transition-colors text-sm">Contact Us</Link></li>
                            <li><Link href="/faq" className="text-gray-600 hover:text-virsa-primary transition-colors text-sm">FAQ</Link></li>
                            <li><Link href="/vendors/register" className="text-gray-600 hover:text-virsa-primary transition-colors text-sm">Become a Vendor</Link></li>
                            <li><Link href="/blog" className="text-gray-600 hover:text-virsa-primary transition-colors text-sm">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Customer Service</h3>
                        <ul className="space-y-3">
                            <li><Link href="/dashboard" className="text-gray-600 hover:text-virsa-primary transition-colors text-sm">My Account</Link></li>
                            <li><Link href="/dashboard/orders" className="text-gray-600 hover:text-virsa-primary transition-colors text-sm">Track Order</Link></li>
                            <li><Link href="/returns" className="text-gray-600 hover:text-virsa-primary transition-colors text-sm">Returns & Refunds</Link></li>
                            <li><Link href="/shipping" className="text-gray-600 hover:text-virsa-primary transition-colors text-sm">Shipping Info</Link></li>
                            <li><Link href="/terms" className="text-gray-600 hover:text-virsa-primary transition-colors text-sm">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Contact Info</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <MapPin className="w-5 h-5 text-virsa-primary mr-3 mt-0.5" />
                                <span className="text-gray-600 text-sm">123 Marketplace Blvd, Suite 100, Cityname, State 12345</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="w-5 h-5 text-virsa-primary mr-3" />
                                <span className="text-gray-600 text-sm">+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="w-5 h-5 text-virsa-primary mr-3" />
                                <span className="text-gray-600 text-sm">support@virsamarket.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
                    <p className="text-gray-500 text-sm text-center md:text-left mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} Virsa Marketplace. All rights reserved.
                    </p>
                    <div className="flex space-x-2">
                        <div className="h-8 w-12 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-gray-400">VISA</div>
                        <div className="h-8 w-12 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-gray-400">MC</div>
                        <div className="h-8 w-12 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-gray-400">PP</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
