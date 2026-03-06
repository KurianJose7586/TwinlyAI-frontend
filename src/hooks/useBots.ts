import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BotService, type BotUpdateData } from "@/services/bot.service";

export const useBots = () => {
    return useQuery({
        queryKey: ["bots"],
        queryFn: BotService.getBots,
    });
};

export const useUpdateBot = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ botId, data }: { botId: string; data: BotUpdateData }) => BotService.updateBot(botId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bots"] });
        },
    });
};
