import api from "@/lib/api";

export type BotUpdateData = {
    name?: string;
    description?: string;
    is_public?: boolean;
    // Add other fields as needed based on backend
} & Record<string, unknown>;

export const BotService = {
    getBots: async () => {
        const response = await api.get("/api/v1/bots/");
        return response.data;
    },

    updateBot: async (botId: string, data: BotUpdateData) => {
        const response = await api.patch(`/api/v1/bots/${botId}`, data);
        return response.data;
    },

    chatWithBot: async (botId: string, message: string) => {
        // Note: since this expects streaming backend currently doesn't use simple axios
        // This is typically handled by native fetch/EventSource
        return null;
    }
};
