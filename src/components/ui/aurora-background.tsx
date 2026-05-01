"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Aurora-style animated mesh background.
 * Replaces MeshGridBackground + ParallaxLightSpots for the landing page.
 * Warm + cool gradient orbs slowly drift, creating depth without busyness.
 * Respects prefers-reduced-motion (orbs go static).
 */
export function AuroraBackground() {
    const reduce = useReducedMotion();
    const orbAnim = (drift: { x: number[]; y: number[] }, duration: number) =>
        reduce
            ? {}
            : {
                  animate: { x: drift.x, y: drift.y },
                  transition: { duration, repeat: Infinity, ease: "easeInOut" as const },
              };

    return (
        <div
            aria-hidden
            className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
        >
            {/* Lifted dark base — not pitch-black, more inviting */}
            <div className="absolute inset-0 bg-[#0a0e1a]" />

            {/* Warm amber/coral orb (top-right) */}
            <motion.div
                className="absolute -top-32 -right-24 h-[560px] w-[560px] rounded-full blur-[110px]"
                style={{
                    background:
                        "radial-gradient(circle, rgba(251,146,60,0.28) 0%, rgba(251,146,60,0) 70%)",
                }}
                {...orbAnim({ x: [0, -40, 20, 0], y: [0, 30, -15, 0] }, 22)}
            />

            {/* Cool sky orb (top-left) */}
            <motion.div
                className="absolute -top-40 -left-32 h-[500px] w-[500px] rounded-full blur-[110px]"
                style={{
                    background:
                        "radial-gradient(circle, rgba(56,189,248,0.24) 0%, rgba(56,189,248,0) 70%)",
                }}
                {...orbAnim({ x: [0, 30, -20, 0], y: [0, 20, -25, 0] }, 18)}
            />

            {/* Indigo center orb */}
            <motion.div
                className="absolute top-1/3 left-1/4 h-[640px] w-[640px] rounded-full blur-[130px]"
                style={{
                    background:
                        "radial-gradient(circle, rgba(99,102,241,0.20) 0%, rgba(99,102,241,0) 70%)",
                }}
                {...orbAnim({ x: [0, 50, -40, 0], y: [0, -30, 20, 0] }, 28)}
            />

            {/* Rose orb (bottom) */}
            <motion.div
                className="absolute -bottom-40 left-1/3 h-[520px] w-[520px] rounded-full blur-[110px]"
                style={{
                    background:
                        "radial-gradient(circle, rgba(244,63,94,0.16) 0%, rgba(244,63,94,0) 70%)",
                }}
                {...orbAnim({ x: [0, -30, 20, 0], y: [0, -20, 10, 0] }, 26)}
            />

            {/* Subtle grid for depth — masked to fade out at edges */}
            <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                    maskImage:
                        "radial-gradient(ellipse 75% 55% at 50% 30%, black, transparent 75%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 75% 55% at 50% 30%, black, transparent 75%)",
                }}
            />

            {/* Vignette for cinematic edges */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 100% 70% at 50% 0%, transparent 60%, rgba(0,0,0,0.55) 100%)",
                }}
            />
        </div>
    );
}
