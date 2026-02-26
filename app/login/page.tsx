"use client";

import Link from "next/link";
import { ArrowRight, User, ShoppingBag, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
                {/* Decorative corner */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-virsa-light/50 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-virsa-secondary/20 rounded-full blur-2xl"></div>

                <div className="relative z-10 text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to access your account dashboard
                    </p>
                </div>

                <form className="mt-8 space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-virsa-primary focus:ring-virsa-primary border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-virsa-primary hover:text-virsa-primary/80 transition-colors">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-virsa-primary hover:bg-virsa-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-virsa-primary transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Sign in
                        </button>
                    </div>
                </form>

                <div className="mt-10 relative z-10">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">Demo Access - Choose Role</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3">
                        <Link
                            href="/dashboard"
                            className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-virsa-primary/30 transition-all group"
                        >
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-blue-600">
                                    <User className="w-4 h-4" />
                                </div>
                                Customer Dashboard
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-virsa-primary group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link
                            href="/vendor/dashboard"
                            className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-virsa-primary/30 transition-all group"
                        >
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mr-3 text-emerald-600">
                                    <ShoppingBag className="w-4 h-4" />
                                </div>
                                Vendor Dashboard
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-virsa-primary group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link
                            href="/admin/dashboard"
                            className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-virsa-primary/30 transition-all group"
                        >
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mr-3 text-purple-600">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                Admin Dashboard
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-virsa-primary group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-gray-500 relative z-10">
                    Not a member?{' '}
                    <Link href="/register" className="font-semibold text-virsa-primary hover:text-virsa-primary/80 transition-colors">
                        Sign up now
                    </Link>
                </p>
            </div>
        </div>
    );
}
