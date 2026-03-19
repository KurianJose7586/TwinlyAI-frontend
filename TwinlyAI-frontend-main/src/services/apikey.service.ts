import api from "@/lib/api";

export const ApiKeyService = {
    getKeys: async () => {
        const response = await api.get("/api/v1/api-keys/");
        return response.data;
    },

    createKey: async () => {
        const response = await api.post("/api/v1/api-keys/");
        return response.data;
    },

    deleteKey: async (keyId: string) => {
        const response = await api.delete(`/api/v1/api-keys/${keyId}`);
        return response.data;
    }
};
