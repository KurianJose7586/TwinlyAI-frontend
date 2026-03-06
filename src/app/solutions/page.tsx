"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { SolutionsHero, SolutionsSection, CTASection } from "@/components/sections/solutions";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function SolutionsPage() {
    return (
        <main className="min-h-screen bg-[var(--bg-main)] font-sans transition-colors duration-300 relative overflow-hidden">
            {/* Soft Ambient Colorful Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-20 hidden md:block">
                {/* Left Center Avatar */}
                <div className="absolute top-[25%] left-[8%] w-40 h-56 animate-[float_9s_ease-in-out_infinite]">
                    <img src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Liam&face=smile&backgroundColor=transparent" alt="Decoration" className="w-full h-full object-contain opacity-70 drop-shadow-2xl dark:invert" />
                </div>

                {/* Right Center Avatar */}
                <div className="absolute top-[65%] right-[5%] w-48 h-64 animate-[float_12s_ease-in-out_infinite_2s]">
                    <img src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Chloe&face=smile&backgroundColor=transparent" alt="Decoration" className="w-full h-full object-contain opacity-60 drop-shadow-xl dark:invert blur-[2px]" />
                </div>
            </div>

            <div className="relative z-10">
                {/* Navigation */}
                <Navbar />

                <SolutionsHero />
                <SolutionsSection />
                <CTASection />
                <Footer />
            </div>
        </main>
    );
}
