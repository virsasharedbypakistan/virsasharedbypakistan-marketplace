import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Facebook, Instagram, Twitter } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Page Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Get in Touch</h1>
                <p className="text-gray-500 max-w-lg mx-auto">Have a question or need assistance? We&apos;re here to help. Reach out and we&apos;ll get back to you as soon as possible.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                {/* Contact Info */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-virsa-primary/10 text-virsa-primary rounded-xl flex items-center justify-center mb-4">
                            <Phone className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                        <p className="text-sm text-gray-500 mb-2">Mon – Fri, 9am – 6pm PKT</p>
                        <a href="tel:+92300000000" className="text-virsa-primary font-bold text-sm hover:underline">+92 300 000 0000</a>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                        <p className="text-sm text-gray-500 mb-2">We&apos;ll reply within 24 hours</p>
                        <a href="mailto:support@virsa.pk" className="text-virsa-primary font-bold text-sm hover:underline">support@virsa.pk</a>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Visit Us</h3>
                        <p className="text-sm text-gray-500">Office 42, Tech Tower, MM Alam Road, Lahore, Punjab, Pakistan</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Working Hours</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between">
                                <span>Monday – Friday</span>
                                <span className="font-bold">9:00am – 6:00pm</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Saturday</span>
                                <span className="font-bold">10:00am – 3:00pm</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Sunday</span>
                                <span>Closed</span>
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Follow Us</h3>
                        <div className="flex gap-3">
                            <a href="#" className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white hover:bg-sky-600 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-virsa-primary/10 text-virsa-primary flex items-center justify-center">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Send a Message</h2>
                    </div>

                    <form className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                <input type="text" placeholder="Ahmed Ali" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                <input type="email" placeholder="ahmed@example.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number (optional)</label>
                            <input type="tel" placeholder="+92 300 000 0000" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary transition-all" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                            <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary bg-white appearance-none cursor-pointer transition-all">
                                <option>General Inquiry</option>
                                <option>Order Issue</option>
                                <option>Return / Refund Request</option>
                                <option>Become a Vendor</option>
                                <option>Technical Support</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                            <textarea rows={6} placeholder="Tell us how we can help you..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary/20 focus:border-virsa-primary resize-none transition-all"></textarea>
                        </div>

                        <button type="button" className="w-full py-3.5 bg-virsa-primary text-white rounded-xl font-bold hover:bg-virsa-dark transition-colors flex items-center justify-center gap-2 shadow-md shadow-virsa-primary/20 text-base">
                            <Send className="w-5 h-5" /> Send Message
                        </button>

                        <p className="text-center text-xs text-gray-400">By submitting this form, you agree to our Privacy Policy. We do not share your data with third parties.</p>
                    </form>
                </div>
            </div>
        </div>
    );
}
