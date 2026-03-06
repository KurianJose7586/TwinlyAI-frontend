import api from "@/lib/api";

export const BotService = {
    getBots: async () => {
        const response = await api.get("/bots/");
        return response.data;
    },

    updateBot: async (botId: string, data: any) => {
        const response = await api.patch(`/bots/${botId}`, data);
        return response.data;
    },

    chatWithBot: async (botId: string, message: string) => {
        // Note: since this expects streaming backend currently doesn't use simple axios
        // This is typically handled by native fetch/EventSource
        return null;
    }
};
