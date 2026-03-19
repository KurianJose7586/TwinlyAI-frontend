import api from "@/lib/api";
import { UserProfile } from "@/types";

export const UserService = {
    // Fetch current user profile
    getProfile: async (): Promise<UserProfile> => {
        const response = await api.get("/api/v1/users/me");
        return response.data;
    },

    // Update user profile 
    // currently we don't have a PUT endpoint in backend for /users/me but we stub it
    updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
        const response = await api.put("/api/v1/users/me", data);
        return response.data;
    }
};
