import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AboutContent } from "@/components/sections/about-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us | TwinlyAI - The Manifesto",
    description: "We believe you are more than a PDF. TwinlyAI bridges the gap between static resumes and authentic potential.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[var(--bg-main)] font-sans transition-colors duration-300 relative">
            {/* Soft Ambient Colorful Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-20 hidden md:block">
                {/* Left Center Avatar */}
                <div className="absolute top-[30%] left-[5%] w-32 h-48 animate-[float_8s_ease-in-out_infinite]">
                    <img src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Aneka&face=smile&backgroundColor=transparent" alt="Decoration" className="w-full h-full object-contain opacity-70 drop-shadow-2xl dark:invert" />
                </div>

                {/* Bottom Right Avatar */}
                <div className="absolute bottom-[20%] right-[8%] w-40 h-56 animate-[float_10s_ease-in-out_infinite_2s]">
                    <img src="https://api.dicebear.com/7.x/open-peeps/svg?seed=Felix&face=smile&backgroundColor=transparent" alt="Decoration" className="w-full h-full object-contain opacity-60 drop-shadow-xl dark:invert blur-[2px]" />
                </div>
            </div>

            <div className="relative z-10">
                <Navbar />
                <AboutContent />
                <Footer />
            </div>
        </main>
    );
}
