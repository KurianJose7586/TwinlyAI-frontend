"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Brain, Search, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { setToken, setStoredUser, decodeTokenPayload } from "@/lib/auth";

function RoleSelectionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuthFromToken } = useAuth();

    const [oauthToken, setOauthToken] = useState<string | null>(null);
    const [selectingRole, setSelectingRole] = useState<"candidate" | "recruiter" | null>(null);
    const [error, setError] = useState<string | null>(null);

    // If redirected here from OAuth with ?token=..., store the token
    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            setAuthFromToken(token);
            router.replace("/role-selection", { scroll: false });
            // Schedule state update outside the synchronous effect body
            setTimeout(() => setOauthToken(token), 0);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Handle role card click.
     *
     * Two cases:
     * 1. Regular signup (no oauth token) → just navigate to onboarding with role param
     * 2. OAuth new user (has oauth token) → update role via API, get a fresh token
     *    with the correct role encoded, then navigate to onboarding
     */
    const handleRoleSelect = async (role: "candidate" | "recruiter") => {
        setSelectingRole(role);
        setError(null);

        if (!oauthToken) {
            // Regular signup path — no API calls needed yet, role gets set during onboarding signup
            router.push(`/onboarding?role=${role}`);
            return;
        }

        try {
            // 1. Update the user's role in the database
            await api.put("api/v1/users/me", { role });

            // 2. Get a fresh token that has the correct role encoded in the JWT
            const { data } = await api.post<{ access_token: string }>("api/v1/auth/refresh-token");
            const freshToken = data.access_token;

            // 3. Store the fresh token and update stored user
            setToken(freshToken);
            const payload = decodeTokenPayload(freshToken);
            if (payload) {
                setStoredUser({
                    email: payload.sub as string,
                    role: (payload.role as "candidate" | "recruiter") ?? role,
                    onboarding_complete: !!payload.onboarding_complete,
                });
            }

            // 4. Navigate to onboarding for the selected role
            router.push(`/onboarding?role=${role}`);
        } catch (err) {
            console.error("Role selection failed:", err);
            setError("Something went wrong. Please try again.");
            setSelectingRole(null);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-24 bg-slate-100 dark:bg-[#0B0E14] transition-colors duration-300 relative overflow-hidden font-sans">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-100 transition-opacity duration-300">
                {/* Dark Mode Color Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px] hidden dark:block" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] hidden dark:block" />

                {/* Floating Avatars */}
                <div className="absolute top-[20%] left-[8%] w-32 h-48 animate-[float_8s_ease-in-out_infinite] hidden md:block opacity-60 dark:opacity-30">
                    <Image src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Mia&face=smile&backgroundColor=transparent" alt="Decoration" width={128} height={192} className="w-full h-full object-contain drop-shadow-xl dark:invert" />
                </div>
                <div className="absolute bottom-[20%] right-[8%] w-40 h-56 animate-[float_10s_ease-in-out_infinite_1s] hidden md:block opacity-50 dark:opacity-20 blur-[2px]">
                    <Image src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Oliver&face=smile&backgroundColor=transparent" alt="Decoration" width={160} height={224} className="w-full h-full object-contain drop-shadow-2xl dark:invert" />
                </div>
            </div>

            <Navbar />

            <main className="w-full max-w-4xl relative z-10">
                {/* Premium White Panel */}
                <div className="bg-white dark:bg-[#161B22] border border-white dark:border-white/10 rounded-[3rem] p-10 md:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-2xl transition-all duration-300 relative overflow-hidden">
                    {/* Subtle Inner Glow */}
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white dark:via-white/20 to-transparent"></div>
                    <div className="absolute -inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-[3rem] dark:from-white/5"></div>

                    <div className="flex flex-col items-center text-center mb-14 relative z-10">
                        {/* Butterfly Logo */}
                        <Link href="/" className="mb-6 hover:scale-105 transition-transform duration-300 block">
                            <Image
                                src="/butterfly.svg"
                                alt="TwinlyAI"
                                width={56}
                                height={56}
                                className="w-14 h-14"
                            />
                        </Link>

                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-[#F9FAFB] mb-4">
                            Choose your path
                        </h1>
                        <p className="text-slate-500 dark:text-[#9CA3AF] text-lg max-w-lg leading-relaxed">
                            {oauthToken
                                ? "Welcome! Select how you'll use TwinlyAI to set up your profile."
                                : "Select how you'll use TwinlyAI to tailor your experience."}
                        </p>

                        {/* Error state */}
                        {error && (
                            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-2xl">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 relative z-10">
                        {/* Candidate Card */}
                        <button
                            onClick={() => handleRoleSelect("candidate")}
                            disabled={selectingRole !== null}
                            className="group relative flex flex-col items-start text-left p-10 rounded-3xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-purple-500/10 hover:-translate-y-2 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <div className="w-16 h-16 rounded-[1.25rem] bg-white dark:bg-white/10 shadow-sm flex items-center justify-center text-blue-600 dark:text-purple-400 mb-8 dark:mb-10 border border-slate-100 dark:border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                {selectingRole === "candidate" ? (
                                    <Loader2 size={32} className="animate-spin" />
                                ) : (
                                    <Brain size={32} />
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-[#F9FAFB] mb-3 dark:mb-4 tracking-tight">
                                I am a Candidate
                            </h3>
                            <p className="text-slate-500 dark:text-[#9CA3AF] mb-8 dark:mb-10 leading-relaxed text-base">
                                Build your AI Twin, manage your professional persona, and accelerate your career growth.
                            </p>
                            <div className="mt-auto flex items-center font-bold text-blue-600 dark:text-purple-400 text-[13px] tracking-[0.1em] uppercase">
                                {selectingRole === "candidate" ? "Setting up..." : "Building my Twin"}
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                            </div>
                        </button>

                        {/* Recruiter Card */}
                        <button
                            onClick={() => handleRoleSelect("recruiter")}
                            disabled={selectingRole !== null}
                            className="group relative flex flex-col items-start text-left p-10 rounded-3xl border border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-blue-500/10 hover:-translate-y-2 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            <div className="w-16 h-16 rounded-[1.25rem] bg-white dark:bg-white/10 shadow-sm flex items-center justify-center text-indigo-600 dark:text-blue-400 mb-8 dark:mb-10 border border-slate-100 dark:border-white/5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                                {selectingRole === "recruiter" ? (
                                    <Loader2 size={32} className="animate-spin" />
                                ) : (
                                    <Search size={32} />
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-[#F9FAFB] mb-3 dark:mb-4 tracking-tight">
                                I am a Recruiter
                            </h3>
                            <p className="text-slate-500 dark:text-[#9CA3AF] mb-8 dark:mb-10 leading-relaxed text-base">
                                Discover top-tier talent, engage with AI Twins, and streamline your entire hiring pipeline.
                            </p>
                            <div className="mt-auto flex items-center font-bold text-indigo-600 dark:text-blue-400 text-[13px] tracking-[0.1em] uppercase">
                                {selectingRole === "recruiter" ? "Setting up..." : "Finding Talent"}
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                            </div>
                        </button>
                    </div>

                    <div className="mt-14 text-center relative z-10">
                        <p className="text-slate-500 dark:text-[#9CA3AF] text-sm font-medium">
                            Already have an account?
                            <Link
                                href="/login"
                                className="text-slate-900 dark:text-[#F9FAFB] hover:text-slate-700 dark:hover:text-purple-400 transition-colors ml-1.5 font-bold hover:underline underline-offset-4 decoration-2"
                            >
                                Log in here
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-center items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-slate-300 dark:text-white/20 font-medium flex-wrap">
                    <button onClick={() => alert("Privacy Policy coming soon.")} className="hover:text-white dark:hover:text-white/40 transition-colors bg-transparent border-0 p-0 cursor-pointer uppercase tracking-widest font-medium">
                        Privacy Policy
                    </button>
                    <button onClick={() => alert("Terms of Service coming soon.")} className="hover:text-white dark:hover:text-white/40 transition-colors bg-transparent border-0 p-0 cursor-pointer uppercase tracking-widest font-medium">
                        Terms of Service
                    </button>
                    <span>© 2025 TwinlyAI</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Designed in Lajpat Nagar</span>
                </div>
            </main>
        </div>
    );
}

export default function RoleSelectionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0B0E14]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        }>
            <RoleSelectionContent />
        </Suspense>
    );
}
