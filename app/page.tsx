"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Truck, TrendingUp, ShoppingCart } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  thumbnail_url: string | null;
  average_rating: number;
  total_reviews: number;
  vendors: { store_name: string };
};

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  product_count: number;
};

type Vendor = {
  id: string;
  store_name: string;
  store_slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  average_rating: number;
  total_reviews: number;
  product_count: number;
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredVendors, setFeaturedVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, vendorsRes] = await Promise.all([
          fetch("/api/products?homepage=true&limit=6"),
          fetch("/api/categories?limit=6"),
          fetch("/api/vendors?homepage=true&limit=4"),
        ]);

        if (productsRes.ok) {
          const data = await productsRes.json();
          setFeaturedProducts(data.data || []);
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.data || []);
        }

        if (vendorsRes.ok) {
          const data = await vendorsRes.json();
          const vendorList = data.data?.data || data.data || [];
          setFeaturedVendors(vendorList);
        }
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-gray-100 text-white overflow-hidden h-[400px] md:h-[500px] lg:h-[600px]">
        <Image src="/hero_banner.jpeg" alt="Virsa Marketplace" fill className="object-cover object-top" priority quality={90} />

        <div className="absolute inset-0 flex items-end pb-12 md:pb-16 z-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/products" className="bg-gradient-to-r from-virsa-secondary to-virsa-accent hover:from-virsa-accent hover:to-virsa-secondary text-virsa-primary font-bold py-4 px-10 rounded-full transition-all duration-300 flex items-center justify-center group shadow-[0_8px_30px_rgba(255,210,66,0.3)] hover:shadow-[0_8px_40px_rgba(255,210,66,0.5)] hover:-translate-y-1">
                Start Shopping
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link href="/vendors" className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-bold py-4 px-10 rounded-full border border-white/20 transition-all duration-300 flex items-center justify-center hover:-translate-y-1">
                Browse Stores
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 bg-white relative z-30 -mt-10 mx-4 md:mx-auto md:max-w-6xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex items-center gap-5 pt-4 md:pt-0 md:pl-0">
              <div className="w-14 h-14 rounded-2xl bg-virsa-light/50 flex items-center justify-center text-virsa-primary flex-shrink-0 shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Secure Payments</h3>
                <p className="text-sm text-gray-500 mt-1">100% protected transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-5 pt-8 md:pt-0 md:pl-8">
              <div className="w-14 h-14 rounded-2xl bg-virsa-light/50 flex items-center justify-center text-virsa-primary flex-shrink-0 shadow-inner">
                <Truck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Reliable Shipping</h3>
                <p className="text-sm text-gray-500 mt-1">Fast delivery from vendors</p>
              </div>
            </div>
            <div className="flex items-center gap-5 pt-8 md:pt-0 md:pl-8">
              <div className="w-14 h-14 rounded-2xl bg-virsa-light/50 flex items-center justify-center text-virsa-primary flex-shrink-0 shadow-inner">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Quality Guaranteed</h3>
                <p className="text-sm text-gray-500 mt-1">Verified authentic products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-20 md:py-32 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Shop by Category</h2>
              <p className="text-gray-500 text-lg">Find exactly what you&apos;re looking for</p>
            </div>
            <Link href="/categories" className="inline-flex text-virsa-primary font-bold hover:text-virsa-primary/80 transition-colors items-center group bg-virsa-primary/5 px-6 py-3 rounded-full">
              View All Categories <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-[24px] p-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 animate-pulse">
                  <div className="w-20 h-20 mx-auto rounded-[20px] bg-gray-200 mb-5" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto" />
                </div>
              ))
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <Link href={`/products?category=${cat.slug}`} key={cat.id} className="bg-white rounded-[24px] p-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 group hover:-translate-y-2">
                  <div className="w-20 h-20 mx-auto rounded-[20px] overflow-hidden mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-gray-100 relative">
                    <Image src={cat.image_url || "/cat_electronics.png"} alt={cat.name} fill className="object-cover" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-virsa-primary transition-colors text-sm">{cat.name}</h3>
                  <p className="text-xs font-medium text-gray-400 bg-gray-50 inline-block px-3 py-1 rounded-full">{cat.product_count}+ items</p>
                </Link>
              ))
            ) : (
              <div className="col-span-6 text-center py-10 text-gray-400">No categories available</div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Featured Products</h2>
              <p className="text-gray-500 text-lg">Handpicked trending items from our top vendors</p>
            </div>
            <Link href="/products?featured=true" className="inline-flex text-virsa-primary font-bold hover:text-virsa-primary/80 transition-colors items-center group bg-virsa-primary/5 px-6 py-3 rounded-full">
              View All Products <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-20" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-6 bg-gray-200 rounded w-28" />
                  </div>
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((item) => {
                const effectivePrice = item.sale_price || item.price;
                const hasDiscount = item.sale_price && item.sale_price < item.price;
                const discountPercent = hasDiscount ? Math.round(((item.price - item.sale_price!) / item.price) * 100) : 0;

                return (
                  <div key={item.id} className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 group hover:-translate-y-1">
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      <Image src={item.thumbnail_url || "/product_headphones.png"} alt={item.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                        {hasDiscount && <span className="bg-virsa-danger text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">SALE {discountPercent}%</span>}
                      </div>
                      <Link href={`/product/${item.id}`} className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center justify-center text-gray-900 hover:bg-virsa-primary hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 z-20">
                        <ShoppingCart className="w-5 h-5" />
                      </Link>
                    </div>
                    <div className="p-5">
                      <div className="text-xs font-semibold tracking-wider text-virsa-primary mb-2 uppercase">{item.vendors.store_name}</div>
                      <Link href={`/product/${item.id}`}>
                        <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 hover:text-virsa-primary cursor-pointer leading-tight">{item.name}</h3>
                      </Link>
                      <div className="flex items-center mb-3">
                        <div className="flex text-virsa-secondary">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(item.average_rating) ? "fill-current" : "text-gray-200"}`} />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-gray-500 ml-2">({item.total_reviews})</span>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <span className="text-xl font-black text-gray-900">Rs {effectivePrice.toLocaleString()}</span>
                        {hasDiscount && <span className="text-xs font-medium text-gray-400 line-through">Rs {item.price.toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-10 text-gray-400">No featured products available</div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Stores */}
      <section className="py-20 md:py-32 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Featured Stores</h2>
              <p className="text-gray-500 text-lg">Top-rated vendors you can trust</p>
            </div>
            <Link href="/vendors" className="inline-flex text-virsa-primary font-bold hover:text-virsa-primary/80 transition-colors items-center group bg-virsa-primary/5 px-6 py-3 rounded-full">
              View All Stores <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-pulse">
                  <div className="h-24 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="w-20 h-20 rounded-xl bg-gray-200 -mt-12 mb-2" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              ))
            ) : featuredVendors.length > 0 ? (
              featuredVendors.map((vendor) => (
                <Link href={`/vendor/${vendor.id}`} key={vendor.id} className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 group hover:-translate-y-1">
                  {/* Banner */}
                  <div className="relative h-24 bg-gradient-to-r from-virsa-primary to-virsa-primary/80">
                    {vendor.banner_url && (
                      <Image src={vendor.banner_url} alt={vendor.store_name} fill className="object-cover" />
                    )}
                  </div>
                  
                  {/* Logo */}
                  <div className="relative px-5 -mt-10">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white bg-white shadow-md">
                      <Image src={vendor.logo_url || "/cat_electronics.png"} alt={vendor.store_name} width={80} height={80} className="object-cover" />
                    </div>
                  </div>

                  <div className="p-5 pt-2">
                    <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-virsa-primary transition-colors">{vendor.store_name}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{vendor.description || "Quality products from a trusted seller"}</p>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex text-virsa-secondary">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(vendor.average_rating) ? "fill-current" : "text-gray-200"}`} />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-gray-500 ml-2">({vendor.total_reviews})</span>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600">{vendor.product_count} products</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center py-10 text-gray-400">No featured stores available</div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-virsa-primary/80 to-gray-900 z-0 opacity-90"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-virsa-secondary/20 rounded-full blur-[100px] mix-blend-screen z-0"></div>

        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-bold mb-6 tracking-widest uppercase">
            Grow With Us
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Ready to sell your products?</h2>
          <p className="text-xl text-gray-200 mb-10 leading-relaxed font-light">
            Join thousands of vendors who are successfully growing their businesses on Virsa Marketplace. Reach a global audience today.
          </p>
          <Link href="/vendors/register" className="inline-flex bg-gradient-to-r from-virsa-secondary to-virsa-accent hover:from-virsa-accent hover:to-virsa-secondary text-virsa-primary font-bold py-5 px-12 rounded-full text-lg transition-all duration-300 shadow-[0_0_30px_rgba(255,210,66,0.2)] hover:shadow-[0_0_40px_rgba(255,210,66,0.4)] hover:-translate-y-1 items-center justify-center">
            Become a Vendor Today
          </Link>
        </div>
      </section>
    </div>
  );
}
