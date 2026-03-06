"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    baseX: number; baseY: number;
    targetX: number; targetY: number;
    size: number;
    phase: number;
    isJoiner: boolean;
}

const PARTICLE_COUNT = 600;
const FORMATION_RATIO = 0.85;
const EASING = 0.008;
const FRICTION = 0.94;

const BUTTERFLY_ZONES = [
    { x: 0, y: 0, r: 4 },
    { x: -28, y: -25, r: 22 },
    { x: 28, y: -25, r: 22 },
    { x: -18, y: 15, r: 14 },
    { x: 18, y: 15, r: 14 },
];

export function DotPatternLogo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glowRef = useRef<HTMLDivElement>(null); // Use Ref instead of State for performance

    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>(0);
    const cursor = useRef({ x: 0, y: 0, active: false, isClicking: false });
    const formationStrength = useRef(0);

    const isInView = useInView(containerRef, { once: false, amount: 0.5 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            // Cap DPR at 2. Screens with DPR 3+ cause massive lag for canvas fillRect
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        window.addEventListener("resize", resize);

        if (particlesRef.current.length === 0) {
            const rect = canvas.getBoundingClientRect();
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const x = Math.random() * rect.width;
                const y = Math.random() * rect.height;
                particlesRef.current.push({
                    x, y, vx: 0, vy: 0,
                    baseX: x, baseY: y,
                    targetX: x, targetY: y,
                    size: Math.random() * 1.2 + 0.6,
                    phase: Math.random() * Math.PI * 2,
                    isJoiner: Math.random() < FORMATION_RATIO,
                });
            }
        }

        const assignTargets = (cx: number, cy: number) => {
            particlesRef.current.forEach((p) => {
                if (!p.isJoiner) return;
                const zone = BUTTERFLY_ZONES[Math.floor(Math.random() * BUTTERFLY_ZONES.length)];
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * zone.r;
                p.targetX = cx + (zone.x + Math.cos(angle) * dist) * 3.5;
                p.targetY = cy + (zone.y + Math.sin(angle) * dist) * 3.5;
            });
        };

        const animate = () => {
            const rect = canvas.getBoundingClientRect();
            const isDarkMode = document.documentElement.classList.contains('dark');

            ctx.fillStyle = isDarkMode ? "rgba(10, 10, 15, 0.15)" : "rgba(250, 250, 252, 0.15)";
            ctx.fillRect(0, 0, rect.width, rect.height);

            const time = Date.now() * 0.001;
            const flap = Math.sin(time * 1.5) * 4 * formationStrength.current;

            const targetStrength = cursor.current.active ? 1 : (isInView ? 0.6 : 0);
            formationStrength.current += (targetStrength - formationStrength.current) * 0.04;

            if (cursor.current.active || isInView) {
                assignTargets(
                    cursor.current.active ? cursor.current.x : rect.width / 2,
                    cursor.current.active ? cursor.current.y : rect.height / 2
                );
            }

            particlesRef.current.forEach((p) => {
                const tx = p.baseX + (p.targetX - p.baseX) * formationStrength.current;
                const ty = p.baseY + (p.targetY - p.baseY) * formationStrength.current;

                const shimmer = Math.sin(time * 2 + p.phase) * 1.2;

                const dx = tx + shimmer - p.x;
                const dy = ty + shimmer + flap - p.y;

                // --- NEW: Magnetic Repulsion ---
                if (cursor.current.active) {
                    const distToCursor = Math.hypot(p.x - cursor.current.x, p.y - cursor.current.y);
                    const repulsionRadius = 60;
                    if (distToCursor < repulsionRadius) {
                        const force = (repulsionRadius - distToCursor) / repulsionRadius;
                        // Push particles away from cursor
                        p.vx -= (cursor.current.x - p.x) / distToCursor * force * 1.5;
                        p.vy -= (cursor.current.y - p.y) / distToCursor * force * 1.5;
                    }
                }

                p.vx += dx * EASING;
                p.vy += dy * EASING;
                p.vx *= FRICTION;
                p.vy *= FRICTION;

                p.x += p.vx;
                p.y += p.vy;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

                const opacity = 0.2 + formationStrength.current * 0.6;
                ctx.fillStyle = isDarkMode
                    ? `rgba(129, 140, 248, ${opacity})`
                    : `rgba(79, 70, 229, ${opacity})`;
                ctx.fill();
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // High-Performance Event Handlers (No React State)
        const handleMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            cursor.current.x = e.clientX - rect.left;
            cursor.current.y = e.clientY - rect.top;
            cursor.current.active = true;

            // Direct DOM manipulation for the glow prevents React render lag
            if (glowRef.current) {
                const xPct = (cursor.current.x / rect.width) * 100;
                const yPct = (cursor.current.y / rect.height) * 100;
                glowRef.current.style.background = `radial-gradient(circle at ${xPct}% ${yPct}%, rgba(99,102,241,0.15) 0%, transparent 50%)`;
            }
        };

        const handleLeave = () => { cursor.current.active = false; };

        // --- NEW: Shockwave Click ---
        const handleClick = () => {
            particlesRef.current.forEach(p => {
                // Apply a massive sudden velocity in a random direction
                p.vx += (Math.random() - 0.5) * 40;
                p.vy += (Math.random() - 0.5) * 40;
            });
        };

        canvas.addEventListener("mousemove", handleMove);
        canvas.addEventListener("mouseleave", handleLeave);
        canvas.addEventListener("mousedown", handleClick);

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("mousemove", handleMove);
            canvas.removeEventListener("mouseleave", handleLeave);
            canvas.removeEventListener("mousedown", handleClick);
        };
    }, [isInView]);

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-square overflow-hidden group"
            style={{
                maskImage: "radial-gradient(circle at center, black 40%, transparent 70%)",
                WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 70%)"
            }}
        >
            <div
                ref={glowRef}
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
            />
            <canvas ref={canvasRef} className="w-full h-full cursor-pointer relative z-10" />
        </div>
    );
}