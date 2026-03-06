"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { PricingContent } from "@/components/sections/pricing";
import { Footer } from "@/components/layout/footer";

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-[var(--bg-main)] font-sans transition-colors duration-300 selection:bg-blue-100 dark:selection:bg-indigo-900/50 relative overflow-hidden">
            {/* Soft Ambient Colorful Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-50 dark:opacity-20 hidden lg:block">
                {/* Top Left Avatar */}
                <div className="absolute top-[15%] left-[2%] w-36 h-48 animate-[float_9s_ease-in-out_infinite]">
                    <img src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Cookie&face=smile&backgroundColor=transparent" alt="Decoration" className="w-full h-full object-contain opacity-70 drop-shadow-2xl dark:invert" />
                </div>

                {/* Center Right Avatar */}
                <div className="absolute top-[40%] right-[3%] w-48 h-64 animate-[float_11s_ease-in-out_infinite_1s]">
                    <img src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Jude&face=smile&backgroundColor=transparent" alt="Decoration" className="w-full h-full object-contain opacity-60 drop-shadow-xl dark:invert blur-[2px]" />
                </div>
            </div>

            <div className="relative z-10">
                <Navbar />
                <PricingContent />
                <Footer />
            </div>
        </main>
    );
}
