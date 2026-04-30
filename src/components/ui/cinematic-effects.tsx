"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CursorLight() {
    const [pos, setPos] = useState({ x: -200, y: -200 });
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const media = window.matchMedia("(pointer:fine)");
        setEnabled(media.matches);
        const onMove = (event: MouseEvent) => setPos({ x: event.clientX, y: event.clientY });
        const onMedia = (e: MediaQueryListEvent) => setEnabled(e.matches);
        window.addEventListener("mousemove", onMove);
        media.addEventListener("change", onMedia);
        return () => {
            window.removeEventListener("mousemove", onMove);
            media.removeEventListener("change", onMedia);
        };
    }, []);

    if (!enabled) return null;

    return (
        <motion.div
            className="pointer-events-none fixed z-10 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            animate={{ x: pos.x, y: pos.y }}
            transition={{ type: "spring", stiffness: 70, damping: 20, mass: 0.3 }}
            style={{
                background:
                    "radial-gradient(circle, rgba(56,189,248,0.16) 0%, rgba(56,189,248,0.08) 35%, rgba(56,189,248,0.00) 75%)",
                filter: "blur(20px)",
            }}
        />
    );
}

export function ParallaxLightSpots() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
                className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-sky-300/10 blur-3xl"
                animate={{ x: [0, 20, -12, 0], y: [0, 12, -10, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-indigo-300/10 blur-3xl"
                animate={{ x: [0, -30, 18, 0], y: [0, -16, 14, 0] }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}

