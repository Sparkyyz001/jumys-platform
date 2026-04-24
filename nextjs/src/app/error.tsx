"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("app error boundary", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
            <div className="max-w-md w-full rounded-2xl border bg-white shadow-lg p-8 text-center space-y-5">
                <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-7 w-7 text-red-600" />
                </div>
                <div className="space-y-1">
                    <h1 className="text-xl font-bold text-slate-900">Что-то пошло не так</h1>
                    <p className="text-sm text-slate-600">
                        Мы уже знаем о проблеме. Попробуйте обновить страницу или вернуться на главную.
                    </p>
                </div>
                {error?.digest && (
                    <p className="text-[11px] font-mono text-slate-400 break-all">
                        id: {error.digest}
                    </p>
                )}
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button onClick={() => reset()} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Попробовать снова
                    </Button>
                    <Button variant="outline" asChild className="gap-2">
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            На главную
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
