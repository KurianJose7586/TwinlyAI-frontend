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
        // When mutate is called:
        onMutate: async ({ botId, data }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ["bots"] });

            // Snapshot the previous value
            const previousBots = queryClient.getQueryData<any[]>(["bots"]);

            // Optimistically update to the new value
            if (previousBots) {
                queryClient.setQueryData(["bots"], (old: any[] | undefined) => 
                    old?.map(bot => bot._id === botId ? { ...bot, ...data } : bot)
                );
            }

            // Return a context object with the snapshotted value
            return { previousBots };
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, variables, context) => {
            if (context?.previousBots) {
                queryClient.setQueryData(["bots"], context.previousBots);
            }
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["bots"] });
        },
    });
};
