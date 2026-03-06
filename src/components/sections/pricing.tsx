"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function PricingContent() {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <section className="relative pt-40 pb-32 overflow-hidden bg-transparent">
            <div className="grid-pattern absolute inset-0 pointer-events-none opacity-50"></div>

            <div className="max-w-[1280px] mx-auto px-6 relative z-10">
                {/* Header & Toggle */}
                <div className="text-center mb-20 space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-[56px] md:text-[72px] font-bold tracking-tighter text-[var(--text-main)] leading-tight"
                    >
                        Simple, Transparent<br />Plans for Every Scale.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-[20px] text-[var(--text-muted)] max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        Whether you're an individual professional or a global enterprise, we have a plan to help your AI Twin excel.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex items-center justify-center gap-4 pt-4"
                    >
                        <span className={`text-[14px] font-medium transition-colors ${!isYearly ? "text-[var(--text-main)]" : "text-[var(--text-muted)]"}`}>Monthly</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className={`w-12 h-6 rounded-full bg-slate-200 relative flex items-center px-1 transition-colors duration-300 ${isYearly ? "bg-indigo-600" : "bg-slate-200"}`}
                        >
                            <motion.div
                                animate={{ x: isYearly ? 24 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="w-4 h-4 rounded-full bg-white shadow-sm"
                            />
                        </button>
                        <span className={`text-[14px] font-medium transition-colors ${isYearly ? "text-[var(--text-main)]" : "text-[var(--text-muted)]"}`}>
                            Yearly <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[12px] ml-1 font-bold">Save 20%</span>
                        </span>
                    </motion.div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Free Plan */}
                    <PricingCard
                        title="Free"
                        price={0}
                        period="/mo"
                        description="Perfect for getting started and exploring AI Twins."
                        features={[
                            "1 AI Twin Instance",
                            "Standard RAG Processing",
                            "Resume PDF Upload",
                            "10 Chat Interactions/mo"
                        ]}
                        delay={0.1}
                    />

                    {/* Pro Plan */}
                    <PricingCard
                        title="Pro"
                        price={isYearly ? 24 : 29}
                        period="/mo"
                        description="The standard for serious professionals and active job seekers."
                        features={[
                            "Unlimited AI Twin Instances",
                            "Priority RAG Processing",
                            "GitHub & LinkedIn Sync",
                            "Custom Tone-of-Voice",
                            "Advanced Analytics Portal"
                        ]}
                        isPopular
                        ctaText="Start 14-day Free Trial"
                        delay={0.2}
                    />

                    {/* Plus Plan */}
                    <PricingCard
                        title="Plus"
                        price={isYearly ? 69 : 79}
                        period="/mo"
                        description="Enterprise-grade features for recruiters and power users."
                        features={[
                            "White-labeling & API Access",
                            "Custom Domain Integration",
                            "Voice Synthesis (Audio Twin)",
                            "SLA Support",
                            "Team Workspace Roles"
                        ]}
                        ctaText="Contact Sales"
                        delay={0.3}
                    />
                </div>

                {/* Trusted By */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-24 text-center max-w-2xl mx-auto border-t border-[var(--border-color)] pt-16"
                >
                    <h4 className="text-[20px] font-bold text-[var(--text-main)] mb-8">Trusted by modern professionals at</h4>
                    <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale">
                        {["SQUARESPACE", "LINEAR", "NOTION", "LOOM"].map((logo, i) => (
                            <span key={i} className="text-xl font-black tracking-tighter font-sans">{logo}</span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

type PricingCardProps = {
    title: string;
    price: string | number;
    period: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    ctaText?: string;
    delay?: number;
};

function PricingCard({ title, price, period, description, features, isPopular = false, ctaText = "Get Started", delay = 0 }: PricingCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className={`relative rounded-[32px] p-10 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${isPopular
                ? "border-2 border-transparent bg-clip-padding relative bg-white shadow-xl shadow-indigo-100 ring-2 ring-indigo-500/20"
                : "bg-white border border-[var(--border-color)]"
                }`}
            style={isPopular ? {
                backgroundImage: "linear-gradient(white, white), linear-gradient(to bottom right, #6366f1, #a855f7)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
            } : {}}
        >
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-[12px] font-bold tracking-wide uppercase shadow-lg">
                    Most Popular
                </div>
            )}

            <div className="mb-8">
                <h3 className="text-[18px] font-bold text-slate-900 mb-2">{title}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-[48px] font-bold text-slate-900 tracking-tighter">${price}</span>
                    <span className="text-slate-400 text-[14px] font-medium">{period}</span>
                </div>
                <p className="text-[14px] text-slate-500 mt-4 leading-relaxed">{description}</p>
            </div>

            <div className="flex-grow space-y-5 mb-10">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-indigo-600 stroke-[3px]" />
                        </div>
                        <span className={`text-[15px] ${isPopular ? "text-slate-700 font-medium" : "text-slate-600"}`}>
                            {feature}
                        </span>
                    </div>
                ))}
            </div>

            <button className={`w-full py-4 rounded-2xl font-bold text-[15px] transition-all duration-300 ${isPopular
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                : "border border-slate-200 text-slate-900 hover:bg-slate-50"
                }`}>
                {ctaText}
            </button>
        </motion.div>
    );
}
