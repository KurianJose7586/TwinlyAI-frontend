// src/services/candidate.service.ts
import api from "@/lib/api";

export const CandidateService = {
    searchCandidates: async (query: string) => {
        // Use the full path matching your backend main.py + recruiter.py
        const response = await api.post("/api/v1/recruiter/search", { query });
        return response.data;
    },

    getCandidates: async () => {
        const response = await api.get("/api/v1/recruiter/candidates");
        return response.data;
    }
};