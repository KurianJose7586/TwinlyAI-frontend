// src/lib/auth.ts
// Helper utilities for token and user storage.

const TOKEN_KEY = "twinly_token";
const USER_KEY = "twinly_user";

export type StoredUser = {
    email: string;
    role: "candidate" | "recruiter";
    id?: string;
};

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    // Also write a cookie so Next.js edge middleware (which can't read localStorage) can see it
    document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax; max-age=86400`;
}

export function clearToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Remove the cookie too
    document.cookie = `${TOKEN_KEY}=; path=/; SameSite=Lax; max-age=0`;
}

export function getStoredUser(): StoredUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as StoredUser;
    } catch {
        return null;
    }
}

export function setStoredUser(user: StoredUser): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Decode role from JWT payload (base64) without external libs. */
export function decodeTokenPayload(token: string): Record<string, unknown> | null {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}
