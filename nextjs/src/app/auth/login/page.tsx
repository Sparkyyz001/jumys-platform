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

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const next = typeof window !== "undefined"
            ? (new URLSearchParams(window.location.search).get("next") ?? "/dashboard")
            : "/dashboard";
        try {
            const client = await createSPASassClient();
            const { error: signInError } = await client.loginEmail(email, password);
            if (signInError) throw signInError;
            router.push(next);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Вход</CardTitle>
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
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <Link
                            href="/auth/forgot-password"
                            className="text-xs text-primary-700 hover:underline mt-1 inline-block"
                        >
                            Забыли пароль?
                        </Link>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Вход..." : "Войти"}
                    </Button>
                </form>
                <SSOButtons onError={setError} />
                <p className="mt-5 text-center text-sm text-gray-600">
                    Нет аккаунта?{" "}
                    <Link href="/auth/register" className="text-primary-700 font-medium hover:underline">
                        Зарегистрироваться
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}
