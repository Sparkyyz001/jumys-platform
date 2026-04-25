"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMOJIS = [
    { value: 1, char: "😡", label: "Ужасно" },
    { value: 2, char: "😞", label: "Плохо" },
    { value: 3, char: "😐", label: "Нормально" },
    { value: 4, char: "😊", label: "Хорошо" },
    { value: 5, char: "🤩", label: "Супер" },
];

interface EmojiRatingProps {
    value?: number;
    onChange?: (value: number) => void;
    label?: string;
    className?: string;
}

export function EmojiRating({
    value: controlled,
    onChange,
    label = "Как впечатления от сервиса?",
    className = "",
}: EmojiRatingProps) {
    const [internal, setInternal] = useState(0);
    const [hover, setHover] = useState<number | null>(null);
    const id = useId();
    const value = controlled ?? internal;
    const display = hover ?? value;

    const handle = (v: number) => {
        if (controlled === undefined) setInternal(v);
        onChange?.(v);
    };

    const active = display > 0 ? EMOJIS.find((e) => e.value === display) : null;

    return (
        <div className={`flex flex-col items-center gap-3 ${className}`}>
            {label && (
                <p className="text-sm text-gray-300 font-medium">{label}</p>
            )}
            <div
                className="flex items-center gap-2 p-2 rounded-2xl glass-card"
                onMouseLeave={() => setHover(null)}
            >
                {EMOJIS.map((e) => {
                    const isActive = display >= e.value;
                    return (
                        <motion.button
                            type="button"
                            key={`${id}-${e.value}`}
                            aria-label={e.label}
                            onMouseEnter={() => setHover(e.value)}
                            onClick={() => handle(e.value)}
                            whileHover={{ scale: 1.25, rotate: -8 }}
                            whileTap={{ scale: 0.9 }}
                            className={`text-2xl md:text-3xl transition-all duration-200 ${
                                isActive
                                    ? "grayscale-0 opacity-100"
                                    : "grayscale opacity-40 hover:opacity-90"
                            }`}
                        >
                            {e.char}
                        </motion.button>
                    );
                })}
            </div>
            <AnimatePresence mode="wait">
                {active ? (
                    <motion.p
                        key={active.value}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs text-gray-400 min-h-[1rem]"
                    >
                        {active.label}
                    </motion.p>
                ) : (
                    <p className="text-xs text-gray-500 min-h-[1rem]">Поставьте оценку</p>
                )}
            </AnimatePresence>
        </div>
    );
}
