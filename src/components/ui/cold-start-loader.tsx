"use client";

import React from "react";
import { useLoading } from "@/context/LoadingContext";
import { AnimatePresence, motion } from "framer-motion";

export const ColdStartLoader = () => {
    const { isLoading, loadingMessage } = useLoading();

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-2xl"
                >
                    {/* Background Fluid Blobs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                                x: [-20, 20, -20],
                                y: [-20, 20, -20]
                            }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                rotate: [0, -90, 0],
                                x: [20, -20, 20],
                                y: [20, -20, 20]
                            }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[130px]"
                        />
                    </div>

                    <div className="relative flex flex-col items-center">
                        {/* Animated Logo/Icon Placeholder */}
                        <div className="mb-12 relative h-32 w-32">
                            <motion.div
                                animate={{
                                    rotate: 360,
                                    borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 20% 80% / 25% 80% 20% 75%", "30% 70% 70% 30% / 30% 30% 70% 70%"]
                                }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-tr from-purple-500 via-cyan-400 to-pink-500 opacity-60 blur-xl"
                            />
                            <div className="absolute inset-4 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl overflow-hidden group">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-white text-4xl font-bold tracking-tighter"
                                >
                                    T
                                </motion.div>
                                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
                            </div>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mb-6 border border-white/10 shadow-inner">
                            <motion.div
                                animate={{
                                    x: ["-100%", "100%"]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                            />
                        </div>

                        {/* Witty Message */}
                        <motion.div
                            key={loadingMessage}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center px-8"
                        >
                            <p className="text-white/90 text-lg font-light tracking-wide max-w-sm leading-relaxed mb-1">
                                {loadingMessage}
                            </p>
                            <p className="text-white/30 text-[10px] font-mono uppercase tracking-[0.2em]">
                                TwinlyAI Cloud Processing
                            </p>
                        </motion.div>
                    </div>

                    {/* Bottom Status */}
                    <div className="fixed bottom-12 flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <div className="flex gap-1.5">
                            <motion.div
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                                className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                            />
                            <motion.div
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                                className="w-1.5 h-1.5 rounded-full bg-purple-400"
                            />
                            <motion.div
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                                className="w-1.5 h-1.5 rounded-full bg-pink-400"
                            />
                        </div>
                        <span className="text-[11px] font-medium text-white/50 uppercase tracking-widest">
                            Establishing Connection
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
