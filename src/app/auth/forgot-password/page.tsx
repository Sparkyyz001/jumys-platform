"use client";

import { useState } from "react";
import { createSPASassClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const client = await createSPASassClient();
            const { error: resetError } = await client.getSupabaseClient().auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (resetError) throw resetError;
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center"
            >
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-white">Проверьте почту</h2>
                <p className="text-sm text-gray-400 mb-6">
                    Мы отправили ссылку для восстановления пароля на ваш email.
                </p>
                <Link
                    href="/auth/login"
                    className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                    Вернуться ко входу
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-white">Восстановление пароля</h1>
            <p className="text-gray-400 text-sm mb-6">Введите email и мы пришлём ссылку для сброса</p>

            {error && (
                <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                </div>
            )}

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

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white py-2.5 text-sm font-medium transition-all duration-300 shadow-lg shadow-amber-500/20 disabled:opacity-60"
                >
                    {loading ? "Отправка..." : "Отправить ссылку"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                </motion.button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
                <Link href="/auth/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                    Вернуться ко входу
                </Link>
            </p>
        </motion.div>
    );
}
