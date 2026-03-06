import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiKeyService } from "@/services/apikey.service";

export const useApiKeys = () => {
    return useQuery({
        queryKey: ["apiKeys"],
        queryFn: ApiKeyService.getKeys,
    });
};

export const useCreateApiKey = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ApiKeyService.createKey,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
        },
    });
};

export const useDeleteApiKey = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (keyId: string) => ApiKeyService.deleteKey(keyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
        },
    });
};
