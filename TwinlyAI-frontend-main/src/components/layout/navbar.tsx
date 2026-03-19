"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const [hidden, setHidden] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest: number) => {
        const previous = scrollY.getPrevious() ?? 0;

        // Always show at the very top of the page
        if (latest < 50) {
            setHidden(false);
            return;
        }

        const diff = latest - previous;
        if (diff > 5) {
            setHidden(true);
            setMobileMenuOpen(false); // close mobile menu when scrolling down
        } else if (diff < -5) {
            setHidden(false);
        }
    });

    const navLinks = [
        { label: "Solutions", href: "/solutions" },
        { label: "Pricing", href: "/pricing" },
        { label: "About Us", href: "/about" },
    ];

    return (
        <>
            <motion.div
                variants={{
                    visible: { y: 0 },
                    hidden: { y: "-120%" },
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-6 left-0 right-0 z-[100] px-4 pointer-events-none"
            >
                <nav className="max-w-[1000px] mx-auto h-16 nav-glass-pill rounded-full px-4 sm:px-6 flex items-center justify-between pointer-events-auto bg-[var(--bg-card-hover)]/30 backdrop-blur-md">
                    <div className="flex items-center">
                        <Link
                            className="flex items-center gap-2 font-bold text-xl tracking-tighter"
                            href="/"
                        >
                            <Image
                                src="/butterfly.svg"
                                alt="TwinlyAI Logo"
                                width={32}
                                height={32}
                                className="w-8 h-8"
                            />
                            <span className="text-[var(--text-main)]">
                                Twinly<span className="font-light">AI</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-slate-500 dark:text-slate-400">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                className="hover:text-slate-900 dark:hover:text-white transition-colors"
                                href={link.href}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 text-[14px]">
                        <ThemeToggle />
                        <Link
                            className="hidden sm:block text-slate-500 dark:text-slate-400 font-medium hover:text-blue-600 dark:hover:text-indigo-400 transition-colors"
                            href="/login"
                        >
                            Login
                        </Link>
                        <Link
                            href="/role-selection"
                            className="hidden sm:block bg-blue-600 dark:bg-indigo-600 text-white px-4 py-2 rounded-full text-[13px] font-semibold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(37,99,235,0.2)] dark:shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:bg-blue-700 dark:hover:bg-indigo-700"
                        >
                            Start Free Trial
                        </Link>

                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            aria-label="Toggle navigation menu"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </nav>
            </motion.div>

            {/* Mobile Dropdown Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed top-[5.5rem] left-4 right-4 z-[99] md:hidden bg-white/95 dark:bg-[#1C2128]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
                    >
                        <div className="p-3 flex flex-col gap-1">
                            {navLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-3 text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors min-h-[44px] flex items-center"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="h-px bg-slate-200 dark:bg-white/10 my-1" />
                            <Link
                                href="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-4 py-3 text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors min-h-[44px] flex items-center"
                            >
                                Login
                            </Link>
                            <Link
                                href="/role-selection"
                                onClick={() => setMobileMenuOpen(false)}
                                className="mt-1 px-4 py-3 text-[15px] font-semibold text-white bg-blue-600 dark:bg-indigo-600 hover:bg-blue-700 dark:hover:bg-indigo-700 rounded-xl transition-colors text-center min-h-[44px] flex items-center justify-center"
                            >
                                Start Free Trial
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
