import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentFullProfile } from "@/lib/profile";
import TelegramConnectButton from "./connect-button";

export const metadata = { title: "Подключение Telegram — Jumys" };
export const dynamic = "force-dynamic";

export default async function TelegramOnboardingPage() {
    const data = await getCurrentFullProfile();
    if (!data?.profile) redirect("/auth/login");
    if (data.profile.telegram_chat_id) redirect("/dashboard");

    return (
        <div className="max-w-xl mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Последний шаг: подключите Telegram</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Это обязательно для быстрых уведомлений: когда кто-то откликнется, вы сразу получите сообщение в Telegram.
                    </p>
                    <ol className="text-sm text-gray-700 space-y-1 list-decimal pl-5">
                        <li>Нажмите кнопку ниже.</li>
                        <li>Откроется бот Jumys.</li>
                        <li>Нажмите Start — подключение завершится автоматически.</li>
                    </ol>
                    <TelegramConnectButton />
                </CardContent>
            </Card>
        </div>
    );
}
