"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("dashboard error boundary", error);
    }, [error]);

    return (
        <div className="max-w-xl mx-auto py-12 px-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-3xl p-8 text-center space-y-5">
                <div className="mx-auto w-14 h-14 rounded-2xl border border-red-500/25 bg-red-500/[0.08] flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div className="space-y-1.5">
                    <h2 className="text-lg font-semibold text-zinc-100">
                        Не удалось загрузить раздел
                    </h2>
                    <p className="text-sm text-zinc-400">
                        Похоже, сервис временно недоступен. Попробуйте ещё раз через секунду.
                    </p>
                </div>
                {error?.digest && (
                    <p className="text-[11px] font-mono text-zinc-600 break-all">
                        id: {error.digest}
                    </p>
                )}
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Обновить
                    </button>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-zinc-100 transition-all"
                    >
                        <Home className="h-4 w-4" />
                        На главный дашборд
                    </Link>
                </div>
            </div>
        </div>
    );
}
