"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSPASassClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
                router.push("/onboarding/telegram");
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
        <Card>
            <CardContent className="pt-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Проверьте почту</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Мы отправили письмо со ссылкой для подтверждения. Перейдите по ней, чтобы активировать аккаунт.
                </p>
                <p className="text-xs text-gray-500 mb-4">
                    Эта страница обновится автоматически после подтверждения и переведет вас на подключение Telegram.
                </p>

                <div className="border-t border-gray-200 pt-6 space-y-3 text-left">
                    <p className="text-xs text-gray-500 text-center">
                        Не пришло письмо? Проверьте спам или отправьте повторно:
                    </p>
                    {error && (
                        <div className="text-xs text-red-700 bg-red-50 rounded-md p-2">{error}</div>
                    )}
                    {success && (
                        <div className="text-xs text-green-700 bg-green-50 rounded-md p-2">
                            Письмо отправлено повторно
                        </div>
                    )}
                    <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Ваш email"
                    />
                    <Button onClick={resend} disabled={loading} variant="outline" className="w-full">
                        {loading ? "Отправка..." : "Отправить повторно"}
                    </Button>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                    <Link href="/auth/login" className="text-sm text-primary-700 font-medium hover:underline">
                        Вернуться ко входу
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
