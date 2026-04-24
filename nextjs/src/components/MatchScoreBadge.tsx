"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
    score: number;
    className?: string;
}

export function MatchScoreBadge({ score, className }: MatchScoreBadgeProps) {
    const pct = Math.round(score * 100);
    let label = "слабое совпадение";
    let ringColor = "rgba(148, 163, 184, 0.9)";
    const reducedMotion = useReducedMotion();

    if (pct >= 80) {
        label = "сильное совпадение";
        ringColor = "rgba(34, 197, 94, 0.95)";
    } else if (pct >= 60) {
        label = "среднее совпадение";
        ringColor = "rgba(245, 158, 11, 0.95)";
    }

    const ringBackground = `conic-gradient(${ringColor} ${Math.max(8, pct)}%, rgba(148,163,184,0.22) ${Math.max(8, pct)}%)`;

    return (
        <motion.div
            className={cn("relative h-12 w-12 shrink-0", className)}
            title={label}
            animate={reducedMotion ? undefined : { boxShadow: ["0 0 0 rgba(124,58,237,0.05)", "0 0 14px rgba(124,58,237,0.35)", "0 0 0 rgba(124,58,237,0.05)"] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
            <div className="absolute inset-0 rounded-full p-[3px]" style={{ background: ringBackground }}>
                <div className="flex h-full w-full items-center justify-center rounded-full border border-white/30 bg-white/75 backdrop-blur-md text-[11px] font-semibold text-slate-800">
                    {pct}%
                </div>
            </div>
        </motion.div>
    );
}
