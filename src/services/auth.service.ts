import api from "@/lib/api";

export const AuthService = {
    login: async (email: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const response = await api.post("/auth/login", formData, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        return response.data; // expects { access_token: string }
    },
    // add logout if backend requires server-side invalidation later
};
