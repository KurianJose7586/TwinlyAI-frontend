import api from "@/lib/api";

export const CandidateService = {
    searchCandidates: async (query: string) => {
        const response = await api.post("/recruiter/search", { query });
        return response.data;
    },

    // Future feature: get all candidates if query is empty
    getCandidates: async () => {
        const response = await api.get("/recruiter/candidates");
        return response.data;
    }
};
