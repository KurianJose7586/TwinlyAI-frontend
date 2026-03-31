"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

// ─── Options ──────────────────────────────────────────────────────────────────

const HEAD_OPTIONS = [
  "afro","bangs","bangs2","bantuKnots","bear","bun","bun2","buns",
  "cornrows","cornrows2","dreads1","dreads2","flatTop","flatTopLong",
  "grayBun","grayMedium","grayShort","hatBeanie","hatHip","hijab",
  "long","longAfro","longBangs","longCurly","medium1","medium2","medium3",
  "mediumBangs","mediumBangs2","mediumBangs3","mediumStraight",
  "mohawk","mohawk2","noHair1","noHair2","noHair3","pomp",
  "shaved1","shaved2","shaved3","short1","short2","short3","short4","short5",
  "turban","twists","twists2",
];
const FACE_OPTIONS = [
  "angryWithFang","awe","blank","calm","cheeky","concerned","concernedFear",
  "contempt","cute","cyclops","driven","eatingHappy","explaining","eyesClosed",
  "fear","hectic","lovingGrin1","lovingGrin2","monster","old","rage","serious",
  "smile","smileBig","smileLOL","smileTeethGap","solemn","suspicious","tired","veryAngry",
];
const FACIAL_HAIR_OPTIONS = [
  "chin","full","full2","full3","full4","goatee1","goatee2",
  "moustache1","moustache2","moustache3","moustache4","moustache5",
  "moustache6","moustache7","moustache8","moustache9",
];
const ACCESSORIES_OPTIONS = [
  "eyepatch","glasses","glasses2","glasses3","glasses4","glasses5",
  "sunglasses","sunglasses2",
];
const MASK_OPTIONS = ["medicalMask","respirator"];

const SKIN_COLORS     = ["694d3d","ae5d29","d08b5b","edb98a","ffdbb4","f8d5c2"];
const CLOTHING_COLORS = ["8fa7df","9ddadb","78e185","e279c7","e78276","fdea6b","ffcf77","c084fc","64748b","1e293b"];
const HAIR_COLORS     = ["2c1b18","4a312c","724133","a55728","b58143","c93305","d6b370","e8e1e1","ecdcbf","f59797","1a1a2e","4a4e69"];
const BG_COLORS       = ["b6e3f4","c0aede","d1d4f9","ffd5dc","ffdfbf","bbf7d0","fef08a","e0f2fe","fae8ff","transparent"];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AvatarConfig {
  head: string;
  face: string;
  facialHair: string | null;
  accessories: string | null;
  mask: string | null;
  skinColor: string;
  clothingColor: string;
  headContrastColor: string;
  backgroundColor: string;
  backgroundType: "solid" | "gradientLinear";
}

export function buildAvatarUrl(config: AvatarConfig): string {
  const p = new URLSearchParams();
  p.set("head", config.head);
  p.set("face", config.face);
  if (config.facialHair) { p.set("facialHair", config.facialHair); p.set("facialHairProbability", "100"); }
  else { p.set("facialHairProbability", "0"); }
  if (config.accessories) { p.set("accessories", config.accessories); p.set("accessoriesProbability", "100"); }
  else { p.set("accessoriesProbability", "0"); }
  if (config.mask) { p.set("mask", config.mask); p.set("maskProbability", "100"); }
  else { p.set("maskProbability", "0"); }
  p.set("skinColor", config.skinColor);
  p.set("clothingColor", config.clothingColor);
  p.set("headContrastColor", config.headContrastColor);
  p.set("backgroundColor", config.backgroundColor);
  p.set("backgroundType", config.backgroundType);
  p.set("radius", "50");
  p.set("size", "200");
  return `https://api.dicebear.com/9.x/open-peeps/svg?${p.toString()}`;
}

