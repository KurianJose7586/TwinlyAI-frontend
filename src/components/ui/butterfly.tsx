"use client";

import React from "react";
import { motion } from "framer-motion";
import { butterflyPaths, type ButterflyPath } from "@/lib/butterfly-data";

interface ButterflyProps {
    className?: string;
    mode?: "icon" | "swarm";
    progress?: number; // 0 to 1, used for swarm dispersion
}

export function Butterfly({ className, mode = "icon", progress = 0 }: ButterflyProps) {
    // Center roughly based on viewport 500x500


    return (
        <div className={className}>
            <svg
                viewBox="0 0 500 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                {butterflyPaths.map((path: ButterflyPath, index: number) => {
                    // simple "explosion" math
                    // We don't have exact center per path, so we displace based on index or just general random noise relative to center
                    // Actually, let's just make them drift slightly away from center (250, 250)
                    // But since we don't know the path position without bounding box, let's use a seeded random drift

                    const angle = (index / butterflyPaths.length) * Math.PI * 2;
                    const driftX = Math.cos(angle) * 50 * progress;
                    const driftY = Math.sin(angle) * 50 * progress;
                    const opacity = mode === "swarm" ? 0.3 + (1 - progress) * 0.7 : 1;

                    return (
                        <motion.path
                            key={index}
                            d={path.d}
                            fill={path.fill}
                            initial={false}
                            animate={{
                                x: mode === "swarm" ? driftX : 0,
                                y: mode === "swarm" ? driftY : 0,
                                opacity: opacity,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 50,
                                damping: 20,
                            }}
                        />
                    );
                })}
            </svg>
        </div>
    );
}
