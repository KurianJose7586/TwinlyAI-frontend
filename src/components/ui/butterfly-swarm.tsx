"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Butterfly } from "@/components/ui/butterfly";
import { useRef } from "react";

export function ButterflySwarm() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    // Smooth out the scroll progress
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    // As user scrolls down, the butterfly "explodes" or disperses more
    // range: 0 (intact) -> 1 (dispersed)
    const dispersion = useTransform(smoothProgress, [0, 0.5], [0, 1.5]);
    const yPos = useTransform(smoothProgress, [0, 1], [0, 200]);
    const rotation = useTransform(smoothProgress, [0, 1], [0, 15]);
    const scale = useTransform(smoothProgress, [0, 0.5], [1, 1.2]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
            aria-hidden="true"
        >
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-20 blur-sm dark:opacity-10">
                <motion.div
                    style={{
                        y: yPos,
                        rotate: rotation,
                        scale: scale
                    }}
                    className="w-full h-full"
                >
                    {/* We pass a numeric value for progress by using a motion value subscription? 
               Actually, framer motion components can't pass 'progress' directly to children easily if it's a MotionValue 
               unless the child knows how to handle it.
               
               Let's simplify: controlling the "Butterfly" component via props is hard if props need to be MotionValues.
               Instead, let's treat the Butterfly component as a dumb SVG renderer and put the logic here, 
               OR adjust Butterfly to accept numeric progress if we weren't doing scroll-baked animation.
               
               BETTER APPROACH: Let's just make the whole container breathe for now to save complexity, 
               and maybe later fully wire up the "particle" dispersion if needed.
               
               Wait, the user wants "Subtle presence" and "mix of 1 and 2".
               Swarm = drift.
               
               Let's try to pass the dispersion as a prop. To do that with useScroll, we need a wrapper 
               that converts MotionValue to state, OR we make Butterfly accept a motion value.
           */}
                    <ButterflyWithMotion progress={dispersion} />
                </motion.div>
            </div>
        </div>
    );
}

// Wrapper to bridge MotionValue to prop (or just handle it internally if we refactor Butterfly)
// Actually, let's just create a specialized internal component here to keep it clean.
import { butterflyPaths, type ButterflyPath } from "@/lib/butterfly-data";

function ButterflyWithMotion({ progress }: { progress: any }) {
    // We need to map the MotionValue `progress` to x/y for each path.
    // UseTransform is hook-based, so we can't call it inside .map() callback easily if the map is dynamic (it is constant though).

    return (
        <svg
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
        >
            {butterflyPaths.map((path: ButterflyPath, index: number) => {
                // Deterministic random drift
                const angle = (index * 137.5) * (Math.PI / 180); // golden angle approximation for distribution
                const radius = 100 + (index % 50); // varying separation

                // We want them to start CLOSER (0) and drift APART (1)
                const xDrift = Math.cos(angle) * radius;
                const yDrift = Math.sin(angle) * radius;

                // Create transforms for this specific particle
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const x = useTransform(progress, [0, 1], [0, xDrift]);
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const y = useTransform(progress, [0, 1], [0, yDrift]);
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const opacity = useTransform(progress, [0, 0.8], [1, 0]);

                return (
                    <motion.path
                        key={index}
                        d={path.d}
                        fill={path.fill}
                        style={{ x, y, opacity }}
                    />
                );
            })}
        </svg>
    );
}
