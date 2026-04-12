"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, Lock, CheckCircle2, Store } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validation
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role: "customer",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
                setLoading(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
                <div className="max-w-md w-full text-center bg-white p-10 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                        Registration Successful!
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Your account has been created. Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
                {/* Decorative corners */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-virsa-light/50 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-virsa-secondary/20 rounded-full blur-2xl"></div>

                <div className="relative z-10 text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Join Virsa Marketplace and start browsing today
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
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="appearance-none relative block w-full px-4 py-3 pl-11 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                    placeholder="John Doe"
                                />
                                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                                Email address
                            </label>
                            <div className="relative">
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none relative block w-full px-4 py-3 pl-11 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                    placeholder="you@example.com"
                                />
                                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
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
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-4 py-3 pl-11 pr-12 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                    placeholder="Min. 8 characters"
                                />
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Must contain uppercase, number, and special character
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-4 py-3 pl-11 pr-12 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-virsa-primary focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                    placeholder="Re-enter password"
                                />
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-virsa-primary focus:ring-virsa-primary border-gray-300 rounded cursor-pointer"
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                            I agree to the{" "}
                            <Link href="/terms" className="font-medium text-virsa-primary hover:text-virsa-primary/80">
                                Terms & Conditions
                            </Link>
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-virsa-primary hover:bg-virsa-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-virsa-primary transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500 relative z-10">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-virsa-primary hover:text-virsa-primary/80 transition-colors">
                        Sign in
                    </Link>
                </p>

                <div className="mt-4 pt-4 border-t border-gray-200 relative z-10">
                    <p className="text-center text-sm text-gray-600 mb-3">
                        Want to sell on Virsa Marketplace?
                    </p>
                    <Link 
                        href="/vendors/register" 
                        className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-virsa-secondary/30 rounded-xl hover:border-virsa-secondary hover:bg-virsa-secondary/5 transition-all group w-full"
                    >
                        <div className="w-8 h-8 bg-virsa-secondary/20 rounded-full flex items-center justify-center group-hover:bg-virsa-secondary/30 transition-colors">
                            <Store className="w-4 h-4 text-virsa-dark" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold text-gray-900">Become a Vendor</div>
                            <div className="text-xs text-gray-500">Start selling your products</div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
