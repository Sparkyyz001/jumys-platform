"use client";

import { createSPASassClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import SSOButtons from "@/components/SSOButtons";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [telegramHandle, setTelegramHandle] = useState("");
    const [loading, setLoading] = useState(false);
    const [isPwdVisible, setIsPwdVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }
        if (password.length < 6) {
            setError("Пароль должен быть не короче 6 символов");
            return;
        }

        setLoading(true);
        try {
            const client = await createSPASassClient();
            const nextParam =
                typeof window !== "undefined"
                    ? new URLSearchParams(window.location.search).get("next") ?? "/dashboard"
                    : "/dashboard";
            const nextPath = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

            const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextPath)}`;
            const { data, error: signUpError } = await client.registerEmail(
                email,
                password,
                { telegram_username: telegramHandle.trim() || undefined },
                redirectTo
            );
            if (signUpError) throw signUpError;

            if (data.session?.access_token && data.session.user) {
                router.push(nextPath);
                router.refresh();
                return;
            }

            router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
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
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-white">Регистрация</h1>
            <p className="text-gray-400 text-sm mb-6">Создайте аккаунт и получите AI-подбор работы</p>

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
                        className="flex h-10 w-full rounded-md border border-[#2a2d3a] bg-[#13151f] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-amber-500 focus:outline-none transition-colors"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                        Пароль <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={isPwdVisible ? "text" : "password"}
                            required
                            minLength={6}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Минимум 6 символов"
                            className="flex h-10 w-full rounded-md border border-[#2a2d3a] bg-[#13151f] px-3 py-2 pr-10 text-sm text-gray-200 placeholder:text-gray-500 focus:border-amber-500 focus:outline-none transition-colors"
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

                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-1">
                        Повторите пароль <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="confirm-password"
                            type={isConfirmVisible ? "text" : "password"}
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Ещё раз пароль"
                            className="flex h-10 w-full rounded-md border border-[#2a2d3a] bg-[#13151f] px-3 py-2 pr-10 text-sm text-gray-200 placeholder:text-gray-500 focus:border-amber-500 focus:outline-none transition-colors"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                            onClick={() => setIsConfirmVisible(v => !v)}
                            aria-label={isConfirmVisible ? "Скрыть пароль" : "Показать пароль"}
                        >
                            {isConfirmVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="telegram-handle" className="block text-sm font-medium text-gray-300 mb-1">
                        Telegram username <span className="text-gray-500 text-xs">(необязательно)</span>
                    </label>
                    <input
                        id="telegram-handle"
                        value={telegramHandle}
                        onChange={e => setTelegramHandle(e.target.value)}
                        placeholder="@your_username"
                        className="flex h-10 w-full rounded-md border border-[#2a2d3a] bg-[#13151f] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-amber-500 focus:outline-none transition-colors"
                    />
                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white py-2.5 text-sm font-medium transition-all duration-300 shadow-lg shadow-amber-500/20 disabled:opacity-60"
                >
                    {loading ? "Создание..." : "Создать аккаунт"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                </motion.button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
                Уже есть аккаунт?{" "}
                <Link
                    href={
                        searchParams.get("next")
                            ? `/auth/login?next=${encodeURIComponent(searchParams.get("next")!)}`
                            : "/auth/login"
                    }
                    className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                    Войти
                </Link>
            </p>
        </motion.div>
    );
}
