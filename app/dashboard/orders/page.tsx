import { Package, Truck, CheckCircle2, ChevronRight, Search, Filter } from "lucide-react";
import Link from "next/link";

export default function CustomerOrdersPage() {
    const orders = [
        {
            id: "ORD-1847291",
            date: "Oct 15, 2023",
            status: "Delivered",
            total: 199.99,
            items: [
                {
                    name: "Premium Wireless Noise-Cancelling Headphones Pro",
                    seller: "Tech Haven Official",
                    qty: 1,
                    price: 199.99,
                    image: "/placeholder-headphone.jpg"
                }
            ]
        },
        {
            id: "ORD-1847290",
            date: "Oct 12, 2023",
            status: "Shipped",
            total: 350.50,
            items: [
                {
                    name: "Mechanical Keyboard - RGB Backlit",
                    seller: "Gamer Gear",
                    qty: 1,
                    price: 150.00,
                    image: "/placeholder-keyboard.jpg"
                },
                {
                    name: "Ergonomic Mouse",
                    seller: "Gamer Gear",
                    qty: 1,
                    price: 200.50,
                    image: "/placeholder-mouse.jpg"
                }
            ]
        },
        {
            id: "ORD-1847285",
            date: "Sep 28, 2023",
            status: "Processing",
            total: 45.00,
            items: [
                {
                    name: "Minimalist Desk Lamp",
                    seller: "Home Decor Co",
                    qty: 1,
                    price: 45.00,
                    image: "/placeholder-lamp.jpg"
                }
            ]
        }
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Delivered":
                return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "Shipped":
                return "bg-blue-50 text-blue-600 border-blue-100";
            case "Processing":
                return "bg-amber-50 text-amber-600 border-amber-100";
            default:
                return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Delivered":
                return <CheckCircle2 className="w-4 h-4 mr-1.5" />;
            case "Shipped":
                return <Truck className="w-4 h-4 mr-1.5" />;
            case "Processing":
                return <Package className="w-4 h-4 mr-1.5" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Orders</h1>

                {/* Search & Filter */}
                <div className="flex items-center gap-3">
                    <div className="relative relative-group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filter</span>
                    </button>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                        {/* Order Header */}
                        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Order Placed</p>
                                    <p className="text-sm font-medium text-gray-900">{order.date}</p>
                                </div>
                                <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Total</p>
                                    <p className="text-sm font-medium text-gray-900">Rs {order.total.toFixed(2)}</p>
                                </div>
                                <div className="sm:hidden w-full"></div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Order #</p>
                                    <p className="text-sm font-medium text-gray-900">{order.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href={`/dashboard/orders/${order.id}`} className="text-sm font-bold text-virsa-primary hover:underline">
                                    View Details
                                </Link>
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="divide-y divide-gray-50">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 border border-gray-200 overflow-hidden relative">
                                        {/* Placeholder for image */}
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            <Package className="w-8 h-8 opacity-20" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">{item.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">Sold by: {item.seller}</p>
                                        <div className="flex items-center gap-4">
                                            <p className="font-bold text-gray-900">Rs {item.price.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                        </div>
                                    </div>

                                    <div className="w-full sm:w-auto flex flex-col gap-2 mt-4 sm:mt-0">
                                        <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-virsa-primary hover:bg-virsa-primary/90 transition-colors shadow-sm">
                                            Track Package
                                        </button>
                                        {order.status === "Delivered" && (
                                            <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                                Write Review
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Placeholder */}
            <div className="flex items-center justify-center pt-4">
                <nav className="flex items-center gap-2">
                    <button className="p-2 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed">
                        <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-virsa-primary text-white text-sm font-bold flex items-center justify-center">1</button>
                    <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium flex items-center justify-center transition-colors">2</button>
                    <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium flex items-center justify-center transition-colors">3</button>
                    <button className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </nav>
            </div>
        </div>
    );
}
