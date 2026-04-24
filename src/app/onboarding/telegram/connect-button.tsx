"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createTelegramLinkAction } from "@/lib/actions/settings";

export default function TelegramConnectButton() {
    const [pending, startTransition] = useTransition();

    return (
        <Button
            size="lg"
            disabled={pending}
            onClick={() => {
                startTransition(async () => {
                    try {
                        const { url } = await createTelegramLinkAction();
                        window.open(url, "_blank", "noopener,noreferrer");
                        toast.success("Открыл бота. Нажмите Start для подтверждения.");
                    } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Не удалось открыть Telegram");
                    }
                });
            }}
        >
            {pending ? "Генерирую ссылку..." : "Подключить Telegram сейчас"}
        </Button>
    );
}
