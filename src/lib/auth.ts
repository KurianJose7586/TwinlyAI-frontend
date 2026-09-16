// src/lib/auth.ts
// Helper utilities for token and user storage.

const TOKEN_KEY = "twinly_token";
const USER_KEY = "twinly_user";

export type StoredUser = {
    email: string;
    role: "candidate" | "recruiter";
    onboarding_complete: boolean;
    id?: string;
};

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, rememberMe = false): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    // Also write a cookie so Next.js edge middleware (which can't read localStorage) can see it.
    // rememberMe=true  → 30-day persistent cookie
    // rememberMe=false → session cookie (no max-age, cleared when browser closes)
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30 days or 7 days default
    document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax; max-age=${maxAge}`;
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

/**
 * Read a token handed over by the OAuth callback. The backend puts it in the URL fragment
 * (#token=...) so it never reaches servers or logs; ?token= is still accepted for older backends.
 */
export function readOAuthToken(searchParams: URLSearchParams): string | null {
    if (typeof window === "undefined") return null;
    const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("token");
    return fromHash || searchParams.get("token");
}

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
    oauth_failed: "Sign-in with your provider failed. Please try again.",
    email_not_verified: "Your provider account has no verified email address.",
    google_login_unavailable: "Google sign-in isn't available right now.",
    github_login_unavailable: "GitHub sign-in isn't available right now.",
};

export function oauthErrorMessage(code: string | null): string | null {
    if (!code) return null;
    return OAUTH_ERROR_MESSAGES[code] ?? "Sign-in failed. Please try again.";
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
