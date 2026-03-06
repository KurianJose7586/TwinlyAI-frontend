"use client";

import { Butterfly } from "@/components/ui/butterfly";

interface GlassCardLogoProps {
    children: React.ReactNode;
    className?: string;
    logoPosition?: "left" | "right";
}

export function GlassCardLogo({ children, className, logoPosition = "right" }: GlassCardLogoProps) {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Background Etching */}
            <div
                className={`absolute pointer-events-none opacity-5 dark:opacity-10 mix-blend-overlay ${logoPosition === "right" ? "-right-20 -bottom-20 rotate-12" : "-left-20 -bottom-20 -rotate-12"}`}
                style={{ width: "400px", height: "400px" }}
            >
                <Butterfly className="w-full h-full text-white fill-current" mode="icon" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
