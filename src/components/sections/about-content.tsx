"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
    EyeOff,
    UserX,
    Brain,
    Languages,
    Cpu,
    Lock as LockIcon,
    ShieldCheck,
    Zap,
    Sparkles as SparklesIcon,
} from "lucide-react";

const fadeInStart = { opacity: 0, y: 20 };
const fadeInEnd = { opacity: 1, y: 0 };
const transition = { duration: 0.6, ease: "easeOut" as const };

export function AboutContent() {
    return (
        <div className="overflow-hidden bg-transparent">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute w-[500px] h-[500px] bg-indigo-100/40 rounded-full -top-48 -left-24 blur-[80px]" />
                <div className="absolute w-[600px] h-[600px] bg-blue-50/40 rounded-full top-1/2 -right-48 translate-y-[-50%] blur-[80px]" />
                <div className="absolute w-[400px] h-[400px] bg-purple-50/40 rounded-full bottom-0 left-1/4 blur-[80px]" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-40 bg-[size:32px_32px] [mask-image:radial-gradient(transparent,black)]" />
                {/* Note: I'm approximating the 'mesh-pattern' css class with a similar Tailwind utility or keeping it simple. 
            The HTML had a specific radial gradient pattern. I will use a simple dot pattern or similar if grid-pattern.svg doesn't exist, 
            or just inline the CSS for the pattern. 
        */}
                <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.05) 1px, transparent 0)`,
                        backgroundSize: '32px 32px'
                    }}
                />
            </div>

            <main className="relative z-10">
                {/* HERO SECTION */}
                <section className="pt-52 pb-32">
                    <div className="max-w-[1100px] mx-auto px-6 text-center">
                        <motion.div
                            initial={fadeInStart}
                            animate={fadeInEnd}
                            transition={transition}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/50 border border-indigo-100/50 text-[11px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-8 shadow-sm backdrop-blur-sm"
                        >
                            The TwinlyAI Manifesto
                        </motion.div>

                        <motion.h1
                            initial={fadeInStart}
                            animate={fadeInEnd}
                            transition={{ ...transition, delay: 0.1 }}
                            className="text-[56px] md:text-[84px] font-extrabold tracking-tighter text-[var(--text-main)] leading-[0.95] mb-8"
                        >
                            We believe you are <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--brand-deep)] to-[var(--brand-purple)]">
                                more than a PDF.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={fadeInStart}
                            animate={fadeInEnd}
                            transition={{ ...transition, delay: 0.2 }}
                            className="text-xl md:text-2xl text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed font-light"
                        >
                            TwinlyAI was born from a simple observation: humans are multidimensional, but the hiring process is flat. We bridge the gap between static summaries and authentic potential.
                        </motion.p>
                    </div>
                </section>

                {/* EVOLUTION TIMELINE */}
                <section className="py-32 relative">
                    <div className="max-w-[1200px] mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-24"
                        >
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--brand-purple)] mb-4">The Evolution</h2>
                            <h3 className="text-4xl font-bold text-[var(--text-main)]">Professional Identity, Reimagined</h3>
                        </motion.div>

                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[var(--border-color)] -translate-y-1/2 hidden md:block opacity-50" />

                            <div className="grid md:grid-cols-4 gap-12 relative z-10">
                                {[
                                    { year: "1482", title: "The First Resume", desc: "Handwritten letter by Leonardo da Vinci to the Duke of Milan." },
                                    { year: "1980s", title: "Word Processing", desc: "The rise of the digital PDF. Static, rigid, and one-dimensional." },
                                    { year: "2000s", title: "Social Networks", desc: "Professional profiles become public, but remain just lists of text." },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex flex-col items-center text-center group"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center mb-6 text-[var(--text-muted)] font-bold shadow-sm group-hover:-translate-y-2 transition-transform duration-300">
                                            {item.year}
                                        </div>
                                        <h4 className="font-bold text-[var(--text-main)] mb-2">{item.title}</h4>
                                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                                    </motion.div>
                                ))}

                                {/* 2025 Active Node */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                    className="flex flex-col items-center text-center"
                                >
                                    <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                                        <div className="relative w-14 h-14 bg-[var(--brand-deep)] rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center">
                                            <SparklesIcon className="text-white w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="text-[var(--brand-deep)] font-black text-lg">2025</div>
                                    <h4 className="font-bold text-[var(--text-main)] mb-2">Twinly AI Twin</h4>
                                    <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">An interactive agent that carries your voice, context, and character.</p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* DEMOCRATIZING SECTION */}
                <section className="py-32 relative">
                    <div className="max-w-[1000px] mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-20"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-main)] tracking-tight">Democratizing the Interview</h2>
                            <p className="text-[var(--text-muted)] mt-6 text-lg max-w-xl mx-auto">We're leveling the playing field for both sides of the hiring equation.</p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-10">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="p-12 rounded-[40px] bg-white/60 backdrop-blur-xl border border-white/50 hover:bg-white/80 transition-all group shadow-sm hover:shadow-xl"
                            >
                                <div className="w-16 h-16 bg-[var(--brand-deep)] text-white rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-300">
                                    <EyeOff size={32} />
                                </div>
                                <h3 className="text-3xl font-bold text-[var(--text-main)] mb-6">The Overlooked</h3>
                                <p className="text-[var(--text-muted)] leading-relaxed text-lg">For brilliant candidates whose resumes don't pass the keyword filters. We give them a voice to explain their non-traditional backgrounds and specialized expertise.</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="p-12 rounded-[40px] bg-white/60 backdrop-blur-xl border border-white/50 hover:bg-white/80 transition-all group shadow-sm hover:shadow-xl"
                            >
                                <div className="w-16 h-16 bg-[var(--brand-deep)] text-white rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-300">
                                    <UserX size={32} />
                                </div>
                                <h3 className="text-3xl font-bold text-[var(--text-main)] mb-6">The Overwhelmed</h3>
                                <p className="text-[var(--text-muted)] leading-relaxed text-lg">For recruiters drowning in 500+ applications per role. We provide an intelligent interface to "talk" to every candidate, ensuring no diamond is left in the rough.</p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ENGINE SECTION */}
                <section className="py-32 overflow-hidden">
                    <div className="max-w-[1100px] mx-auto px-6 relative">
                        <div className="flex flex-col md:flex-row items-center gap-20">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="md:w-1/2"
                            >
                                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--brand-purple)] mb-6">Our Engine</h2>
                                <h3 className="text-4xl md:text-5xl font-bold text-[var(--text-main)] tracking-tight mb-8">Built on Neural Architecture</h3>
                                <p className="text-[var(--text-muted)] leading-relaxed mb-12 text-lg">Under the hood, TwinlyAI isn't just another chatbot. We've built a proprietary engine designed for professional integrity and human nuance.</p>

                                <div className="space-y-10">
                                    <div className="flex gap-6 group">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--brand-deep)] shadow-sm group-hover:bg-[var(--brand-deep)] group-hover:text-white transition-all duration-300">
                                            <Brain size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--text-main)] text-lg mb-1">Contextual Memory Engine</h4>
                                            <p className="text-[var(--text-muted)]">Remembers the nuances of your career journey like a real person would, maintaining consistency across every interaction.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 group">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center text-[var(--brand-deep)] shadow-sm group-hover:bg-[var(--brand-deep)] group-hover:text-white transition-all duration-300">
                                            <Languages size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--text-main)] text-lg mb-1">Semantic Understanding</h4>
                                            <p className="text-[var(--text-muted)]">Goes beyond simple keywords to understand the actual impact, soft skills, and cultural context of your work.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="md:w-1/2 relative"
                            >
                                <div className="aspect-square bg-indigo-50/50 rounded-[48px] overflow-hidden flex items-center justify-center border border-indigo-100/50 relative">
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] scale-150 opacity-30 animate-pulse" />
                                    <div className="relative w-72 h-72 border border-indigo-200/50 rounded-full flex items-center justify-center">
                                        <div className="absolute w-56 h-56 border border-indigo-300/30 rounded-full animate-[spin_10s_linear_infinite]" />
                                        <div className="w-40 h-40 bg-white rounded-[40px] flex items-center justify-center shadow-2xl shadow-indigo-200/50 border border-indigo-50 z-10">
                                            <Cpu className="text-[var(--brand-deep)] w-16 h-16" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* FOUNDER SECTION */}
                <section className="py-32">
                    <div className="max-w-[1000px] mx-auto px-6 relative">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-slate-900 rounded-[56px] p-12 md:p-20 relative overflow-hidden"
                        >
                            {/* Mesh Pattern Overlay for dark card */}
                            <div
                                className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{
                                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
                                    backgroundSize: '32px 32px'
                                }}
                            />
                            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px]" />

                            <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
                                <div className="w-56 h-56 rounded-[48px] overflow-hidden flex-shrink-0 border-4 border-slate-800 shadow-2xl">
                                    <Image
                                        alt="Kurian Jose"
                                        className="w-full h-full object-cover"
                                        src="/Kurian-photo.jpg"
                                        width={224}
                                        height={224}
                                    />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-[0.2em] mb-8">Founder & Lead Engineer</div>
                                    <h2 className="text-4xl font-bold text-white mb-6">Kurian Jose</h2>
                                    <p className="text-slate-400 leading-relaxed text-xl font-light italic">
                                        "I spent years as an engineer seeing incredible talent filtered out by rigid systems. I built Twinly to ensure that your full story—the context, the passion, and the unique problem-solving—is never lost in translation again."
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* INTEGRITY SECTION */}
                <section className="py-32">
                    <div className="max-w-[1100px] mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-20"
                        >
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--brand-purple)] mb-4">Our Integrity</h2>
                            <h3 className="text-4xl font-bold text-[var(--text-main)]">The Principles We Live By</h3>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="p-12 rounded-[48px] bg-white/60 backdrop-blur-md border border-[var(--border-color)] text-center hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-lg"
                            >
                                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-green-600 shadow-sm">
                                    <LockIcon />
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--text-main)] mb-4">Privacy First</h3>
                                <p className="text-[var(--text-muted)] leading-relaxed">Your data belongs to you. We never train public models on your private professional data. Encryption is our default.</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="p-12 rounded-[48px] bg-white/60 backdrop-blur-md border border-[var(--border-color)] text-center hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-lg"
                            >
                                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-amber-600 shadow-sm">
                                    <ShieldCheck />
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--text-main)] mb-4">Zero Hallucinations</h3>
                                <p className="text-[var(--text-muted)] leading-relaxed">Our agents are strictly grounded in your verified experience. No fabrications, no exaggerations. Just you.</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="p-12 rounded-[48px] bg-white/60 backdrop-blur-md border border-[var(--border-color)] text-center hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-lg"
                            >
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-[var(--brand-deep)] shadow-sm">
                                    <Zap />
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--text-main)] mb-4">Real-time Velocity</h3>
                                <p className="text-[var(--text-muted)] leading-relaxed">Instant answers for recruiters. No more waiting days for an email reply to a simple qualifying question.</p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
