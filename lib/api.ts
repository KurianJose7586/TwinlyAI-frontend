// lib/api.ts
const API_URL = "http://127.0.0.1:8000/api/v1";

export const api = {
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "An error occurred");
    }
    return response.json();
  },
};