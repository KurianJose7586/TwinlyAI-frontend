// lib/api.ts
const API_URL = "http://127.0.0.1:8000/api/v1";

export const api = {
  post: async (endpoint: string, data: any, token?: string) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "An API error occurred");
    }
    return response.json();
  },
  // You can add get, put, delete methods here later
};  