import api from "@/lib/api";

export const AuthService = {
    login: async (email: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        // Explicitly include the full versioned path
        const response = await api.post("api/v1/auth/login", formData, { //
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        return response.data;
    },
};
