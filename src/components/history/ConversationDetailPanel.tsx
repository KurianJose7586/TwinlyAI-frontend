"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, ChevronDown, ChevronUp, FileText } from "lucide-react";
import Image from "next/image";
import type { ResumeVersion, ConversationStatus } from "@/types/history";
import { useConversationDetail, useResumeVersions } from "@/hooks/useHistory";

interface ConversationDetailPanelProps {
    botId: string | null;
    convId: string | null;
    onClose: () => void;
}

const STATUS_STYLES: Record<ConversationStatus, string> = {
    qualified: "bg-green-100 text-green-700 dark:bg-green-500/12 dark:text-green-400",
    cold: "bg-slate-100 text-slate-500 dark:bg-white/[0.05] dark:text-slate-500",
    followup: "bg-blue-100 text-blue-700 dark:bg-blue-500/12 dark:text-blue-400",
    ghosted: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

function formatDuration(seconds: number): string {
    if (!seconds) return "—";
    if (seconds < 60) return `${seconds}s`;
    return `${Math.round(seconds / 60)}m`;
}

function formatTime(iso?: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso?: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ConversationDetailPanel({ botId, convId, onClose }: ConversationDetailPanelProps) {
    const { data: conv, isLoading } = useConversationDetail(botId, convId);
    const { data: resumeVersions } = useResumeVersions(botId);
    const [showFullTranscript, setShowFullTranscript] = React.useState(false);

    const previewMessages = conv?.messages?.slice(0, 3) ?? [];
    const extraCount = (conv?.messages?.length ?? 0) - previewMessages.length;
    const displayMessages = showFullTranscript ? (conv?.messages ?? []) : previewMessages;

    return (
        <motion.div
            key="detail-panel"
            initial={{ x: 340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 340, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="w-[340px] flex-shrink-0 border-l border-slate-100 dark:border-white/[0.06] flex flex-col bg-white dark:bg-[#111318] overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
                <div>
                    <div className="text-[13px] font-semibold text-slate-900 dark:text-white">
                        Conversation Detail
                    </div>
                    {conv && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {formatDate(conv.started_at)}
                            {conv.recruiter_company ? ` · ${conv.recruiter_company}` : ""}
                        </div>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                    <X size={12} />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {isLoading && (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-14 rounded-xl bg-slate-100 dark:bg-white/[0.04]" />
                        <div className="grid grid-cols-3 gap-2">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-white/[0.04]" />
                            ))}
                        </div>
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-white/[0.04]" />
                        ))}
                    </div>
                )}

                {!isLoading && conv && (
                    <>
                        {/* Recruiter info */}
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-3.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                                <Image
                                    src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(conv.recruiter_name ?? "R")}&backgroundColor=4f46e5`}
                                    alt={conv.recruiter_name ?? "Recruiter"}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                                    {conv.recruiter_name ?? "Unknown Recruiter"}
                                </div>
                                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                                    {conv.recruiter_company ?? "Unknown Company"}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl p-3 text-center">
                                <div className="text-[17px] font-800 font-extrabold text-slate-900 dark:text-white">
                                    {conv.message_count}
                                </div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Messages</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl p-3 text-center">
                                <div className="text-[17px] font-800 font-extrabold text-slate-900 dark:text-white">
                                    {formatDuration(conv.duration_seconds)}
                                </div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Duration</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl p-3 text-center">
                                <div
                                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-1 rounded-lg inline-block ${STATUS_STYLES[conv.status]}`}
                                >
                                    {conv.status}
                                </div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Status</div>
                            </div>
                        </div>

                        {/* Summary */}
                        {conv.summary && (
                            <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl p-3.5">
                                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                                    AI Summary
                                </div>
                                <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {conv.summary}
                                </p>
                            </div>
                        )}

                        {/* Transcript */}
                        {conv.messages.length > 0 && (
                            <div className="space-y-3">
                                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Transcript
                                </div>
                                {displayMessages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex gap-2 ${msg.role === "user" ? "flex-row" : "flex-row-reverse"}`}
                                    >
                                        <div className="w-6 h-6 rounded-[7px] flex-shrink-0 overflow-hidden border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center text-[9px] font-bold text-slate-500">
                                            {msg.role === "user" ? (
                                                <Image
                                                    src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(conv.recruiter_name ?? "R")}&backgroundColor=4f46e5`}
                                                    alt="Recruiter"
                                                    width={24}
                                                    height={24}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-indigo-600 dark:text-purple-400 font-extrabold text-[8px]">AI</span>
                                            )}
                                        </div>
                                        <div className="max-w-[85%]">
                                            <div
                                                className={`rounded-xl px-3 py-2 text-[12px] leading-relaxed ${
                                                    msg.role === "user"
                                                        ? "bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 rounded-tl-sm"
                                                        : "bg-indigo-50 dark:bg-purple-500/[0.12] border border-indigo-100 dark:border-purple-500/20 text-indigo-800 dark:text-purple-200 rounded-tr-sm"
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                            {msg.timestamp && (
                                                <span className="text-[9px] text-slate-300 dark:text-slate-600 mt-1 block">
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {extraCount > 0 && (
                                    <button
                                        onClick={() => setShowFullTranscript(!showFullTranscript)}
                                        className="w-full flex items-center justify-center gap-2 py-2 text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    >
                                        {showFullTranscript ? (
                                            <>
                                                <ChevronUp size={12} /> Collapse
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown size={12} /> {extraCount} more messages
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Divider */}
                        <div className="h-px bg-slate-100 dark:bg-white/[0.05] -mx-5" />

                        {/* Resume versions */}
                        {resumeVersions && resumeVersions.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Resume Versions
                                </div>
                                {resumeVersions.map((rv: ResumeVersion) => (
                                    <div
                                        key={rv.id}
                                        className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                                            rv.is_active
                                                ? "border-green-200 dark:border-green-500/20 bg-green-50/50 dark:bg-green-500/[0.04]"
                                                : "border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] hover:border-slate-200 dark:hover:border-white/10"
                                        }`}
                                    >
                                        <div
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                rv.is_active
                                                    ? "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400"
                                                    : "bg-slate-100 dark:bg-white/[0.05] text-slate-400"
                                            }`}
                                        >
                                            <FileText size={13} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[12px] font-semibold text-slate-800 dark:text-white truncate">
                                                {rv.filename}
                                            </div>
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                                {formatDate(rv.uploaded_at)}
                                            </div>
                                        </div>
                                        <span
                                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                                                rv.is_active
                                                    ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400"
                                                    : "bg-slate-100 dark:bg-white/[0.05] text-slate-400"
                                            }`}
                                        >
                                            {rv.is_active ? "Active" : `v${rv.version_number}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {!isLoading && !conv && (
                    <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-8">
                        Could not load conversation.
                    </div>
                )}
            </div>
        </motion.div>
    );
}
