import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Truck, TrendingUp, ShoppingCart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-virsa-primary text-white overflow-hidden">
        {/* Real hero background image */}
        <Image src="/hero_banner.png" alt="Virsa Marketplace - Discover Premium Products" fill className="object-cover object-center" priority quality={90} />
        <div className="absolute inset-0 bg-gradient-to-r from-virsa-primary/90 via-virsa-primary/70 to-virsa-primary/40 z-10"></div>

        <div className="container mx-auto px-4 py-28 md:py-40 relative z-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-xs font-bold mb-8 tracking-widest uppercase shadow-xl">
              <span className="w-2 h-2 rounded-full bg-virsa-secondary animate-pulse"></span>
              100% Secure Marketplace
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-virsa-light">
              Discover Authentic Products From Trusted Vendors
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-2xl font-light leading-relaxed">
              Shop thousands of high-quality items across multiple categories with buyer protection guaranteed every step of the way.
            </p>
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

      {/* Top Categories */}
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
            {[
              { name: "Electronics", image: "/cat_electronics.png", count: "1.2k+" },
              { name: "Fashion", image: "/cat_fashion.png", count: "3.5k+" },
              { name: "Home & Garden", image: "/cat_home.png", count: "800+" },
              { name: "Beauty", image: "/cat_beauty.png", count: "1.5k+" },
              { name: "Sports", image: "/cat_sports.png", count: "650+" },
              { name: "Toys", image: "/cat_electronics.png", count: "900+" },
            ].map((cat) => (
              <Link href={`/products?category=${cat.name.toLowerCase()}`} key={cat.name} className="bg-white rounded-[24px] p-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 group hover:-translate-y-2">
                <div className="w-20 h-20 mx-auto rounded-[20px] overflow-hidden mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-gray-100 relative">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-virsa-primary transition-colors text-sm">{cat.name}</h3>
                <p className="text-xs font-medium text-gray-400 bg-gray-50 inline-block px-3 py-1 rounded-full">{cat.count} items</p>
              </Link>
            ))}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: 1, name: "Premium Wireless Headphones Pro", price: "Rs 19,999", oldPrice: "Rs 24,999", image: "/product_headphones.png", badge: "SALE 20%", rating: 5, reviews: 124, vendor: "Tech Haven" },
              { id: 2, name: "Mechanical Keyboard RGB Edition", price: "Rs 12,999", oldPrice: null, image: "/product_keyboard.png", badge: "NEW ARRIVAL", rating: 5, reviews: 86, vendor: "GamerZ Pro" },
              { id: 3, name: "Smart Watch Premium Black", price: "Rs 29,999", oldPrice: null, image: "/product_watch.png", badge: null, rating: 5, reviews: 212, vendor: "Tech Haven" },
              { id: 4, name: "Premium Running Sneakers X1", price: "Rs 8,999", oldPrice: "Rs 11,999", image: "/product_sneakers.png", badge: "SALE", rating: 5, reviews: 58, vendor: "StyleMates" },
            ].map((item) => (
              <div key={item.id} className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 group hover:-translate-y-1">
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <Image src={item.image} alt={item.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                    {item.badge && <span className="bg-virsa-danger text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">{item.badge}</span>}
                  </div>
                  <button className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center justify-center text-gray-900 hover:bg-virsa-primary hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 z-20">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5">
                  <div className="text-xs font-semibold tracking-wider text-virsa-primary mb-2 uppercase">{item.vendor}</div>
                  <Link href={`/product/${item.id}`}>
                    <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 hover:text-virsa-primary cursor-pointer leading-tight">{item.name}</h3>
                  </Link>
                  <div className="flex items-center mb-3">
                    <div className="flex text-virsa-secondary">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-500 ml-2">({item.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <span className="text-xl font-black text-gray-900">{item.price}</span>
                    {item.oldPrice && <span className="text-xs font-medium text-gray-400 line-through">{item.oldPrice}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Vendors */}
      <section className="py-20 md:py-32 bg-gray-50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-virsa-light/20 blur-3xl -skew-x-12 transform origin-top"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Our Top Vendors</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Discover unique products from our highest-rated independent stores and trusted brands.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 pt-10">
            {[
              { id: 1, name: "Tech Haven Official", rating: "4.9", count: "245", logo: "/vendor_logo_1.png", products: ["/product_headphones.png", "/product_keyboard.png", "/product_watch.png"], desc: "Specializing in high-end electronics, premium gadgets, and exclusive accessories with verified authenticity." },
              { id: 2, name: "StyleMates Boutique", rating: "4.8", count: "188", logo: "/vendor_logo_2.png", products: ["/product_sneakers.png", "/cat_fashion.png", "/product_backpack.png"], desc: "Curated fashion collections featuring the latest trends for men and women from around the world." },
              { id: 3, name: "Home Luxe Store", rating: "4.7", count: "132", logo: "/vendor_logo_1.png", products: ["/cat_home.png", "/cat_beauty.png", "/product_backpack.png"], desc: "Premium home decor, kitchen essentials, and lifestyle products for the modern home." },
            ].map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 relative mt-16 md:mt-0 group hover:-translate-y-2">
                <div className="w-32 h-32 absolute -top-16 left-1/2 -translate-x-1/2 rounded-[24px] bg-white flex items-center justify-center p-2 shadow-[0_10px_30px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-300 rotate-3 group-hover:rotate-0 overflow-hidden">
                  <div className="w-full h-full rounded-[16px] relative overflow-hidden">
                    <Image src={vendor.logo} alt={vendor.name} fill className="object-cover" />
                  </div>
                </div>
                <div className="pt-16 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{vendor.name}</h3>
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex bg-virsa-secondary/10 px-3 py-1 rounded-full items-center">
                      <Star className="w-4 h-4 fill-virsa-warning text-virsa-warning" />
                      <span className="font-bold ml-1.5 text-sm text-gray-900">{vendor.rating} · {vendor.count} products</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-6 leading-relaxed px-2">{vendor.desc}</p>
                  <div className="flex justify-center gap-2 mb-6">
                    {vendor.products.map((img, i) => (
                      <div key={i} className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 relative overflow-hidden hover:border-virsa-primary/30 transition-colors cursor-pointer">
                        <Image src={img} alt="product" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <Link href={`/vendor/${vendor.id}`} className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl border-2 border-virsa-primary text-virsa-primary font-bold hover:bg-virsa-primary hover:text-white transition-all duration-300">
                    Visit Store <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-virsa-primary/80 to-gray-900 z-0 opacity-90"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
        {/* Subtle glowing orbs */}
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
