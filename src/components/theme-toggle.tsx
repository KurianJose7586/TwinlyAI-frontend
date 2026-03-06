"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
    const { setTheme, theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                className="relative p-2 rounded-full hover:bg-[var(--bg-card-hover)] transition-colors opacity-0"
                aria-label="Toggle theme"
            >
                <div className="w-[1.2rem] h-[1.2rem]" />
            </button>
        );
    }

    const currentTheme = theme === "system" ? resolvedTheme : theme;

    return (
        <button
            onClick={() => setTheme(currentTheme === "light" ? "dark" : "light")}
            className="relative p-2 rounded-full hover:bg-[var(--bg-card-hover)] transition-colors"
            aria-label="Toggle theme"
        >
            <motion.div
                initial={false}
                animate={{
                    scale: currentTheme === "light" ? 1 : 0,
                    opacity: currentTheme === "light" ? 1 : 0,
                    rotate: currentTheme === "light" ? 0 : 90,
                }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center p-2"
            >
                <Sun className="h-[1.2rem] w-[1.2rem] text-[var(--text-main)]" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{
                    scale: currentTheme === "dark" ? 1 : 0,
                    opacity: currentTheme === "dark" ? 1 : 0,
                    rotate: currentTheme === "dark" ? 0 : -90,
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center p-2"
            >
                <Moon className="h-[1.2rem] w-[1.2rem] text-[var(--text-main)]" />
            </motion.div>
        </button>
    );
}
