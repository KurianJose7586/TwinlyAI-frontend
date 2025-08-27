// lib/api.ts

const API_URL = "http://127.0.0.1:8000/api/v1";

// Helper to get headers, including Authorization if token exists
const getAuthHeaders = (token?: string) => {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem("token") : null);
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
};

export const api = {
  // --- ADD THIS 'GET' METHOD ---
  get: async (endpoint: string, token?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "An API error occurred");
    }
    return response.json();
  },

  post: async (endpoint: string, data: any, token?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "An API error occurred");
    }
    return response.json();
  },
};