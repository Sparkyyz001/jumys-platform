"use client";

import { useState } from "react";
import { createSPASassClient } from "@/lib/supabase/client";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
            <Card>
                <CardContent className="pt-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Проверьте почту</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Мы отправили ссылку для восстановления пароля на ваш email.
                    </p>
                    <Link href="/auth/login" className="text-sm text-primary-700 font-medium hover:underline">
                        Вернуться ко входу
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Восстановление пароля</CardTitle>
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
                        <p className="mt-2 text-xs text-gray-500">
                            Мы отправим ссылку для сброса пароля на указанный email
                        </p>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Отправка..." : "Отправить ссылку"}
                    </Button>
                </form>
                <p className="mt-5 text-center text-sm text-gray-600">
                    <Link href="/auth/login" className="text-primary-700 font-medium hover:underline">
                        Вернуться ко входу
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}
