"use client";

import { useState } from "react";
import { createSPASassClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }
        if (newPassword.length < 6) {
            setError("Пароль должен быть не короче 6 символов");
            return;
        }

        setLoading(true);
        try {
            const client = await createSPASassClient();
            const { error: updateError } = await client.getSupabaseClient().auth.updateUser({
                password: newPassword,
            });
            if (updateError) throw updateError;
            setSuccess(true);
            setTimeout(() => router.push("/dashboard"), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось обновить пароль");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Card>
                <CardContent className="pt-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Пароль обновлён</h2>
                    <p className="text-sm text-gray-600">
                        Перенаправляем в личный кабинет...
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Новый пароль</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-md">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="new-password">Новый пароль</Label>
                        <Input
                            id="new-password"
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
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
                        {loading ? "Сохранение..." : "Сохранить пароль"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
