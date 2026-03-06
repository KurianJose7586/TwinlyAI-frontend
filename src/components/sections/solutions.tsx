"use client";

import React from "react";
import { motion } from "framer-motion";
import { SearchCheck, PersonStanding, FileCode, Check, Send, PlayCircle } from "lucide-react";
import Link from "next/link";

export function SolutionsHero() {
    return (
        <section className="pt-32 pb-12 relative overflow-hidden bg-transparent">
            <div className="grid-pattern absolute inset-0 pointer-events-none"></div>
            <div className="max-w-[1100px] mx-auto px-6 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-100 text-[10px] font-bold text-indigo-600 uppercase tracking-widest shadow-sm mb-6">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                    The Future of Identity
                </div>
                <h1 className="text-[48px] md:text-[64px] font-extrabold tracking-tighter text-[var(--text-main)] leading-[1.1] mb-6">
                    Solve the <span className="text-[var(--brand-purple)]">"Resume Black Hole"</span><br /> with Interactive AI Agents
                </h1>
                <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed font-light mb-10">
                    TwinlyAI transforms static PDFs into living, breathing AI agents. Enable instant screening, deeper discovery, and authentic representation.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                    <Link href="/role-selection">
                        <button className="bg-[var(--brand-purple)] text-white px-8 py-3.5 rounded-xl font-bold text-[15px] shadow-lg shadow-indigo-200 hover:opacity-90 transition-all">
                            Get Started Now
                        </button>
                    </Link>
                    <button className="bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] px-8 py-3.5 rounded-xl font-bold text-[15px] hover:bg-[var(--bg-card-hover)] transition-all" onClick={() => alert("Product demo coming soon.")}>
                        Watch Demo
                    </button>
                </div>
            </div>
        </section>
    );
}

export function SolutionsSection() {
    return (
        <section id="solutions" className="py-24 bg-transparent relative overflow-hidden transition-colors duration-300">
            <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-[42px] md:text-[52px] font-bold tracking-tighter text-[var(--text-main)] mb-6">
                        The End of <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-400 dark:to-blue-400">Static Hiring</span>
                    </h2>
                    <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                        TwinlyAI transforms static PDFs into living, breathing AI agents. Enable instant screening, deeper discovery, and authentic representation.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* For Recruiters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="group p-8 rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all hover:-translate-y-1 hover:border-[var(--brand-purple)] hover:shadow-2xl hover:shadow-indigo-500/10"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6 text-[var(--brand-purple)] group-hover:scale-110 transition-transform">
                            <SearchCheck className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">For Recruiters</h3>
                        <p className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 opacity-80">24/7 Screening</p>
                        <p className="text-[var(--text-muted)] leading-relaxed">
                            Instantly engage with every applicant through their AI twin. Conduct preliminary vetting and technical discovery without scheduled calls.
                        </p>
                    </motion.div>

                    {/* For Candidates */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="group p-8 rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all hover:-translate-y-1 hover:border-[var(--brand-purple)] hover:shadow-2xl hover:shadow-indigo-500/10"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6 text-[var(--brand-purple)] group-hover:scale-110 transition-transform">
                            <PersonStanding className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">For Candidates</h3>
                        <p className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 opacity-80">Living Portfolio</p>
                        <p className="text-[var(--text-muted)] leading-relaxed">
                            Go beyond the PDF. Your AI twin narrates your experience, explains your code, and advocates for your skills while you focus on what matters.
                        </p>
                    </motion.div>

                    {/* For Developers */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="group p-8 rounded-[24px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all hover:-translate-y-1 hover:border-[var(--brand-purple)] hover:shadow-2xl hover:shadow-indigo-500/10"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6 text-[var(--brand-purple)] group-hover:scale-110 transition-transform">
                            <FileCode className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">For Developers</h3>
                        <p className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 opacity-80">Robust API</p>
                        <p className="text-[var(--text-muted)] leading-relaxed">
                            Integrate TwinlyAI directly into your existing ATS or platform. Headless infrastructure built for scale, security, and seamless deployments.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export function CTASection() {
    return (
        <section className="py-24 bg-[var(--brand-deep)] relative overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none mix-blend-overlay"></div>

            {/* Abstract Shapes/Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-400/20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-[800px] mx-auto text-center relative z-10 px-6 space-y-10">
                <motion.h2
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-[36px] md:text-[52px] font-bold text-white tracking-tighter leading-tight"
                >
                    Ready to breathe life into your talent search?
                </motion.h2>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <Link href="/role-selection">
                        <button className="w-full sm:w-auto bg-white text-[var(--brand-deep)] px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                            Start Your Free Trial
                            <Check className="w-5 h-5" />
                        </button>
                    </Link>
                    <button className="w-full sm:w-auto bg-indigo-700/50 backdrop-blur-sm text-white border border-indigo-500/50 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-indigo-800/50 transition-all flex items-center justify-center gap-2" onClick={() => alert("Registration for live demos will be available soon.")}>
                        Book a Live Demo
                        <PlayCircle className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        </section>
    )
}
