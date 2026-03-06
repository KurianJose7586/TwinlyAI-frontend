"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    Lock,
    EyeOff,
    CheckCircle,
    Loader2,
    AlertCircle
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import api from "@/lib/api";

const PIPELINE_STEPS = [
    { id: "reading", title: "Reading Document", desc: "Extracting raw text and entities" },
    { id: "semantic", title: "Semantic Extraction", desc: "Mapping professional nodes" },
    { id: "neural", title: "Neural Indexing", desc: "Generating high-dimensional career vector" },
    { id: "twin", title: "Digital Twin Generation", desc: "Finalizing AI agent profile" }
];

export default function CandidateEmptyDashboard() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeStepIndex, setActiveStepIndex] = useState(-1);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadDone, setUploadDone] = useState(false);

    const [botId, setBotId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("there");

    // On mount: try localStorage first, then fetch fresh from server
    useEffect(() => {
        const stored = typeof window !== "undefined" ? localStorage.getItem("twinly_botId") : null;
        const storedName = typeof window !== "undefined" ? localStorage.getItem("twinly_userName") : null;
        if (storedName) setUserName(storedName);

        // Always re-fetch from server to get the canonical bot ID
        api.get("/bots/")
            .then(res => {
                const bots = res.data;
                if (Array.isArray(bots) && bots.length > 0) {
                    const bot = bots[0];
                    const id = bot.id ?? bot._id ?? stored;
                    if (id) {
                        setBotId(id);
                        localStorage.setItem("twinly_botId", id);
                        if (bot.name) {
                            setUserName(bot.name);
                            localStorage.setItem("twinly_userName", bot.name);
                        }
                    }
                } else {
                    // Server confirmed user has no bots. Wipe stale local state to avoid 403s.
                    localStorage.removeItem("twinly_botId");
                    localStorage.removeItem("twinly_userName");
                    setBotId(null);
                }
            })
            .catch(() => {
                // Only fallback if the network request itself fails, not if returning 0 bots.
                if (stored) setBotId(stored);
            });
    }, []);

    const doUpload = async (file: File) => {
        if (isUploading || !botId) return;
        setUploadError(null);
        setIsUploading(true);
        setActiveStepIndex(0); // Step 1: Reading Document starts

        try {
            const formData = new FormData();
            formData.append("file", file);

            // Move to step 2 after a short delay (UI feel)
            const step2Timer = setTimeout(() => setActiveStepIndex(1), 2000);

            const res = await api.post(`/bots/${botId}/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            clearTimeout(step2Timer);

            const data = res.data;

            // Persist candidate name returned by the backend
            if (data?.candidate_name) {
                localStorage.setItem("twinly_userName", data.candidate_name);
                localStorage.setItem("userName", data.candidate_name);
            }

            // Animate remaining pipeline steps quickly now that we have data
            setActiveStepIndex(2);
            await delay(1200);
            setActiveStepIndex(3);
            await delay(1500);

            setUploadDone(true);
            await delay(1000);
            router.push("/candidate-active");

        } catch (err: unknown) {
            setUploadError((err as Error).message || "Upload failed. Please try again.");
            setActiveStepIndex(-1);
        }
        setIsUploading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) doUpload(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) doUpload(file);
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-[#0B0E14] text-slate-900 dark:text-slate-50 antialiased">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-[#0B0E14] border-b border-slate-200 dark:border-white/5 z-50">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/butterfly.svg" alt="TwinlyAI Logo" width={24} height={24} className="w-6 h-6 dark:invert" />
                        <h2 className="text-[17px] font-bold tracking-tight">
                            Twinly<span className="font-light text-slate-500 dark:text-slate-400">AI</span>
                        </h2>
                    </Link>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {userName}
                </div>
            </header>

            <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left: Typography & Dropzone */}
                    <div className="flex flex-col gap-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-4">
                                Add your experience
                            </h1>
                            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                                Upload your resume. We'll parse the document and build your interactive digital profile.
                            </p>
                        </div>

                        {!botId && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-sm text-amber-700 dark:text-amber-400">
                                <AlertCircle size={18} className="shrink-0" />
                                <span>No bot found. <Link href="/onboarding" className="underline font-medium hover:text-amber-800 dark:hover:text-amber-300">Restart onboarding</Link>.</span>
                            </div>
                        )}

                        {/* Interactive Drop Zone */}
                        <div
                            className="relative group w-full"
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            <div className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border ${uploadDone ? 'border-green-500 bg-green-50 dark:bg-green-500/5' :
                                isDragging || isUploading ? 'border-slate-400 dark:border-slate-500 bg-slate-50 dark:bg-white/5' :
                                    'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5'
                                } p-8 sm:p-12 transition-colors cursor-pointer min-h-[180px]`}
                                onClick={() => !isUploading && !uploadDone && botId && fileInputRef.current?.click()}
                            >

                                <div className={`flex items-center justify-center w-12 h-12 rounded-xl mb-2 ${uploadDone ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                                    isUploading ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' :
                                        'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                                    }`}>
                                    {uploadDone ? (
                                        <CheckCircle size={24} />
                                    ) : isUploading ? (
                                        <Loader2 size={24} className="animate-spin" />
                                    ) : (
                                        <Upload size={24} />
                                    )}
                                </div>

                                <div className="flex flex-col items-center gap-1 text-center">
                                    <h3 className={`text-base font-semibold ${uploadDone ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white"}`}>
                                        {uploadDone
                                            ? "Parsing Complete"
                                            : isUploading
                                                ? "Processing Document..."
                                                : "Click or drag file to upload"}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {uploadDone
                                            ? "Redirecting..."
                                            : isUploading
                                                ? "Please wait a moment."
                                                : "PDF, DOCX, or TXT"}
                                    </p>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.txt,.json"
                                    onChange={handleChange}
                                    disabled={isUploading || !botId}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5"><Lock size={14} /> Private & Secure</span>
                            <span className="flex items-center gap-1.5"><EyeOff size={14} /> Will not train public models</span>
                        </div>
                    </div>

                    {/* Right: Pipeline Tracker */}
                    <div className="w-full lg:pl-12">
                        <div className="bg-white dark:bg-[#1C2128] rounded-2xl p-8 border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="mb-8 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Status
                                </h3>
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${uploadDone ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                                    isUploading ? 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300' :
                                        'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                                    }`}>
                                    {uploadDone ? 'Complete' : isUploading ? 'Processing' : 'Waiting'}
                                </span>
                            </div>

                            <div className="relative flex flex-col gap-8">
                                {/* Connecting Line */}
                                <div className="absolute left-[9px] top-3 bottom-3 w-[1px] bg-slate-200 dark:bg-white/10" />

                                {PIPELINE_STEPS.map((step, index) => {
                                    const isActive = activeStepIndex === index;
                                    const isCompleted = activeStepIndex > index || uploadDone;
                                    const isPending = activeStepIndex < index && !isActive && !isCompleted;

                                    return (
                                        <div key={step.id} className="relative flex items-start gap-4">
                                            {/* Node Status Dot */}
                                            <div className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full mt-0.5 bg-white dark:bg-[#1C2128]">
                                                {isCompleted ? (
                                                    <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center">
                                                        <CheckCircle size={12} className="text-white dark:text-black" strokeWidth={3} />
                                                    </div>
                                                ) : isActive ? (
                                                    <div className="w-3 h-3 rounded-full bg-slate-900 dark:bg-white border-[3px] border-white dark:border-[#1C2128] ring-1 ring-slate-900 dark:ring-white" />
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-white/20" />
                                                )}
                                            </div>

                                            {/* Step Content */}
                                            <div className={`${isPending ? 'opacity-40' : 'opacity-100'}`}>
                                                <p className={`text-sm font-medium ${isCompleted || isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                                    {step.title}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                    {isActive ? 'Processing...' : step.desc}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto border-t border-slate-200 dark:border-white/5">
                <Footer />
            </div>
        </div>
    );
}

function delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
}
