"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Inbox, Loader2, Send, CheckCircle2 } from "lucide-react";
import { useRelayInbox } from "@/hooks/useRelays";
import { RelayService, timeAgo, type Relay } from "@/services/relay.service";

function PendingQuestion({ relay, onAnswered }: { relay: Relay; onAnswered: () => void }) {
    const [answer, setAnswer] = React.useState("");
    const [shareWithAll, setShareWithAll] = React.useState(true);
    const [sending, setSending] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const submit = async () => {
        if (!answer.trim() || sending) return;
        setSending(true);
        setError(null);
        try {
            await RelayService.answer(relay.id, answer.trim(), shareWithAll);
            onAnswered();
        } catch (err) {
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            setError(detail || "Couldn't send your answer. Please try again.");
            setSending(false);
        }
    };

    return (
        <div className="border border-amber-200 dark:border-amber-500/20 bg-amber-50/40 dark:bg-amber-500/[0.04] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">{relay.asker}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">{timeAgo(relay.created_at)}</span>
            </div>
            <p className="text-[15px] font-medium text-slate-900 dark:text-white">&ldquo;{relay.question}&rdquo;</p>
            <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
                rows={2}
                maxLength={2000}
                placeholder="Your answer…"
                className="resize-none w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-400 dark:focus:border-white/20 text-slate-900 dark:text-white"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                    <input type="checkbox" checked={shareWithAll} onChange={(e) => setShareWithAll(e.target.checked)} className="accent-slate-900 dark:accent-white" />
                    Let my twin reuse this answer with other recruiters
                </label>
                <button
                    onClick={submit}
                    disabled={!answer.trim() || sending}
                    className="px-4 py-2 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 disabled:opacity-40"
                >
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Send answer
                </button>
            </div>
            {error && <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}

export function RelayInbox() {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, refetch } = useRelayInbox(true);
    const [linking, setLinking] = React.useState(false);

    const refresh = () => queryClient.invalidateQueries({ queryKey: ["relay-inbox"] });
    const pending = data?.relays.filter((r) => r.status === "pending") ?? [];
    const answered = data?.relays.filter((r) => r.status === "answered") ?? [];

    const connectTelegram = async () => {
        // Open the tab synchronously so popup blockers allow it, then point it at the one-time link
        const tab = window.open("", "_blank");
        setLinking(true);
        try {
            const { url } = await RelayService.telegramLink();
            if (tab) tab.location.href = url;
            else window.location.href = url;
        } catch {
            tab?.close();
        }
        setLinking(false);
    };

    const disconnectTelegram = async () => {
        await RelayService.telegramUnlink().catch(() => {});
        refresh();
    };

    return (
        <div className="max-w-3xl space-y-8 animate-in fade-in duration-300 pb-12">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white">Questions for you</h2>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                        When your twin can&apos;t answer a recruiter from your resume or code, it asks you here. Answer once and your twin remembers.
                    </p>
                </div>
                {data?.telegram_enabled && (
                    data.telegram_connected ? (
                        <div className="flex items-center gap-3 text-[12px]">
                            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                                <CheckCircle2 size={14} /> Telegram connected
                            </span>
                            <button onClick={disconnectTelegram} className="text-slate-400 hover:text-red-500 transition-colors">Disconnect</button>
                        </div>
                    ) : (
                        <button
                            onClick={connectTelegram}
                            disabled={linking}
                            className="px-4 py-2 rounded-md border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {linking ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Get questions on Telegram
                        </button>
                    )
                )}
            </div>

            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}

            {isError && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    Couldn&apos;t load your questions. <button onClick={() => refetch()} className="underline">Retry</button>
                </div>
            )}

            {data && pending.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-12 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                    <Inbox size={22} className="text-slate-300 dark:text-slate-600" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No questions waiting. Your twin is handling things.</p>
                </div>
            )}

            {pending.length > 0 && (
                <section className="space-y-4">
                    {pending.map((relay) => (
                        <PendingQuestion key={relay.id} relay={relay} onAnswered={refresh} />
                    ))}
                </section>
            )}

            {answered.length > 0 && (
                <section>
                    <h3 className="text-[12px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Answered</h3>
                    <div className="divide-y divide-slate-100 dark:divide-white/[0.06] border border-slate-100 dark:border-white/[0.06] rounded-xl">
                        {answered.map((relay) => (
                            <div key={relay.id} className="p-4 space-y-1">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-[13px] font-medium text-slate-900 dark:text-white">{relay.question}</p>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">{timeAgo(relay.answered_at)}</span>
                                </div>
                                <p className="text-[13px] text-slate-600 dark:text-slate-300">{relay.answer}</p>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                    {relay.asker} · {relay.share_with_all ? "your twin reuses this answer" : "only shared with them"}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
