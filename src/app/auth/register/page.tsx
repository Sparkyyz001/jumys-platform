"use client";

import { createSPASassClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SSOButtons from "@/components/SSOButtons";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [telegramHandle, setTelegramHandle] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
            const redirectTo = `${window.location.origin}/api/auth/callback?next=/onboarding/telegram`;
            const { error: signUpError } = await client.registerEmail(
                email,
                password,
                { telegram_username: telegramHandle.trim() || undefined },
                redirectTo
            );
            if (signUpError) throw signUpError;
            router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Регистрация</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-md">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Пароль</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="telegram-handle">Telegram handle (optional)</Label>
                        <Input
                            id="telegram-handle"
                            value={telegramHandle}
                            onChange={e => setTelegramHandle(e.target.value)}
                            placeholder="@your_username"
                        />
                    </div>
                    <div>
                        <Label htmlFor="confirm-password">Повторите пароль</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Создание..." : "Создать аккаунт"}
                    </Button>
                </form>
                <SSOButtons onError={setError} />
                <p className="mt-5 text-center text-sm text-gray-600">
                    Уже есть аккаунт?{" "}
                    <Link href="/auth/login" className="text-primary-700 font-medium hover:underline">
                        Войти
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}
