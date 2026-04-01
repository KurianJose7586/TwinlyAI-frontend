// src/services/history.service.ts
import api from "@/lib/api";
import type { ActivityEvent, Conversation, ResumeVersion } from "@/types/history";

export const HistoryService = {
    /** Unified activity feed for the current user */
    getActivityFeed: async (): Promise<ActivityEvent[]> => {
        const res = await api.get("/api/v1/users/me/activity");
        return res.data;
    },

    /** All conversations for a bot, newest first */
    getConversations: async (botId: string): Promise<Conversation[]> => {
        const res = await api.get(`/api/v1/bots/${botId}/conversations`);
        return res.data;
    },

    /** Full transcript + detail for a single conversation */
    getConversationDetail: async (botId: string, convId: string): Promise<Conversation> => {
        const res = await api.get(`/api/v1/bots/${botId}/conversations/${convId}`);
        return res.data;
    },

    /** Resume version history for a bot */
    getResumeVersions: async (botId: string): Promise<ResumeVersion[]> => {
        const res = await api.get(`/api/v1/bots/${botId}/resume-versions`);
        return res.data;
    },

    /**
     * Persist a completed conversation.
     * Called by chat pages at the end of a session.
     */
    saveConversation: async (
        botId: string,
        payload: {
            messages: { role: string; content: string; timestamp?: string }[];
            duration_seconds?: number;
            recruiter_name?: string;
            recruiter_company?: string;
            recruiter_email?: string;
            started_at?: string;
        }
    ): Promise<{ id: string; status: string }> => {
        const res = await api.post(`/api/v1/bots/${botId}/conversations`, payload);
        return res.data;
    },
};
