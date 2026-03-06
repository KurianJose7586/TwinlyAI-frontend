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
    "Waking up the server from its afternoon nap...",
    "Assembling neural pathways...",
    "Herding electronic sheep...",
    "Brewing digital coffee for the backend...",
    "Polishing the vector database...",
    "Synchronizing with the hive mind...",
    "Charging the flux capacitor...",
    "Dusting off the server racks...",
    "Optimizing spacetime coordinates...",
    "Loading personality subroutines..."
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
        const handleLoadingEvent = (e: any) => {
            const { show, message } = e.detail;
            if (show) startLoading(message);
            else stopLoading();
        };

        window.addEventListener("twinly-loading", handleLoadingEvent);
        return () => window.removeEventListener("twinly-loading", handleLoadingEvent);
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
