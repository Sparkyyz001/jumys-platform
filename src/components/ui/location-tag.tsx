"use client";

import { useState, useEffect } from "react";

interface LocationTagProps {
    city?: string;
    country?: string;
    timezone?: string;
    timeZoneIana?: string;
}

export function LocationTag({
    city = "Актау",
    country = "Казахстан",
    timezone = "+05",
    timeZoneIana = "Asia/Aqtau",
}: LocationTagProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const update = () => {
            const now = new Date();
            try {
                setCurrentTime(
                    now.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: timeZoneIana,
                    })
                );
            } catch {
                setCurrentTime(
                    now.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    })
                );
            }
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [timeZoneIana]);

    return (
        <button
            type="button"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative inline-flex items-center gap-3 rounded-full border border-border/60 bg-secondary/50 px-4 py-2.5 transition-all duration-500 ease-out hover:border-foreground/20 hover:bg-secondary/80 hover:shadow-[0_0_20px_rgba(0,0,0,0.04)]"
        >
            <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>

            <span className="relative inline-block min-w-[140px] overflow-hidden text-left">
                <span
                    className="block text-sm font-medium text-foreground transition-all duration-500"
                    style={{
                        transform: isHovered ? "translateY(-100%)" : "translateY(0)",
                        opacity: isHovered ? 0 : 1,
                    }}
                >
                    {city}, {country}
                </span>
                <span
                    suppressHydrationWarning
                    className="absolute left-0 top-0 block w-full text-sm font-medium text-foreground transition-all duration-500 tabular-nums"
                    style={{
                        transform: isHovered ? "translateY(0)" : "translateY(100%)",
                        opacity: isHovered ? 1 : 0,
                    }}
                >
                    {currentTime || "--:--"} GMT{timezone}
                </span>
            </span>

            <svg
                className="h-3 w-3 text-muted-foreground transition-all duration-300"
                style={{
                    transform: isHovered ? "translateX(2px) rotate(-45deg)" : "translateX(0) rotate(0)",
                    opacity: isHovered ? 1 : 0.5,
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
        </button>
    );
}
