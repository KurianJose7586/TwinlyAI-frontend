import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BotService, type BotUpdateData } from "@/services/bot.service";

export const useBots = () => {
    return useQuery({
        queryKey: ["bots"],
        queryFn: BotService.getBots,
        staleTime: 5 * 60 * 1000, // 5 min — prevents refetch loop on 4xx errors
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
