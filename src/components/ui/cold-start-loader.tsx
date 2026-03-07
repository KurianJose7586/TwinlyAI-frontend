"use client";

import React from "react";
import Image from "next/image";
import { useLoading } from "@/context/LoadingContext";
import { AnimatePresence, motion } from "framer-motion";

// Floating avatars — same DiceBear seeds used in landing hero & CTA
const AVATARS = [
  {
    seed: "Felix",
    bg: "e2e8f0",
    style: "notionists",
    size: 72,
    position: "top-[12%] left-[8%]",
    delay: 0,
    duration: 7,
    floatY: [-12, 0, -12],
    opacity: "opacity-70",
  },
  {
    seed: "Aneka",
    bg: "fef08a",
    style: "notionists",
    size: 56,
    position: "top-[18%] right-[10%]",
    delay: 1.2,
    duration: 8,
    floatY: [0, -18, 0],
    opacity: "opacity-60",
  },
  {
    seed: "Mia",
    bg: "fbcfe8",
    style: "notionists",
    size: 64,
    position: "bottom-[22%] left-[12%]",
    delay: 0.6,
    duration: 9,
    floatY: [0, 14, 0],
    opacity: "opacity-55",
  },
  {
    seed: "Oliver",
    bg: "bbf7d0",
    style: "notionists",
    size: 80,
    position: "bottom-[18%] right-[8%]",
    delay: 1.8,
    duration: 6.5,
    floatY: [-8, 8, -8],
    opacity: "opacity-65",
  },
  {
    seed: "Zoe",
    bg: "c4b5fd",
    style: "notionists",
    size: 44,
    position: "top-[45%] right-[3%]",
    delay: 2.4,
    duration: 10,
    floatY: [0, -22, 0],
    opacity: "opacity-40",
  },
  {
    seed: "Jude",
    bg: "e2e8f0",
    style: "notionists",
    size: 48,
    position: "top-[50%] left-[3%]",
    delay: 0.3,
    duration: 8.5,
    floatY: [-10, 10, -10],
    opacity: "opacity-45",
  },
];

export const ColdStartLoader = () => {
  const { isLoading, loadingMessage } = useLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg-main)] overflow-hidden"
        >
          {/* ── Subtle background glow ── */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-[480px] h-[480px] rounded-full bg-sky-400 blur-[140px]"
            />
          </div>

          {/* ── Floating background avatars (same as hero / CTA sections) ── */}
          <div className="pointer-events-none absolute inset-0 hidden md:block">
            {AVATARS.map((av) => (
              <motion.div
                key={av.seed}
                className={`absolute ${av.position} ${av.opacity} rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm`}
                style={{ width: av.size, height: av.size }}
                animate={{ y: av.floatY, rotate: [av.delay, -av.delay * 0.5, av.delay] }}
                transition={{
                  duration: av.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: av.delay,
                }}
              >
                <Image
                  src={`https://api.dicebear.com/7.x/${av.style}/svg?seed=${av.seed}&backgroundColor=${av.bg}`}
                  alt=""
                  width={av.size}
                  height={av.size}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>

          {/* ── Center content ── */}
          <div className="relative flex flex-col items-center gap-10 px-8 text-center">

            {/* Breathing butterfly logo */}
            <div className="relative flex items-center justify-center w-36 h-36">
              {/* Outer glow — cyan/blue to match butterfly palette */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(56,189,248,0.20) 0%, rgba(99,102,241,0.08) 55%, transparent 75%)",
                }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0.15, 0.7] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Mid ring */}
              <motion.div
                className="absolute inset-5 rounded-full border border-sky-300/25 dark:border-sky-400/15"
                animate={{ scale: [1, 1.1, 1], opacity: [0.8, 0.2, 0.8] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              />
              {/* Butterfly logo */}
              <motion.div
                animate={{
                  scale: [1, 1.06, 1],
                  filter: [
                    "drop-shadow(0 0 8px rgba(56,189,248,0.30)) drop-shadow(0 0 16px rgba(99,102,241,0.20))",
                    "drop-shadow(0 0 20px rgba(56,189,248,0.60)) drop-shadow(0 0 32px rgba(99,102,241,0.40))",
                    "drop-shadow(0 0 8px rgba(56,189,248,0.30)) drop-shadow(0 0 16px rgba(99,102,241,0.20))",
                  ],
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/butterfly1000.png"
                  alt="TwinlyAI"
                  width={88}
                  height={88}
                  className="select-none"
                  priority
                />
              </motion.div>
            </div>

            {/* Message text */}
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingMessage}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.5 }}
                  className="text-[22px] font-light tracking-tight text-[var(--text-main)] max-w-xs leading-snug"
                >
                  {loadingMessage}
                </motion.p>
              </AnimatePresence>

              {/* Animated dots — same style as the hero chat mockup */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400"
                    animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom status pill — replaces "Establishing Connection" ── */}
          <motion.div
            className="fixed bottom-10 flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.span
              className="flex h-2 w-2 rounded-full bg-sky-500"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            <span className="text-[11px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-[0.2em]">
              Digital Twin Active
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
