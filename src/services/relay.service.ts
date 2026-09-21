// src/services/relay.service.ts
// Live Relay: questions the twin couldn't answer, sent to the real candidate.
import api from "@/lib/api";

export type Relay = {
    id: string;
    bot_id: string;
    question: string;
    status: "pending" | "answered";
    answer: string | null;
    share_with_all: boolean;
    asker: string;
    created_at: string | null;
    answered_at: string | null;
};

export type RelayInbox = {
    telegram_enabled: boolean;
    telegram_connected: boolean;
    relays: Relay[];
};

export const RelayService = {
    /** Recruiter: their own relays for one candidate, oldest first */
    listForBot: async (botId: string): Promise<Relay[]> => (await api.get(`/api/v1/bots/${botId}/relays`)).data,

    /** Recruiter: ask the real candidate directly */
    ask: async (botId: string, question: string): Promise<{ status: string }> =>
        (await api.post(`/api/v1/bots/${botId}/relays`, { question })).data,

    /** Candidate: questions waiting for them + Telegram status */
    inbox: async (): Promise<RelayInbox> => (await api.get("/api/v1/relays/inbox")).data,

    answer: async (relayId: string, answer: string, shareWithAll: boolean): Promise<Relay> =>
        (await api.post(`/api/v1/relays/${relayId}/answer`, { answer, share_with_all: shareWithAll })).data,

    telegramLink: async (): Promise<{ url: string }> => (await api.post("/api/v1/relays/telegram/link")).data,

    telegramUnlink: async (): Promise<void> => {
        await api.delete("/api/v1/relays/telegram/link");
    },
};

/** "just now", "5m ago", "3h ago", or a date */
export function timeAgo(iso: string | null): string {
    if (!iso) return "";
    const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
