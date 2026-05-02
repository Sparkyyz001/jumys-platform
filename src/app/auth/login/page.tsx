"use client";

import { createSPASassClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import SSOButtons from "@/components/SSOButtons";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isPwdVisible, setIsPwdVisible] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const next =
            typeof window !== "undefined"
                ? new URLSearchParams(window.location.search).get("next") ?? "/dashboard"
                : "/dashboard";
        const nextPath = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
        try {
            const client = await createSPASassClient();
            const { data, error: signInError } = await client.loginEmail(email, password);
            if (signInError) throw signInError;
            if (!data.user?.email_confirmed_at) {
                await client.logout();
                router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
                return;
            }
            router.push(nextPath);
            router.refresh();
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
        >
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-white">С возвращением</h1>
            <p className="text-gray-400 text-sm mb-6">Войдите в свой аккаунт Jumys</p>

            {error && (
                <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            <SSOButtons onError={setError} />

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#2a2d3a]" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-[#090b13] px-2 text-gray-400">или email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                        Email <span className="text-amber-400">*</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="flex h-10 w-full rounded-xl border border-white/[0.10] bg-zinc-900/80 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-amber-500 focus:outline-none transition-colors"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                            Пароль <span className="text-amber-400">*</span>
                        </label>
                        <Link
                            href="/auth/forgot-password"
                            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                        >
                            Забыли пароль?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type={isPwdVisible ? "text" : "password"}
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Введите пароль"
                            className="flex h-10 w-full rounded-xl border border-white/[0.10] bg-zinc-900/80 px-3 py-2 pr-10 text-sm text-gray-200 placeholder:text-gray-500 focus:border-amber-500 focus:outline-none transition-colors"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                            onClick={() => setIsPwdVisible(v => !v)}
                            aria-label={isPwdVisible ? "Скрыть пароль" : "Показать пароль"}
                        >
                            {isPwdVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white py-2.5 text-sm font-medium transition-all duration-300 shadow-lg shadow-amber-500/20 disabled:opacity-60"
                >
                    {loading ? "Вход..." : "Войти"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                </motion.button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
                Нет аккаунта?{" "}
                <Link
                    href={
                        searchParams.get("next")
                            ? `/auth/register?next=${encodeURIComponent(searchParams.get("next")!)}`
                            : "/auth/register"
                    }
                    className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                    Зарегистрироваться
                </Link>
            </p>
        </motion.div>
    );
}
