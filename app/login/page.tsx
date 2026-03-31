"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Store } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const supabase = createClient();
            
            // Sign in with Supabase Auth
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                console.error('Sign in error:', signInError);
                setError(signInError.message);
                setLoading(false);
                return;
            }

            if (!data.user) {
                setError('Login failed - no user data returned');
                setLoading(false);
                return;
            }

            console.log('User signed in:', data.user.id);

            // Wait a moment for the session to be established
            await new Promise(resolve => setTimeout(resolve, 500));

            // Get user role from users table
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role, full_name, is_banned')
                .eq('id', data.user.id)
                .single();

            if (userError) {
                console.error('User data fetch error:', userError);
                setError(`Failed to fetch user data: ${userError.message}`);
                setLoading(false);
                return;
            }

            if (!userData) {
                setError('User profile not found in database');
                setLoading(false);
                return;
            }

            if (userData.is_banned) {
                setError('Your account has been suspended. Please contact support.');
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            console.log('User data:', userData);

            // Redirect based on role
            const role = userData.role;
            if (role === 'admin') {
                router.push('/admin/dashboard');
            } else if (role === 'vendor') {
                router.push('/vendor/dashboard');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            console.error('Login exception:', err);
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setGuestLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/guest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to start guest session");
                return;
            }

            router.push("/products");
        } catch (err) {
            console.error("Guest login error:", err);
            setError("Failed to start guest session");
        } finally {
            setGuestLoading(false);
        }
    };

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

                <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
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

                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={loading || guestLoading}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-virsa-primary hover:bg-virsa-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-virsa-primary transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                        <button
                            type="button"
                            onClick={handleGuestLogin}
                            disabled={loading || guestLoading}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-gray-200 text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-virsa-primary transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {guestLoading ? 'Starting guest session...' : 'Continue as Guest'}
                        </button>
                    </div>
                </form>



                <p className="mt-8 text-center text-sm text-gray-500 relative z-10">
                    Not a member?
                </p>
                
                <div className="mt-4 grid grid-cols-2 gap-3 relative z-10">
                    <Link 
                        href="/register" 
                        className="flex flex-col items-center justify-center py-4 px-4 border-2 border-virsa-primary/20 rounded-xl hover:border-virsa-primary hover:bg-virsa-primary/5 transition-all group"
                    >
                        <div className="w-10 h-10 bg-virsa-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-virsa-primary/20 transition-colors">
                            <User className="w-5 h-5 text-virsa-primary" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">Sign up as Customer</span>
                        <span className="text-xs text-gray-500 mt-0.5">Start shopping</span>
                    </Link>
                    
                    <Link 
                        href="/vendors/register" 
                        className="flex flex-col items-center justify-center py-4 px-4 border-2 border-virsa-secondary/30 rounded-xl hover:border-virsa-secondary hover:bg-virsa-secondary/5 transition-all group"
                    >
                        <div className="w-10 h-10 bg-virsa-secondary/20 rounded-full flex items-center justify-center mb-2 group-hover:bg-virsa-secondary/30 transition-colors">
                            <Store className="w-5 h-5 text-virsa-dark" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">Sign up as Vendor</span>
                        <span className="text-xs text-gray-500 mt-0.5">Sell products</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
