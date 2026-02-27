import { Search, Star, MapPin, Package, ExternalLink } from "lucide-react";
import Link from "next/link";

const vendors = [
    { id: 1, name: "Tech Haven PK", category: "Electronics", city: "Lahore", rating: 4.8, reviews: 1240, products: 320, badge: "Top Rated", tagline: "Your go-to tech destination in Pakistan" },
    { id: 2, name: "Fashion Hub", category: "Fashion & Clothing", city: "Karachi", rating: 4.6, reviews: 892, products: 580, badge: "Trending", tagline: "Latest trends from local & international brands" },
    { id: 3, name: "Electronics Pro", category: "Electronics", city: "Islamabad", rating: 4.7, reviews: 654, products: 210, badge: null, tagline: "Professional electronics for every need" },
    { id: 4, name: "Home Essentials", category: "Home & Kitchen", city: "Lahore", rating: 4.5, reviews: 421, products: 450, badge: null, tagline: "Everything you need for your home" },
    { id: 5, name: "Beauty Store", category: "Beauty & Health", city: "Karachi", rating: 4.9, reviews: 1089, products: 380, badge: "Top Rated", tagline: "Premium beauty products, delivered to your door" },
    { id: 6, name: "Sports World PK", category: "Sports & Outdoors", city: "Faisalabad", rating: 4.4, reviews: 234, products: 190, badge: null, tagline: "Gear up for every sport and activity" },
    { id: 7, name: "Kids Zone", category: "Toys & Kids", city: "Rawalpindi", rating: 4.7, reviews: 540, products: 270, badge: "Trusted", tagline: "Safe and fun products for your little ones" },
    { id: 8, name: "Book Nook", category: "Books & Stationery", city: "Lahore", rating: 4.9, reviews: 320, products: 840, badge: "Top Rated", tagline: "Thousands of titles, local & imported" },
];

export default function VendorsPage() {
    return (
        <div className="container mx-auto px-4 py-10">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Our Stores</h1>
                <p className="text-gray-500 max-w-xl mx-auto">Discover trusted local stores and vendors across Pakistan, all curated on one platform.</p>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search stores by name or category..." className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-virsa-primary focus:ring-2 focus:ring-virsa-primary/10 text-sm" />
                </div>
                <select className="px-4 py-3 border border-gray-200 rounded-2xl text-sm font-medium bg-white appearance-none focus:outline-none focus:border-virsa-primary cursor-pointer">
                    <option>All Categories</option>
                    <option>Electronics</option>
                    <option>Fashion</option>
                    <option>Home & Kitchen</option>
                    <option>Beauty & Health</option>
                    <option>Sports</option>
                </select>
            </div>

            {/* Vendor Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vendors.map((vendor) => (
                    <div key={vendor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col group overflow-hidden">
                        {/* Store Banner */}
                        <div className="h-24 bg-gradient-to-br from-virsa-primary/80 to-virsa-dark relative flex items-end p-4">
                            {vendor.badge && (
                                <span className="absolute top-3 right-3 bg-virsa-secondary text-virsa-primary text-[10px] font-bold px-2 py-1 rounded-full">
                                    {vendor.badge}
                                </span>
                            )}
                            {/* Avatar */}
                            <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-xl bg-white shadow-md border border-gray-100 flex items-center justify-center font-black text-virsa-primary text-xl">
                                {vendor.name[0]}
                            </div>
                        </div>

                        <div className="pt-8 px-4 pb-4 flex flex-col flex-1">
                            <div className="mb-3">
                                <h3 className="font-bold text-gray-900 leading-tight">{vendor.name}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{vendor.tagline}</p>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                                <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{vendor.rating} ({vendor.reviews.toLocaleString()})</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{vendor.city}</span>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                    <Package className="w-3 h-3" /> {vendor.products} Products
                                </span>
                                <span className="text-xs bg-virsa-light/50 text-virsa-primary px-2 py-1 rounded-full font-medium">{vendor.category}</span>
                            </div>

                            <Link href={`/vendor/${vendor.id}`} className="mt-auto w-full py-2.5 border-2 border-virsa-primary text-virsa-primary rounded-xl text-sm font-bold hover:bg-virsa-primary hover:text-white transition-colors flex items-center justify-center gap-2 group-hover:bg-virsa-primary group-hover:text-white">
                                Visit Store <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
