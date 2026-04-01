"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { History, FileText, Edit3, Search, MessageSquare, Clock } from "lucide-react";
import Image from "next/image";
import { useActivityFeed, useConversationDetail, useResumeVersions } from "@/hooks/useHistory";
import { ConversationDetailPanel } from "./ConversationDetailPanel";
import type { ActivityEvent, ConversationStatus } from "@/types/history";

interface HistoryTabProps {
    botId: string | null;
}

type FilterType = "all" | "chat" | "resume" | "profile";

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ConversationStatus, string> = {
    qualified: "bg-green-100 text-green-700 dark:bg-green-500/12 dark:text-green-400",
    cold: "bg-slate-100 text-slate-500 dark:bg-white/[0.05] dark:text-slate-500",
    followup: "bg-blue-100 text-blue-700 dark:bg-blue-500/12 dark:text-blue-400",
    ghosted: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

const STATUS_LABELS: Record<ConversationStatus, string> = {
    qualified: "✦ Qualified Lead",
    cold: "Cold Outreach",
    followup: "↗ Follow-up",
    ghosted: "✕ Ghosted",
};

function formatRelative(iso: string): string {
    const now = new Date();
    const date = new Date(iso);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatMonthYear(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function groupByMonth(events: ActivityEvent[]): [string, ActivityEvent[]][] {
    const groups: Map<string, ActivityEvent[]> = new Map();
    for (const e of events) {
        const key = formatMonthYear(e.created_at);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(e);
    }
    return Array.from(groups.entries());
}

// ── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="flex gap-4 animate-pulse">
            <div className="flex flex-col items-center w-5 flex-shrink-0 pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-white/10 mt-1" />
                <div className="w-px flex-1 bg-slate-100 dark:bg-white/[0.04] mt-1 min-h-[48px]" />
            </div>
            <div className="flex-1 pb-4">
                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-white/10 flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3 w-32 bg-slate-200 dark:bg-white/10 rounded" />
                            <div className="h-2.5 w-20 bg-slate-100 dark:bg-white/[0.06] rounded" />
                        </div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-white/[0.06] rounded" />
                    <div className="h-2.5 w-3/4 bg-slate-100 dark:bg-white/[0.06] rounded" />
                </div>
            </div>
        </div>
    );
}

// ── Dot colour per event type ─────────────────────────────────────────────────
const DOT_COLORS: Record<string, string> = {
    chat: "bg-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]",
    resume: "bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]",
    profile: "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]",
};

// ── Main component ────────────────────────────────────────────────────────────
export function HistoryTab({ botId }: HistoryTabProps) {
    const { data: feed, isLoading, isError, refetch } = useActivityFeed();
    const [selectedConvId, setSelectedConvId] = React.useState<string | null>(null);
    const [filter, setFilter] = React.useState<FilterType>("all");
    const [search, setSearch] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");

    // Debounce search input
    React.useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    // Filtered events
    const filteredFeed = React.useMemo(() => {
        if (!feed) return [];
        let events = feed;

        // Type filter
        if (filter !== "all") {
            events = events.filter((e) =>
                filter === "chat" ? e.event_type === "chat" :
                filter === "resume" ? e.event_type === "resume" :
                e.event_type === "profile"
            );
        }

        // Search
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            events = events.filter(
                (e) =>
                    e.title?.toLowerCase().includes(q) ||
                    e.detail?.toLowerCase().includes(q)
            );
        }

        return events;
    }, [feed, filter, debouncedSearch]);

    const groupedFeed = React.useMemo(() => groupByMonth(filteredFeed), [filteredFeed]);

    return (
        <div className="flex h-full -mx-8 -my-8 overflow-hidden">
            {/* ── Timeline column ── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Sub-header: search + filters */}
                <div className="flex items-center gap-3 px-8 py-4 border-b border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#111318] sticky top-0 z-10">
                    {/* Search */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] rounded-xl px-3 py-2 flex-1 max-w-xs">
                        <Search size={13} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search conversations…"
                            className="bg-transparent text-[13px] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none flex-1 min-w-0"
                        />
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center bg-slate-100 dark:bg-white/[0.05] rounded-lg p-0.5 gap-0.5">
                        {(["all", "chat", "resume", "profile"] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-[7px] text-[11px] font-semibold capitalize transition-colors ${
                                    filter === f
                                        ? "bg-white dark:bg-white/[0.1] text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Timeline body */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    {/* Loading skeletons */}
                    {isLoading && (
                        <div className="space-y-2">
                            {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                        </div>
                    )}

                    {/* Error */}
                    {isError && (
                        <div className="flex flex-col items-center gap-4 py-16 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-500">
                                <History size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">Failed to load history</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Something went wrong fetching your activity feed.</p>
                            </div>
                            <button
                                onClick={() => refetch()}
                                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-80 transition-opacity"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && !isError && filteredFeed.length === 0 && (
                        <div className="flex flex-col items-center gap-4 py-20 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-slate-400 dark:text-slate-500">
                                <History size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    {debouncedSearch ? "No results found" : "No activity yet"}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                                    {debouncedSearch
                                        ? `No events match "${debouncedSearch}"`
                                        : "Your Twin hasn't had any conversations yet. Share your profile link to get started."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Timeline groups */}
                    {!isLoading && !isError && groupedFeed.map(([month, events]) => (
                        <div key={month}>
                            {/* Month label */}
                            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300 dark:text-white/20 mb-3 pl-7">
                                {month}
                            </div>

                            {events.map((event, idx) => {
                                const isLast = idx === events.length - 1;
                                const isConv = event.event_type === "chat";
                                const isSelected = isConv && event.ref_id === selectedConvId;

                                return (
                                    <div key={event.id} className="flex gap-4">
                                        {/* Timeline track */}
                                        <div className="flex flex-col items-center w-5 flex-shrink-0 pt-1">
                                            <div
                                                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 z-10 ${DOT_COLORS[event.event_type] ?? "bg-slate-300"}`}
                                            />
                                            {!isLast && (
                                                <div className="w-px flex-1 bg-slate-100 dark:bg-white/[0.04] mt-1 min-h-[20px]" />
                                            )}
                                        </div>

                                        {/* Card */}
                                        <div className="flex-1 pb-4 min-w-0">
                                            {isConv ? (
                                                /* Conversation card */
                                                <button
                                                    onClick={() => setSelectedConvId(isSelected ? null : (event.ref_id ?? null))}
                                                    className={`w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden ${
                                                        isSelected
                                                            ? "border-indigo-200 dark:border-purple-500/30 bg-indigo-50/50 dark:bg-purple-500/[0.04] shadow-[0_0_0_3px_rgba(99,102,241,0.08)]"
                                                            : "border-slate-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] hover:border-slate-200 dark:hover:border-purple-500/20 hover:shadow-sm"
                                                    }`}
                                                >
                                                    {/* Card top */}
                                                    <div className="flex items-start gap-3 p-4">
                                                        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03]">
                                                            <Image
                                                                src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(event.title ?? "R")}&backgroundColor=4f46e5`}
                                                                alt={event.title ?? "Recruiter"}
                                                                width={36}
                                                                height={36}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                                                                    {/* title is "Conversation with NAME" */}
                                                                    {event.title.replace("Conversation with ", "")}
                                                                </span>
                                                                {/* We don't have status here directly — show a neutral badge */}
                                                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                                    Chat
                                                                </span>
                                                            </div>
                                                            {event.detail && (
                                                                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                                                                    {event.detail}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Card footer */}
                                                    <div className="flex items-center gap-3 px-4 py-2 border-t border-slate-50 dark:border-white/[0.04] bg-slate-50/50 dark:bg-black/10">
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-1">
                                                            {formatRelative(event.created_at)}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                                            <MessageSquare size={10} />
                                                            View transcript
                                                        </span>
                                                    </div>
                                                </button>
                                            ) : (
                                                /* Simple event pill */
                                                <div className="flex items-center gap-3 bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] rounded-2xl px-4 py-3 shadow-sm">
                                                    <div
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                            event.event_type === "resume"
                                                                ? "bg-blue-100 dark:bg-blue-500/12 text-blue-600 dark:text-blue-400"
                                                                : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                        }`}
                                                    >
                                                        {event.event_type === "resume" ? <FileText size={13} /> : <Edit3 size={13} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-[12px] text-slate-600 dark:text-slate-300">
                                                            {event.title}
                                                            {event.detail && (
                                                                <span className="font-semibold text-slate-800 dark:text-white ml-1">
                                                                    {event.detail}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                                                        {formatRelative(event.created_at)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="mb-4" />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Detail panel ── */}
            <AnimatePresence>
                {selectedConvId && (
                    <ConversationDetailPanel
                        botId={botId}
                        convId={selectedConvId}
                        onClose={() => setSelectedConvId(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
