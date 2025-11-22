// lib/api.ts

//const API_URL = "https://joserman-twinlyaibackend.hf.space/api/v1";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface AuthOptions {
  token?: string | null;
  apiKey?: string | null;
}

const getHeaders = (options: AuthOptions = {}) => {
  const { token, apiKey } = options;
  
  // --- FIX: Add Ngrok bypass header ---
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };

  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem("token") : null);

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }
  
  return headers;
};

export const api = {
  get: async (endpoint: string, token?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: getHeaders({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "An API error occurred");
    }
    return response.json();
  },

  post: async (endpoint: string, data: any, authOptions: AuthOptions = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: getHeaders(authOptions),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `API Error: ${response.statusText}`);
    }
    return response.json();
  },
  
  // --- NEW: Add the PATCH method ---
  patch: async (endpoint: string, data: any, token?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders({ token }),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'An API error occurred');
    }
    return response.json();
  },
  
  delete: async (endpoint: string, token?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders({ token }),
    });

    if (!response.ok) {
        const error = await response.json();
        if (error.detail) {
            throw new Error(error.detail);
        }
        throw new Error('An API error occurred');
    }
    return response;
  }
};