import { useQuery, useMutation } from "@tanstack/react-query";
import { CandidateService } from "@/services/candidate.service";
import axios from "axios";

// Hook to search candidates
export const useSearchCandidates = () => {
    return useMutation({
        mutationFn: async (query: string) => {
            try {
                return await CandidateService.searchCandidates(query);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    if (err.response?.status === 403) {
                        throw new Error("Search requires a Pro subscription. Please upgrade your plan.");
                    }
                    if (err.response?.status === 429) {
                        throw new Error("Too many searches. Please wait a moment and try again.");
                    }
                }
                throw err;
            }
        },
    });
};

// Hook to fetch initial candidates when there is no search query
export const useCandidates = () => {
    return useQuery({
        queryKey: ["candidates"],
        queryFn: CandidateService.getCandidates,
        retry: 1,
        staleTime: 2 * 60 * 1000, // 2 min cache — avoid hammering the endpoint
    });
};
