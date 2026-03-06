import { useQuery, useMutation } from "@tanstack/react-query";
import { CandidateService } from "@/services/candidate.service";

// Hook to search candidates
export const useSearchCandidates = () => {
    return useMutation({
        mutationFn: (query: string) => CandidateService.searchCandidates(query),
    });
};

// Hook to fetch initial candidates when there is no search query
// Note: using query for now, or just an initial fetch if backend supports it.
export const useCandidates = () => {
    return useQuery({
        queryKey: ["candidates"],
        queryFn: CandidateService.getCandidates,
        retry: 1,
        // you could disable this until backend has a real generic candidate list endpoint
        // enabled: false, 
    });
};
