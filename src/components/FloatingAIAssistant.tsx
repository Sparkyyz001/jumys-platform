"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X, Bot, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface JobHit {
    id: string;
    title: string;
    district: string | null;
    employment?: "full" | "part" | "gig" | null;
    salary_from?: number | null;
    salary_to?: number | null;
}

const SUGGESTIONS = [
    "Баристой в 14 мкр",
    "Подработка для студента",
    "Охранник полный день",
];

const EMPLOYMENT_LABEL: Record<string, string> = {
    full: "полная",
    part: "частичная",
    gig: "подработка",
};

// ── Typing dots indicator ────────────────────────────────────────────────────
function TypingDots() {
    return (
        <div className="flex items-center gap-1 px-4 py-3">
            <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        className="block h-1.5 w-1.5 rounded-full bg-amber-400/70"
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                    />
                ))}
            </div>
            <span className="text-xs text-zinc-500 ml-1.5">подбираю вакансии...</span>
        </div>
    );
}

// ── Job card ─────────────────────────────────────────────────────────────────
function JobCard({ job, index, onClose }: { job: JobHit; index: number; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <Link
                href={`/jobs/${job.id}`}
                onClick={onClose}
                className="group flex items-start justify-between gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-amber-500/[0.06] hover:border-amber-500/25 p-3 transition-all duration-200"
            >
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-100 leading-snug group-hover:text-amber-300 transition-colors">
                        {job.title}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                        {[
                            job.district ? `${job.district} мкр.` : "Актау",
                            job.employment ? EMPLOYMENT_LABEL[job.employment] : null,
                            job.salary_from ? `от ${job.salary_from.toLocaleString("ru-RU")} ₸` : null,
                        ].filter(Boolean).join(" · ")}
                    </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-amber-400 shrink-0 mt-0.5 transition-colors" />
            </Link>
        </motion.div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export function FloatingAIAssistant() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState<JobHit[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            const t = setTimeout(() => inputRef.current?.focus(), 100);
            return () => clearTimeout(t);
        }
    }, [open]);

    const runSearch = async (text?: string) => {
        const q = (text ?? query).trim();
        if (!q) return;
        if (text && text !== query) setQuery(text);
        setLoading(true);
        setError(null);
        setJobs(null);
        try {
            const response = await fetch("/api/ai/jobs-assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q }),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = (await response.json()) as { jobs?: JobHit[] };
            setJobs(data.jobs ?? []);
            setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Не удалось выполнить запрос";
            setError(msg);
            toast.error(`AI: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setJobs(null);
        setQuery("");
        setError(null);
    };

    return (
        <>
            {/* ── Chat panel ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.94 }}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="fixed bottom-[4.5rem] right-4 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-white/[0.09] bg-zinc-950/90 backdrop-blur-3xl shadow-2xl shadow-black/60 overflow-hidden"
                        style={{ boxShadow: "0 0 0 1px rgba(245,158,11,0.06), 0 24px 48px rgba(0,0,0,0.6)" }}
                    >
                        {/* Ambient top glow */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                        <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-48 rounded-full bg-amber-500/8 blur-3xl" />

                        {/* Header */}
                        <div className="relative flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
                            <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-100 leading-none">AI Поиск</p>
                                    <p className="text-[10px] text-zinc-500 mt-0.5">Jumys · Актау</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                aria-label="Закрыть"
                                className="h-6 w-6 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.07] transition-all"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* Input area */}
                        <div className="px-3.5 pt-3 pb-2">
                            {jobs === null && !loading && (
                                <p className="text-xs text-zinc-500 mb-2.5 leading-relaxed">
                                    Опишите вакансию своими словами — AI подберёт за секунды.
                                </p>
                            )}
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            runSearch();
                                        }
                                    }}
                                    className="flex-1 min-w-0 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/40 focus:bg-amber-500/[0.03] focus:outline-none transition-all"
                                    placeholder="Баристой, охранник, повар..."
                                    disabled={loading}
                                />
                                <motion.button
                                    type="button"
                                    onClick={() => runSearch()}
                                    disabled={loading || !query.trim()}
                                    aria-label="Отправить"
                                    whileTap={{ scale: 0.92 }}
                                    className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 flex items-center justify-center shadow-lg shadow-amber-500/25 transition-all"
                                >
                                    <Send className="h-3.5 w-3.5 text-white" />
                                </motion.button>
                            </div>

                            {/* Suggestion chips */}
                            <AnimatePresence>
                                {!loading && jobs === null && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-2.5 flex flex-wrap gap-1.5"
                                    >
                                        {SUGGESTIONS.map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => runSearch(s)}
                                                className="text-[11px] px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:border-amber-500/35 hover:text-amber-300 hover:bg-amber-500/[0.06] transition-all"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Results / states */}
                        <div className="max-h-64 overflow-y-auto px-3.5 pb-3.5 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
                            {/* Typing indicator */}
                            {loading && <TypingDots />}

                            {/* Error */}
                            {error && !loading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-xl border border-red-500/25 bg-red-500/[0.08] p-2.5 text-xs text-red-300"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Empty */}
                            {!loading && jobs !== null && jobs.length === 0 && !error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-8"
                                >
                                    <p className="text-sm text-zinc-300">Ничего не нашлось</p>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Попробуйте перефразировать или{" "}
                                        <Link href="/jobs" onClick={handleClose} className="text-amber-400 hover:text-amber-300 underline transition-colors">
                                            смотрите все вакансии
                                        </Link>
                                    </p>
                                </motion.div>
                            )}

                            {/* Results */}
                            {!loading && jobs && jobs.length > 0 && (
                                <div ref={resultsRef}>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 px-0.5"
                                    >
                                        Найдено: {jobs.length}
                                    </motion.p>
                                    {jobs.map((job, i) => (
                                        <JobCard key={job.id} job={job} index={i} onClose={handleClose} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── FAB button ──────────────────────────────────────────────── */}
            <motion.button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Открыть AI поиск"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 transition-shadow hover:shadow-amber-500/50"
            >
                {/* Pulse ring */}
                {!open && (
                    <motion.span
                        className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-amber-400/60"
                        animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0, 0.7] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                )}
                <AnimatePresence mode="wait" initial={false}>
                    {open ? (
                        <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                            <X className="h-5 w-5 text-white" />
                        </motion.span>
                    ) : (
                        <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                            <Bot className="h-5 w-5 text-white" />
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
        </>
    );
}
