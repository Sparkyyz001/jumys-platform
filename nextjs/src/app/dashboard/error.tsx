"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

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
            <div className="rounded-xl border bg-white shadow-sm p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Не удалось загрузить раздел
                    </h2>
                    <p className="text-sm text-slate-600">
                        Похоже, сервис временно недоступен. Попробуйте ещё раз через секунду.
                    </p>
                </div>
                {error?.digest && (
                    <p className="text-[11px] font-mono text-slate-400 break-all">
                        id: {error.digest}
                    </p>
                )}
                <div className="flex justify-center gap-2">
                    <Button onClick={() => reset()} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Обновить
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard" className="gap-2">
                            <Home className="h-4 w-4" />
                            На главный дашборд
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
