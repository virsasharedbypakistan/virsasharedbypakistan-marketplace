import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Package, DollarSign, ArrowDownToLine, Settings, LogOut, Store } from "lucide-react";

export default function VendorDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        { name: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
        { name: "Products", href: "/vendor/dashboard/products", icon: Package },
        { name: "Orders", href: "/vendor/dashboard/orders", icon: ShoppingBag },
        { name: "Earnings", href: "/vendor/dashboard/earnings", icon: DollarSign },
        { name: "Withdrawals", href: "/vendor/dashboard/withdrawals", icon: ArrowDownToLine },
        { name: "Settings", href: "/vendor/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-[calc(100vh-140px)] bg-gray-50/50">
            {/* Vendor Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
                <div className="h-full flex flex-col pt-6 pb-4">
                    <div className="px-6 mb-8 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-virsa-secondary/20 flex items-center justify-center text-virsa-primary">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 leading-tight">Vendor Portal</h2>
                            <p className="text-xs text-green-600 font-medium bg-green-50 inline-block px-2 py-0.5 rounded-full mt-1">Active</p>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-virsa-primary hover:text-white transition-colors group"
                            >
                                <item.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" opacity={0.8} />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="px-4 pt-4 border-t border-gray-100">
                        <Link
                            href="/login"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <LogOut className="w-5 h-5 text-gray-400" />
                            Switch Account
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 flex flex-col">
                {/* Vendor Topbar (Mobile only) */}
                <header className="bg-white border-b border-gray-200 px-4 py-4 md:hidden flex justify-between items-center">
                    <h2 className="font-bold text-virsa-primary">Vendor Portal</h2>
                    <button className="p-2 text-gray-600 bg-gray-50 rounded-lg">
                        <Store className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
