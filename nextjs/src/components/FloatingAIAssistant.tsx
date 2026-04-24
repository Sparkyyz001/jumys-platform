"use client";

import { useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import Link from "next/link";

export function FloatingAIAssistant() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState<Array<{ id: string; title: string; district: string | null }>>([]);

    const runSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const response = await fetch("/api/ai/jobs-assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });
            const data = await response.json();
            setJobs(data.jobs ?? []);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {open && (
                <div className="fixed bottom-20 right-4 z-50 w-[340px] max-w-[calc(100vw-1.5rem)] rounded-xl border border-gray-200 bg-white shadow-2xl">
                    <div className="border-b px-4 py-3 font-semibold">AI Assistant</div>
                    <div className="px-4 py-3">
                        <p className="text-xs text-gray-500 mb-2">Например: Найди мне работу баристой в 14 микрорайоне</p>
                        <div className="flex gap-2">
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Введите запрос"
                            />
                            <button
                                type="button"
                                onClick={runSearch}
                                className="rounded-md bg-primary-600 px-3 text-white"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto px-4 pb-4">
                        {jobs.map((job) => (
                            <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-md border p-2 text-sm hover:bg-gray-50">
                                <p className="font-medium">{job.title}</p>
                                <p className="text-xs text-gray-500">{job.district ? `${job.district} мкр.` : "Актау"}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary-700"
            >
                <MessageCircle className="h-4 w-4" />
                AI Assistant
            </button>
        </>
    );
}
