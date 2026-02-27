import Link from "next/link";
import { CopyPlus, Store, Users, ShoppingBag, LineChart, Settings, LogOut, Bell, Search } from "lucide-react";

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        { name: "Dashboard", href: "/admin/dashboard", icon: CopyPlus },
        { name: "Vendors", href: "/admin/dashboard/vendors", icon: Store },
        { name: "Customers", href: "/admin/dashboard/customers", icon: Users },
        { name: "All Orders", href: "/admin/dashboard/orders", icon: ShoppingBag },
        { name: "Earnings", href: "/admin/dashboard/earnings", icon: LineChart },
        { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Admin Sidebar */}
            <aside className="w-[280px] bg-white border-r border-[#E2E8F0] flex flex-col hidden lg:flex relative z-20">
                <div className="p-6">
                    <h1 className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[#47704C] flex justify-center items-center text-white text-sm">VM</span>
                        Virsa Admin
                    </h1>
                </div>

                <div className="px-4 py-2">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 px-3">Management</p>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-[#E2E8F0]">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                            <div>
                                <p className="text-sm font-bold text-[#0F172A]">Super Admin</p>
                                <p className="text-xs font-medium text-[#64748B]">admin@virsa.com</p>
                            </div>
                        </div>
                    </div>
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-[#EF4444] bg-[#FEF2F2] hover:bg-[#FEE2E2] transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Admin Header */}
                <header className="h-[72px] bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between shrink-0 z-10">
                    <div className="flex items-center w-full max-w-xl">
                        <div className="relative w-full">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                            <input
                                type="text"
                                placeholder="Search vendors, users, orders..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F1F5F9] border-none focus:ring-2 focus:ring-[#47704C]/50 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-full hover:bg-[#F1F5F9] transition-colors text-[#64748B]">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white"></span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
