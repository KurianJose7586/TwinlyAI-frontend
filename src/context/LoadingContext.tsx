"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

type LoadingContextType = {
    isLoading: boolean;
    loadingMessage: string;
    startLoading: (message?: string) => void;
    stopLoading: () => void;
    setLoadingMessage: (message: string) => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

const WITTY_MESSAGES = [
    "Creating your digital twin...",
    "Teaching your twin to think like you...",
    "Parsing the story of your career...",
    "Extracting what makes you, you...",
    "Building your professional knowledge base...",
    "Waking up the AI backend...",
    "Synthesizing your professional identity...",
    "Almost ready to introduce you to your twin...",
    "Mapping your expertise to the cosmos...",
    "Your twin is warming up..."
];

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessageState] = useState(WITTY_MESSAGES[0]);
    const [messageIndex, setMessageIndex] = useState(0);

    const startLoading = useCallback((message?: string) => {
        if (message) setLoadingMessageState(message);
        setIsLoading(true);
    }, []);

    const stopLoading = useCallback(() => {
        setIsLoading(false);
    }, []);

    const setLoadingMessage = useCallback((message: string) => {
        setLoadingMessageState(message);
    }, []);

    // Listen for events from api.ts (non-component context)
    useEffect(() => {
        const handleLoadingEvent = (e: Event) => {
            const customEvent = e as CustomEvent<{ show: boolean; message?: string }>;
            const { show, message } = customEvent.detail;
            if (show) startLoading(message);
            else stopLoading();
        };

        window.addEventListener("twinly-loading", handleLoadingEvent as EventListener);
        return () => window.removeEventListener("twinly-loading", handleLoadingEvent as EventListener);
    }, [startLoading, stopLoading]);

    // Cycle through messages while loading
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => {
                setMessageIndex((prev) => {
                    const next = (prev + 1) % WITTY_MESSAGES.length;
                    setLoadingMessageState(WITTY_MESSAGES[next]);
                    return next;
                });
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    return (
        <LoadingContext.Provider value={{ isLoading, loadingMessage, startLoading, stopLoading, setLoadingMessage }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading(): LoadingContextType {
    const ctx = useContext(LoadingContext);
    if (!ctx) throw new Error("useLoading must be used inside <LoadingProvider>");
    return ctx;
}
