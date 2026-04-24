"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroMeshBackground() {
    const reducedMotion = useReducedMotion();

    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <motion.div
                className="absolute left-1/2 top-8 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-300/35 via-indigo-300/30 to-sky-300/30 blur-3xl"
                animate={reducedMotion ? undefined : { x: [0, -18, 12, 0], y: [0, 16, -10, 0], rotate: [0, 4, -4, 0] }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute right-[-8%] top-24 h-80 w-80 rounded-[30%] border border-white/40 bg-white/25 shadow-[0_18px_50px_rgba(124,58,237,0.2)] backdrop-blur-xl"
                animate={reducedMotion ? undefined : { y: [0, -14, 6, 0], rotate: [0, 8, 1, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute left-[-6%] top-56 h-72 w-72 rounded-[28%] border border-white/30 bg-gradient-to-br from-emerald-200/35 to-cyan-200/25 backdrop-blur-xl"
                animate={reducedMotion ? undefined : { y: [0, 12, -8, 0], rotate: [0, -7, 3, 0] }}
                transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}
