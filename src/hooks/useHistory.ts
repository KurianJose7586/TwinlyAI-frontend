// src/hooks/useHistory.ts
import { useQuery } from "@tanstack/react-query";
import { HistoryService } from "@/services/history.service";

export const useActivityFeed = () =>
    useQuery({
        queryKey: ["activity-feed"],
        queryFn: HistoryService.getActivityFeed,
        staleTime: 2 * 60 * 1000,
    });

export const useConversations = (botId: string | null) =>
    useQuery({
        queryKey: ["conversations", botId],
        queryFn: () => HistoryService.getConversations(botId!),
        enabled: !!botId,
        staleTime: 2 * 60 * 1000,
    });

export const useConversationDetail = (botId: string | null, convId: string | null) =>
    useQuery({
        queryKey: ["conversation-detail", botId, convId],
        queryFn: () => HistoryService.getConversationDetail(botId!, convId!),
        enabled: !!botId && !!convId,
        staleTime: 5 * 60 * 1000,
    });

export const useResumeVersions = (botId: string | null) =>
    useQuery({
        queryKey: ["resume-versions", botId],
        queryFn: () => HistoryService.getResumeVersions(botId!),
        enabled: !!botId,
        staleTime: 5 * 60 * 1000,
    });
