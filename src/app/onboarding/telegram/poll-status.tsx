"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

/**
 * Двойной polling:
 *  - бьём /api/me/telegram-status каждые 2с
 *  - как только бэк возвращает linked:true — делаем hard router.push("/dashboard")
 *  - параллельно периодически router.refresh(), чтобы и server-redirect отработал
 */
export function TelegramPollStatus() {
    const router = useRouter();
    const [confirmed, setConfirmed] = useState(false);
    const isAlive = useRef(true);
    const seenLinkedRef = useRef(false);

    const checkOnce = async () => {
        try {
            const res = await fetch("/api/me/telegram-status", { cache: "no-store" });
            if (!res.ok) return;
            const json = (await res.json()) as { linked?: boolean };
            if (json.linked && !seenLinkedRef.current && isAlive.current) {
                seenLinkedRef.current = true;
                setConfirmed(true);
                router.refresh();
                router.push("/dashboard");
            }
        } catch {
            /* noop */
        }
    };

    useEffect(() => {
        isAlive.current = true;
        void checkOnce();
        const interval = setInterval(() => {
            if (!isAlive.current) return;
            void checkOnce();
        }, 2000);
        const refreshInterval = setInterval(() => {
            if (!isAlive.current) return;
            router.refresh();
        }, 5000);
        return () => {
            isAlive.current = false;
            clearInterval(interval);
            clearInterval(refreshInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
            {confirmed ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Подтверждение получено, переход в кабинет…
                </span>
            ) : (
                <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
                    Ждём подтверждения от бота
                    <button
                        type="button"
                        onClick={() => {
                            void checkOnce();
                            router.refresh();
                        }}
                        className="ml-2 underline hover:text-white transition-colors"
                    >
                        Проверить сейчас
                    </button>
                </>
            )}
        </div>
    );
}
