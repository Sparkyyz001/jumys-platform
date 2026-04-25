"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
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
    "Найди мне работу баристой в 14 микрорайоне",
    "Подработка вечером для студента",
    "Удалённый разработчик React",
];

export function FloatingAIAssistant() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState<JobHit[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            const t = setTimeout(() => inputRef.current?.focus(), 80);
            return () => clearTimeout(t);
        }
    }, [open]);

    const runSearch = async (text?: string) => {
        const q = (text ?? query).trim();
        if (!q) return;
        if (text && text !== query) setQuery(text);
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/ai/jobs-assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q }),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = (await response.json()) as { jobs?: JobHit[] };
            setJobs(data.jobs ?? []);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Не удалось выполнить запрос";
            setError(msg);
            toast.error(`AI Assistant: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="fixed bottom-20 right-4 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] rounded-xl border border-[#2a2d3a] bg-[#090b13]/95 backdrop-blur-xl text-white shadow-2xl ring-1 ring-white/5"
                    >
                        <div className="flex items-center justify-between border-b border-[#2a2d3a] px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <Sparkles className="h-3.5 w-3.5 text-white" />
                                </div>
                                <div className="text-sm font-semibold">AI Assistant</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Закрыть"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="px-4 py-3">
                            <p className="text-xs text-gray-400 mb-2">
                                Опишите вакансию своими словами — AI разберёт и подберёт.
                            </p>
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
                                    className="flex-1 rounded-md border border-[#2a2d3a] bg-[#13151f] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                                    placeholder="Введите запрос"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => runSearch()}
                                    disabled={loading || !query.trim()}
                                    aria-label="Отправить запрос"
                                    className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-3 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </button>
                            </div>

                            {!loading && jobs === null && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {SUGGESTIONS.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => runSearch(s)}
                                            className="text-[11px] px-2 py-1 rounded-full border border-[#2a2d3a] bg-[#13151f] text-gray-300 hover:border-blue-500/50 hover:text-blue-300 transition-colors"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="max-h-72 overflow-y-auto px-4 pb-4 space-y-2">
                            {loading && (
                                <div className="flex items-center justify-center py-8 text-xs text-gray-400">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Подбираем вакансии...
                                </div>
                            )}

                            {error && !loading && (
                                <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
                                    {error}
                                </div>
                            )}

                            {!loading && jobs !== null && jobs.length === 0 && !error && (
                                <div className="text-center py-8">
                                    <p className="text-sm text-gray-300">Ничего не нашлось</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Попробуйте перефразировать или открыть{" "}
                                        <Link href="/jobs" className="text-blue-400 hover:underline">
                                            все вакансии
                                        </Link>
                                    </p>
                                </div>
                            )}

                            {!loading && jobs && jobs.length > 0 && (
                                <>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                                        Найдено: {jobs.length}
                                    </p>
                                    {jobs.map((job) => (
                                        <Link
                                            key={job.id}
                                            href={`/jobs/${job.id}`}
                                            onClick={() => setOpen(false)}
                                            className="block rounded-md border border-[#2a2d3a] bg-[#13151f] p-2.5 text-sm text-gray-200 hover:border-blue-500/50 hover:bg-[#1a1d2b] transition-all"
                                        >
                                            <p className="font-medium leading-snug">{job.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {job.district ? `${job.district} мкр.` : "Актау"}
                                                {job.employment === "part"
                                                    ? " · частичная"
                                                    : job.employment === "gig"
                                                        ? " · подработка"
                                                        : job.employment === "full"
                                                            ? " · полная"
                                                            : ""}
                                                {job.salary_from
                                                    ? ` · от ${job.salary_from.toLocaleString("ru-RU")} ₸`
                                                    : ""}
                                            </p>
                                        </Link>
                                    ))}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Открыть AI Assistant"
                className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all"
            >
                <MessageCircle className="h-4 w-4" />
                AI Assistant
            </button>
        </>
    );
}
