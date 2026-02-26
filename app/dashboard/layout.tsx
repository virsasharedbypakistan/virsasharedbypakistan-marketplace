import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Heart, Star, Settings, LogOut } from "lucide-react";

export default function CustomerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Orders", href: "/dashboard/orders", icon: ShoppingBag },
        { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
        { name: "My Reviews", href: "/dashboard/reviews", icon: Star },
        { name: "Account Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 sticky top-24">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full bg-virsa-primary text-white flex items-center justify-center text-xl font-bold shadow-md">
                                AD
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">Alex Doe</h2>
                                <p className="text-xs text-gray-500">alex@example.com</p>
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
                                <Link
                                    href="/login"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </Link>
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
