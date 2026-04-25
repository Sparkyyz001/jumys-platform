"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSPASassClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

export default function VerifyEmailPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const initialEmail = params.get("email");
        if (initialEmail) setEmail(initialEmail);
    }, []);

    useEffect(() => {
        const timer = setInterval(async () => {
            const client = await createSPASassClient();
            const { data } = await client.getSupabaseClient().auth.getSession();
            if (data.session?.user?.email_confirmed_at) {
                router.push("/dashboard");
                router.refresh();
            }
        }, 2500);
        return () => clearInterval(timer);
    }, [router]);

    const resend = async () => {
        if (!email) {
            setError("Введите email");
            return;
        }
        try {
            setLoading(true);
            setError("");
            const client = await createSPASassClient();
            const { error: resendError } = await client.resendVerificationEmail(email);
            if (resendError) throw resendError;
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
        >
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-white">Проверьте почту</h2>
            <p className="text-sm text-gray-400 mb-2">
                Мы отправили письмо со ссылкой для подтверждения. Перейдите по ней, чтобы активировать аккаунт.
            </p>
            <p className="text-xs text-gray-500 mb-6">
                Эта страница обновится автоматически после подтверждения и переведёт вас в личный кабинет.
            </p>

            <div className="border-t border-[#2a2d3a] pt-6 space-y-3 text-left">
                <p className="text-xs text-gray-400 text-center">
                    Не пришло письмо? Проверьте спам или отправьте повторно:
                </p>
                {error && (
                    <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-300">
                        Письмо отправлено повторно
                    </div>
                )}
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Ваш email"
                    className="flex h-10 w-full rounded-md border border-[#2a2d3a] bg-[#13151f] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <button
                    type="button"
                    onClick={resend}
                    disabled={loading}
                    className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#2a2d3a] bg-[#13151f] hover:bg-[#1a1d2b] text-sm font-medium text-gray-200 transition-all disabled:opacity-50"
                >
                    {loading ? "Отправка..." : "Отправить повторно"}
                </button>
            </div>

            <div className="mt-6 pt-4 border-t border-[#2a2d3a]">
                <Link href="/auth/login" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    Вернуться ко входу
                </Link>
            </div>
        </motion.div>
    );
}
