"use client";

// src/context/AuthContext.tsx
// Global auth state: provides the current user, login, logout, and loading state.

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { AuthService } from "@/services/auth.service";
import {
    getToken,
    setToken,
    clearToken,
    getStoredUser,
    setStoredUser,
    decodeTokenPayload,
    StoredUser,
} from "@/lib/auth";

type AuthContextType = {
    user: StoredUser | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    logout: () => void;
    setAuthFromToken: (token: string) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());
    const [token, setTokenState] = useState<string | null>(() => getToken());
    const [isLoading, setIsLoading] = useState(() => {
        // If we have a token but no user, or vice versa, we might need a tick to settle, 
        // but generally we can determine initial loading base on existence of local session data.
        return false;
    });
    const queryClient = useQueryClient();

    // Parse a raw JWT and persist user + token
    const setAuthFromToken = useCallback((rawToken: string) => {
        setToken(rawToken);
        setTokenState(rawToken);
        const payload = decodeTokenPayload(rawToken);
        if (payload) {
            const u: StoredUser = {
                email: payload.sub as string,
                role: (payload.role as "candidate" | "recruiter") ?? "candidate",
                onboarding_complete: !!payload.onboarding_complete,
            };
            setStoredUser(u);
            setUser(u);
        }
    }, []);

    // Session consistency on mount
    useEffect(() => {
        const t = getToken();
        if (t) {
            // Crucial: Re-write the cookie just in case it expired or was cleared, but localStorage wasn't
            setToken(t);
        }
    }, []);

    const login = async (email: string, password: string, rememberMe = false) => {
        // Clear old profile cache to prevent cross-account ghosting
        queryClient.clear();

        const data = await AuthService.login(email, password);
        const { access_token } = data;

        // Store token and parse user immediately (synchronous)
        setToken(access_token, rememberMe);
        setTokenState(access_token);
        const payload = decodeTokenPayload(access_token);
        const role = (payload?.role as "candidate" | "recruiter") ?? "candidate";
        const onboarding_complete = !!payload?.onboarding_complete;
        const u: StoredUser = {
            email: payload?.sub as string ?? email,
            role,
            onboarding_complete,
        };
        setStoredUser(u);
        setUser(u);

        // Persist email so sub-pages (e.g. voice call) can display the recruiter's name
        if (typeof window !== "undefined") {
            localStorage.setItem("recruiter_email", u.email || email);
        }

        // Navigate based on role — read directly, don't wait for state
        // Navigate based on role and onboarding status
        if (!onboarding_complete) {
            router.push(`/onboarding?role=${role}`);
        } else {
            router.push(role === "recruiter" ? "/recruiter" : "/candidate-active");
        }
    };

    const logout = () => {
        queryClient.clear();
        clearToken();
        setUser(null);
        setTokenState(null);

        if (typeof window !== "undefined") {
            const keysToRemove = [
                "twinly_botId",
                "twinly_userName",
                "userName",
                "userAvatar",
                "recruiter_chat_botId",
                "recruiter_chat_botName",
                "recruiter_keywords",
                "recruiter_email",
                "recruiter_name",
                "onboarding_state"
            ];
            keysToRemove.forEach(k => localStorage.removeItem(k));
        }

        // Use a hard navigation instead of router.push so the browser commits
        // the cookie deletion (max-age=0) before the next request hits the
        // middleware. router.push is a SPA transition that can race against the
        // cookie expiry, causing the middleware to see the old token on /login
        // and immediately redirect back to /candidate-active.
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, setAuthFromToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