export function randomAvatarConfig(): AvatarConfig {
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  return {
    head: pick(HEAD_OPTIONS), face: pick(FACE_OPTIONS),
    facialHair: Math.random() > 0.5 ? pick(FACIAL_HAIR_OPTIONS) : null,
    accessories: Math.random() > 0.6 ? pick(ACCESSORIES_OPTIONS) : null,
    mask: null,
    skinColor: pick(SKIN_COLORS), clothingColor: pick(CLOTHING_COLORS),
    headContrastColor: pick(HAIR_COLORS),
    backgroundColor: pick(BG_COLORS.filter(c => c !== "transparent")),
    backgroundType: "solid",
  };
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  head: "medium1", face: "smile", facialHair: null, accessories: null, mask: null,
  skinColor: "edb98a", clothingColor: "8fa7df", headContrastColor: "2c1b18",
  backgroundColor: "b6e3f4", backgroundType: "solid",
};

// ─── Category nav ─────────────────────────────────────────────────────────────

type Category = "hair" | "face" | "beard" | "accessories" | "mask" | "colors";

const CATEGORIES: { id: Category; label: string; count: number }[] = [
  { id: "hair",        label: "Hair",        count: HEAD_OPTIONS.length },
  { id: "face",        label: "Face",        count: FACE_OPTIONS.length },
  { id: "beard",       label: "Beard",       count: FACIAL_HAIR_OPTIONS.length + 1 },
  { id: "accessories", label: "Accessories", count: ACCESSORIES_OPTIONS.length + 1 },
  { id: "mask",        label: "Mask",        count: MASK_OPTIONS.length + 1 },
  { id: "colors",      label: "Colors",      count: 0 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tileUrl(base: AvatarConfig, overrides: Partial<AvatarConfig>): string {
  return buildAvatarUrl({ ...base, ...overrides });
}

function fmtLabel(s: string): string {
  return s.replace(/([A-Z])/g, " $1").replace(/^\s/, "").replace(/\b\w/g, c => c.toUpperCase()).trim();
}

// ─── Tile ─────────────────────────────────────────────────────────────────────

function Tile({
  url, label, selected, onClick, isNone, index = 0,
}: {
  url: string; label: string; selected: boolean;
  onClick: () => void; isNone?: boolean; index?: number;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      title={label}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 340, damping: 24, delay: index * 0.012 }}
      whileHover={{ scale: 1.06, transition: { type: "spring", stiffness: 400, damping: 20 } }}
      whileTap={{ scale: 0.95, transition: { duration: 0.08 } }}
      className={[
        "relative aspect-square rounded-xl overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500",
        selected
          ? "ring-2 ring-slate-800 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-[#161B22] shadow-md"
          : "bg-slate-50 dark:bg-white/[0.03] hover:shadow-sm",
      ].join(" ")}
    >
      {isNone ? (
        <div className={[
          "w-full h-full flex items-center justify-center rounded-xl border border-dashed transition-colors duration-200",
          selected
            ? "border-slate-700 dark:border-white/60 bg-slate-100 dark:bg-white/10"
            : "border-slate-200 dark:border-white/10",
        ].join(" ")}>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">None</span>
        </div>
      ) : (
        <>
          {/* Shimmer skeleton */}
          <AnimatePresence>
            {!loaded && (
              <motion.div
                key="skeleton"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 rounded-xl overflow-hidden"
              >
                <div className="w-full h-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-white/5 dark:via-white/[0.02] dark:to-white/5 animate-[shimmer_1.4s_ease-in-out_infinite] bg-[length:200%_100%]" />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full"
          >
            <Image
              src={url} alt={label} width={80} height={80}
              className="w-full h-full object-cover"
              onLoad={() => setLoaded(true)}
              unoptimized
            />
          </motion.div>

          {/* Hover label */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-black/55 to-transparent flex items-end justify-center pb-1 pointer-events-none"
          >
            <span className="text-[9px] font-medium text-white/90 truncate px-1">{fmtLabel(label)}</span>
          </motion.div>
        </>
      )}
    </motion.button>
  );
}

// ─── Color Swatch ─────────────────────────────────────────────────────────────

function Swatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      title={color === "transparent" ? "None" : `#${color}`}
      whileHover={{ scale: 1.18, transition: { type: "spring", stiffness: 400, damping: 18 } }}
      whileTap={{ scale: 0.9 }}
      className={[
        "w-7 h-7 rounded-full border-2 transition-[border-color,box-shadow] duration-200",
        selected
          ? "border-slate-800 dark:border-white shadow-[0_0_0_3px_rgba(15,23,42,0.15)] dark:shadow-[0_0_0_3px_rgba(255,255,255,0.2)] scale-110"
          : "border-slate-200/70 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30",
      ].join(" ")}
      style={
        color === "transparent"
          ? { background: "linear-gradient(135deg, #f1f5f9 50%, #cbd5e1 50%)" }
          : { backgroundColor: `#${color}` }
      }
    />
  );
}

function ColorBlock({ label, colors, selected, onChange }: {
  label: string; colors: string[]; selected: string; onChange: (c: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {colors.map(c => <Swatch key={c} color={c} selected={selected === c} onClick={() => onChange(c)} />)}
      </div>
    </div>
  );
}

// ─── Grid wrapper with stagger key ───────────────────────────────────────────

function TileGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export interface AvatarCustomizerProps {
  value: AvatarConfig;
  onChange: (cfg: AvatarConfig) => void;
  compact?: boolean;
}

export function AvatarCustomizer({ value, onChange, compact = false }: AvatarCustomizerProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("hair");
  const [spinning, setSpinning] = useState(false);
  const update = useCallback((p: Partial<AvatarConfig>) => onChange({ ...value, ...p }), [value, onChange]);

  const avatarUrl = buildAvatarUrl(value);

  const handleRandomize = () => {
    setSpinning(true);
    onChange(randomAvatarConfig());
    setTimeout(() => setSpinning(false), 600);
  };

  const switchCategory = (id: Category) => setActiveCategory(id);

  // ── Preview ──────────────────────────────────────────────────────────────
  const Preview = (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${compact ? "w-28 h-28" : "w-36 h-36"}`}>
        {/* Soft glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/30 dark:to-slate-900/0 blur-xl scale-110 opacity-60 dark:opacity-40" />
        <AnimatePresence mode="popLayout">
          <motion.div
            key={avatarUrl}
            initial={{ opacity: 0, scale: 0.82, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.1, rotate: 4 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            className="relative w-full h-full rounded-full overflow-hidden
              border-2 border-white dark:border-white/10
              shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          >
            <Image src={avatarUrl} alt="Avatar preview" width={200} height={200}
              className="w-full h-full object-cover" unoptimized />
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={handleRandomize}
        className="flex items-center gap-1.5 text-[11px] font-medium
          text-slate-400 dark:text-slate-500
          hover:text-slate-700 dark:hover:text-slate-200
          transition-colors duration-200"
      >
        <motion.div animate={{ rotate: spinning ? 360 : 0 }} transition={{ duration: 0.55, ease: "easeInOut" }}>
          <RefreshCw size={11} />
        </motion.div>
        Randomize
      </button>
    </div>
  );

  // ── Category nav ─────────────────────────────────────────────────────────
  const HorizNav = (
    <div className="flex gap-1 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
      {CATEGORIES.map(cat => {
        const isActive = activeCategory === cat.id;
        return (
          <motion.button
            key={cat.id}
            onClick={() => switchCategory(cat.id)}
            whileTap={{ scale: 0.94 }}
            className={[
              "flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors duration-200 relative",
              isActive
                ? "text-white dark:text-slate-900"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200",
            ].join(" ")}
          >
            {isActive && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 rounded-lg bg-slate-900 dark:bg-white"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat.label}</span>
          </motion.button>
        );
      })}
    </div>
  );

  const VertNav = (
    <nav className="w-full space-y-0.5">
      {CATEGORIES.map(cat => {
        const isActive = activeCategory === cat.id;
        return (
          <motion.button
            key={cat.id}
            onClick={() => switchCategory(cat.id)}
            whileTap={{ scale: 0.97 }}
            className={[
              "w-full flex items-center justify-between px-3 py-2 rounded-lg",
              "text-[13px] font-medium text-left transition-colors duration-200 relative",
              isActive
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200",
            ].join(" ")}
          >
            {isActive && (
              <motion.div
                layoutId="vert-pill"
                className="absolute inset-0 rounded-lg bg-slate-100 dark:bg-white/[0.07]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat.label}</span>
            {cat.count > 0 && (
              <span className="relative z-10 text-[10px] font-medium text-slate-300 dark:text-slate-600 tabular-nums">
                {cat.count}
              </span>
            )}
          </motion.button>
        );
      })}
    </nav>
  );

  // ── Option panels ─────────────────────────────────────────────────────────
  const panelVariants = {
    enter: { opacity: 0, x: 10 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  };

  const Panel = (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeCategory}
        variants={panelVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      >
        {activeCategory === "hair" && (
          <TileGrid>
            {HEAD_OPTIONS.map((h, i) => (
              <Tile key={h} label={h} index={i} url={tileUrl(value, { head: h })}
                selected={value.head === h} onClick={() => update({ head: h })} />
            ))}
          </TileGrid>
        )}

        {activeCategory === "face" && (
          <TileGrid>
            {FACE_OPTIONS.map((f, i) => (
              <Tile key={f} label={f} index={i} url={tileUrl(value, { face: f })}
                selected={value.face === f} onClick={() => update({ face: f })} />
            ))}
          </TileGrid>
        )}

        {activeCategory === "beard" && (
          <TileGrid>
            <Tile label="None" url="" isNone index={0}
              selected={value.facialHair === null} onClick={() => update({ facialHair: null })} />
            {FACIAL_HAIR_OPTIONS.map((fh, i) => (
              <Tile key={fh} label={fh} index={i + 1} url={tileUrl(value, { facialHair: fh })}
                selected={value.facialHair === fh} onClick={() => update({ facialHair: fh })} />
            ))}
          </TileGrid>
        )}

        {activeCategory === "accessories" && (
          <TileGrid>
            <Tile label="None" url="" isNone index={0}
              selected={value.accessories === null} onClick={() => update({ accessories: null })} />
            {ACCESSORIES_OPTIONS.map((a, i) => (
              <Tile key={a} label={a} index={i + 1} url={tileUrl(value, { accessories: a })}
                selected={value.accessories === a} onClick={() => update({ accessories: a })} />
            ))}
          </TileGrid>
        )}

        {activeCategory === "mask" && (
          <TileGrid>
            <Tile label="None" url="" isNone index={0}
              selected={value.mask === null} onClick={() => update({ mask: null })} />
            {MASK_OPTIONS.map((m, i) => (
              <Tile key={m} label={m} index={i + 1} url={tileUrl(value, { mask: m })}
                selected={value.mask === m} onClick={() => update({ mask: m })} />
            ))}
          </TileGrid>
        )}

        {activeCategory === "colors" && (
          <div className="space-y-5 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
            <ColorBlock label="Skin"       colors={SKIN_COLORS}     selected={value.skinColor}        onChange={c => update({ skinColor: c })} />
            <ColorBlock label="Hair"       colors={HAIR_COLORS}     selected={value.headContrastColor} onChange={c => update({ headContrastColor: c })} />
            <ColorBlock label="Clothing"   colors={CLOTHING_COLORS} selected={value.clothingColor}    onChange={c => update({ clothingColor: c })} />
            <ColorBlock label="Background" colors={BG_COLORS}       selected={value.backgroundColor}  onChange={c => update({ backgroundColor: c })} />

            <div className="space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Background Style
              </p>
              <div className="flex gap-2">
                {(["solid", "gradientLinear"] as const).map(t => {
                  const on = value.backgroundType === t;
                  return (
                    <motion.button
                      key={t}
                      onClick={() => update({ backgroundType: t })}
                      whileTap={{ scale: 0.96 }}
                      className={[
                        "flex-1 py-2 rounded-lg text-[12px] font-medium border transition-colors duration-200",
                        on
                          ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900"
                          : "bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-700 dark:hover:text-slate-200",
                      ].join(" ")}
                    >
                      {t === "solid" ? "Solid" : "Gradient"}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  // ── Layout ────────────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="flex flex-col gap-5">
        {Preview}
        {HorizNav}
        {Panel}
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-0 h-full">
      {/* Left column */}
      <div className="w-52 shrink-0 flex flex-col gap-5 border-r border-slate-100 dark:border-white/[0.06] pr-5">
        {Preview}
        {VertNav}
      </div>

      {/* Right panel */}
      <div className="flex-1 min-w-0 pl-6">
        {Panel}
      </div>
    </div>
  );
}
