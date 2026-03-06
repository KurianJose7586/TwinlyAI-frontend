"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail, Lock, Check, Loader2, Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/context/AuthContext";
import { BotService } from "@/services/bot.service";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, setAuthFromToken, user, isLoading: authLoading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Validate email format
    const validateEmail = (val: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (val && !emailRegex.test(val)) {
            setEmailError("Please enter a valid email address.");
        } else {
            setEmailError(null);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEmail(val);
        validateEmail(val);
    };

    // Handle OAuth callback: ?token=...
    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            setAuthFromToken(token);
            // Clear the token from URL cleanly
            router.replace("/login");
        }
    }, [searchParams, setAuthFromToken, router]);

    // If user is already logged in, redirect them away
    useEffect(() => {
        if (!authLoading && user) {
            if (user.role === "recruiter") {
                router.push("/recruiter");
            } else {
                BotService.getBots().then((bots) => {
                    // If they have a bot and it has some data (like summary or skills from resume index)
                    if (bots.length > 0 && (bots[0].summary || (bots[0].skills && bots[0].skills.length > 0))) {
                        router.push("/candidate-active");
                    } else {
                        router.push("/candidate-empty");
                    }
                }).catch(() => {
                    router.push("/candidate-empty");
                });
            }
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }
        if (emailError) {
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await login(email, password);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
                "Login failed. Please check your credentials.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-24 bg-slate-100 dark:bg-[#0B0E14] transition-colors duration-300 relative overflow-hidden font-sans">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-100 transition-opacity duration-300">
                {/* Dark Mode Color Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px] hidden dark:block" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] hidden dark:block" />

                {/* Floating Avatars (Visible in Light & Dark Mode) */}
                <div className="absolute top-[15%] left-[5%] w-48 h-64 animate-[float_11s_ease-in-out_infinite] hidden lg:block opacity-50 dark:opacity-20">
                    <img src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Bailey&face=smile&backgroundColor=transparent" alt="Decoration" className="w-full h-full object-contain drop-shadow-xl dark:invert blur-[1px]" />
                </div>
                <div className="absolute bottom-[25%] right-[5%] w-36 h-48 animate-[float_9s_ease-in-out_infinite_1.5s] hidden lg:block opacity-60 dark:opacity-30">
                    <img src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Simon&face=smile&backgroundColor=transparent" alt="Decoration" className="w-full h-full object-contain drop-shadow-2xl dark:invert" />
                </div>
            </div>

            <Navbar />

            <main className="w-full max-w-lg relative z-10">
                {/* Premium White Panel */}
                <div className="bg-white dark:bg-[#161B22] border border-white dark:border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-2xl transition-all duration-300 relative overflow-hidden">
                    {/* Subtle Inner Glow */}
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white dark:via-white/20 to-transparent"></div>
                    <div className="absolute -inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-[2.5rem] dark:from-white/5"></div>

                    <div className="flex flex-col items-center text-center mb-10 relative z-10">
                        <Link href="/" className="mb-6 hover:scale-105 transition-transform duration-300">
                            <Image src="/butterfly.svg" alt="TwinlyAI" width={56} height={56} className="w-14 h-14" />
                        </Link>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-[#F9FAFB] mb-3">
                            Welcome back
                        </h1>
                        <p className="text-slate-500 dark:text-[#9CA3AF] text-base max-w-xs leading-relaxed">
                            Sign in to manage your AI twin and access your professional insights.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Google OAuth */}
                        <a
                            href={`${API_BASE}/api/v1/oauth/login/google`}
                            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#F9FAFB] px-6 py-4 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-[#22272E] transition-all duration-300 shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </a>

                        {/* GitHub OAuth */}
                        <a
                            href={`${API_BASE}/api/v1/oauth/login/github`}
                            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#F9FAFB] px-6 py-4 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-[#22272E] transition-all duration-300 shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.37.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.74-1.33-1.74-1.08-.74.08-.73.08-.73 1.2.08 1.83 1.23 1.83 1.23 1.06 1.82 2.79 1.3 3.47.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            Continue with GitHub
                        </a>

                        <div className="relative py-4 flex items-center">
                            <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                            <span className="flex-shrink mx-4 text-slate-400 dark:text-[#57606A] text-[10px] font-bold uppercase tracking-widest">Or login with email</span>
                            <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-2xl">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 dark:text-[#57606A] group-focus-within:text-blue-600 dark:group-focus-within:text-purple-400 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Work email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    onBlur={(e) => validateEmail(e.target.value)}
                                    required
                                    className={`w-full bg-slate-50 dark:bg-[#1C2128] border text-slate-900 dark:text-[#F9FAFB] pl-12 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 dark:placeholder:text-[#57606A] ${emailError
                                        ? "border-red-400 focus:ring-red-500/20 focus:border-red-500"
                                        : "border-slate-200 dark:border-white/10 focus:ring-blue-500/10 dark:focus:ring-purple-500/20 focus:border-blue-500 dark:focus:border-purple-400"
                                        }`}
                                />
                            </div>
                            {emailError && (
                                <p className="text-red-500 text-xs px-2 mt-1">{emailError}</p>
                            )}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 dark:text-[#57606A] group-focus-within:text-blue-600 dark:group-focus-within:text-purple-400 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-[#1C2128] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#F9FAFB] pl-12 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:focus:ring-purple-500/20 focus:border-blue-500 dark:focus:border-purple-400 transition-all placeholder:text-slate-400 dark:placeholder:text-[#57606A]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${rememberMe ? "bg-blue-600 dark:bg-purple-600 border-blue-600 dark:border-purple-600" : "border-slate-300 dark:border-white/20 bg-white dark:bg-[#1C2128]"}`}>
                                        <Check size={10} className={`text-white transition-opacity ${rememberMe ? "opacity-100" : "opacity-0"}`} />
                                    </div>
                                    <span className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF]">Remember me</span>
                                </label>
                                <button onClick={(e) => { e.preventDefault(); alert("Password recovery flow coming soon."); }} className="text-xs font-bold text-blue-600 dark:text-purple-400 hover:underline underline-offset-4 cursor-pointer border-0 bg-transparent p-0 m-0 focus:outline-none">
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 dark:bg-purple-600 text-white px-6 py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 dark:shadow-purple-500/20 flex items-center justify-center group mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-10 text-center relative z-10">
                        <p className="text-slate-500 dark:text-[#9CA3AF] text-sm font-medium">
                            {"Don't have an account?"}
                            <Link href="/role-selection" className="text-blue-600 dark:text-purple-400 font-bold hover:text-blue-700 dark:hover:text-purple-300 transition-colors ml-1.5 hover:underline underline-offset-4 decoration-2">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-center items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-slate-300 dark:text-white/20 font-medium flex-wrap">
                    <button onClick={() => alert("Privacy Policy coming soon.")} className="hover:text-white dark:hover:text-white/40 transition-colors bg-transparent border-0 p-0 cursor-pointer uppercase tracking-widest font-medium">Privacy Policy</button>
                    <button onClick={() => alert("Terms of Service coming soon.")} className="hover:text-white dark:hover:text-white/40 transition-colors bg-transparent border-0 p-0 cursor-pointer uppercase tracking-widest font-medium">Terms of Service</button>
                    <span>© 2025 TwinlyAI</span>
                </div>
            </main >
        </div >
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0B0E14]"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
