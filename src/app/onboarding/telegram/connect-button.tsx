"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { createTelegramLinkAction } from "@/lib/actions/settings";

export default function TelegramConnectButton() {
    const [pending, startTransition] = useTransition();

    return (
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 text-sm font-medium transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-60"
        >
            <Send className="h-4 w-4" />
            {pending ? "Генерирую ссылку..." : "Подключить Telegram сейчас"}
        </motion.button>
    );
}
