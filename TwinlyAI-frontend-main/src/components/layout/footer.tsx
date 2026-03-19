"use client";

import React from "react";
import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="bg-[var(--bg-main)] py-16 px-6 border-t border-[var(--border-color)] transition-colors duration-300">
            <div className="max-w-[1200px] mx-auto grid md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-1 space-y-6">
                    <Link href="#" className="flex items-center gap-2 font-bold text-xl tracking-tight text-[var(--text-main)]">
                        <Image
                            src="/butterfly.svg"
                            alt="TwinlyAI Logo"
                            width={24}
                            height={24}
                            className="w-6 h-6"
                        />
                        <span>TwinlyAI</span>
                    </Link>
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                        Defining the next generation of professional identity and recruitment infrastructure.
                    </p>
                </div>

                <div className="space-y-6">
                    <h4 className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-widest">Solutions</h4>
                    <ul className="text-[14px] text-[var(--text-muted)] space-y-3 font-medium">
                        <li><Link className="hover:text-[var(--brand-purple)] transition-colors" href="/solutions">For Recruiters</Link></li>
                        <li><Link className="hover:text-[var(--brand-purple)] transition-colors" href="/role-selection">For Candidates</Link></li>
                        <li><Link className="hover:text-[var(--brand-purple)] transition-colors" href="/role-selection">API Access</Link></li>
                    </ul>
                </div>

                <div className="space-y-6">
                    <h4 className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-widest">Resources</h4>
                    <ul className="text-[14px] text-[var(--text-muted)] space-y-3 font-medium">
                        <li><button className="hover:text-[var(--brand-purple)] transition-colors text-left" onClick={() => alert("Documentation coming soon.")}>Documentation</button></li>
                        <li><Link className="hover:text-[var(--brand-purple)] transition-colors" href="/pricing">Pricing</Link></li>
                        <li><button className="hover:text-[var(--brand-purple)] transition-colors text-left" onClick={() => alert("Security whitepaper coming soon.")}>Security</button></li>
                    </ul>
                </div>

                <div className="space-y-6">
                    <h4 className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-widest">Support</h4>
                    <ul className="text-[14px] text-[var(--text-muted)] space-y-3 font-medium">
                        <li><button className="hover:text-[var(--brand-purple)] transition-colors text-left" onClick={() => alert("Help Center coming soon.")}>Help Center</button></li>
                        <li><button className="hover:text-[var(--brand-purple)] transition-colors text-left" onClick={() => alert("Contact form coming soon.")}>Contact Us</button></li>
                        <li><button className="hover:text-[var(--brand-purple)] transition-colors text-left" onClick={() => alert("Privacy Policy coming soon.")}>Privacy Policy</button></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto mt-16 pt-8 border-t border-[var(--border-color)] text-[var(--text-muted)] text-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center">
                    <p>© 2024 TwinlyAI. All rights reserved.</p>
                    <span className="text-[10px] hidden sm:block">•</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-70">Designed in Lajpat Nagar</span>
                </div>
                <div className="flex gap-6">
                    <Link className="hover:text-[var(--brand-purple)] transition-colors" href="https://twitter.com/twinlyai">
                        <Twitter className="w-5 h-5" />
                        <span className="sr-only">Twitter</span>
                    </Link>
                    <Link className="hover:text-[var(--brand-purple)] transition-colors" href="https://linkedin.com/company/twinlyai">
                        <Linkedin className="w-5 h-5" />
                        <span className="sr-only">LinkedIn</span>
                    </Link>
                    <Link className="hover:text-[var(--brand-purple)] transition-colors" href="https://github.com/twinlyai">
                        <Github className="w-5 h-5" />
                        <span className="sr-only">GitHub</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
