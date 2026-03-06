"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function WordRorate({ words }: { words: string[] }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [words.length]);

    // Find the longest word to maintain a constant container width
    const longestWord = [...words].sort((a, b) => b.length - a.length)[0];

    return (
        <div className="inline-grid relative overflow-hidden align-bottom text-left pb-2">
            {/* Invisible placeholder reserves the exact width of the longest word */}
            <span className="invisible pointer-events-none col-start-1 row-start-1 whitespace-nowrap">
                {longestWord}
            </span>
            <div className="col-start-1 row-start-1 flex items-center justify-start overflow-hidden">
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={index}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
                        className="inline-block bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-white/60 bg-clip-text text-transparent whitespace-nowrap"
                    >
                        {words[index]}
                    </motion.span>
                </AnimatePresence>
            </div>
        </div>
    );
}
