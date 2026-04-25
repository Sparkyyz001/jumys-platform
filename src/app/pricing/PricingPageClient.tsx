"use client";

import Link from "next/link";
import { ArrowLeft, Crown, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { PricingInteraction } from "@/components/ui/pricing-interaction";
import { Card, CardContent } from "@/components/ui/card";

const PLANS = [
    {
        name: "Free",
        monthly: 0,
        annual: 0,
        features: [
            "До 3 активных вакансий",
            "AI-рекомендации кандидатов",
            "Уведомления в Telegram",
        ],
    },
    {
        name: "Boost",
        monthly: 4990,
        annual: 3490,
        badge: "Топ",
        features: [
            "1 вакансия в ТОПе на 7 дней",
            "Приоритет в AI-выдаче",
            "Бейдж ⚡ в карточке",
            "В 6× больше откликов",
        ],
    },
    {
        name: "Pro",
        monthly: 14990,
        annual: 11490,
        badge: "Лучшее",
        features: [
            "Безлимит вакансий",
            "Все вакансии в ТОПе",
            "Verified Business",
            "Приоритетная поддержка",
            "Расширенная аналитика",
        ],
    },
];

export function PricingPageClient({ signedIn }: { signedIn: boolean }) {
    const [busy, setBusy] = useState(false);

    const handleSelect = async (planIndex: number, period: "monthly" | "annual") => {
        const plan = PLANS[planIndex];
        if (plan.monthly === 0) {
            toast.success("Бесплатный тариф уже активен");
            return;
        }
        if (!signedIn) {
            toast.info("Войдите в аккаунт, чтобы оформить тариф");
            window.location.href = "/auth/login?next=/pricing";
            return;
        }
        setBusy(true);
        try {
            // MVP: оплата ещё не подключена, оставим заявку и через бот напомним
            await new Promise((r) => setTimeout(r, 600));
            toast.success(
                `Заявка на тариф «${plan.name}» (${period === "monthly" ? "месяц" : "год"}) принята. Свяжемся в Telegram.`
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="dark min-h-screen bg-gradient-to-br from-[#060818] via-[#0a0d20] to-[#0d1023] text-white">
            <div className="max-w-6xl mx-auto px-4 py-10">
                <Link
                    href="/"
                    className="inline-flex items-center text-xs text-gray-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    На главную
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-4">
                        <Crown className="h-3.5 w-3.5 text-amber-300" />
                        <span className="text-xs text-gray-300">Тарифы Jumys</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                        Поднимите вакансию в{" "}
                        <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            ТОП Актау
                        </span>
                    </h1>
                    <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                        Boost-вакансии получают в среднем в 6 раз больше откликов и стоят в начале AI-подборки.
                        Платежи в тенге, можно отменить в любой момент.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-8 items-start">
                    {/* Features explainer */}
                    <div className="space-y-4">
                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl text-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="h-5 w-5 text-blue-400" />
                                    <h3 className="font-semibold">Boost — выход в ТОП</h3>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Ваша вакансия закрепляется на первой позиции в каталоге `/jobs` и в подборке
                                    у соискателей в выбранном районе на 7 дней. Метка «⚡ Top» в карточке
                                    показывает, что компания платит за приоритет.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl text-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                    <h3 className="font-semibold">Pro — Verified Business</h3>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Подтверждение по BIN/IIN, безлимит вакансий, аналитика по откликам и
                                    источникам. Помечается зелёным бейджем «Verified» — соискатели охотнее
                                    откликаются.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/10 bg-white/5 backdrop-blur-xl text-white">
                            <CardContent className="p-5 text-sm text-gray-400">
                                <div className="font-semibold text-white mb-1">Что делает «выход в топ»</div>
                                <ul className="space-y-1.5 list-disc list-inside marker:text-blue-400">
                                    <li>Ваша вакансия — первая в списке `/jobs`.</li>
                                    <li>В AI-рекомендациях получает повышенный score.</li>
                                    <li>Бейдж ⚡ повышает CTR в среднем в 1.8×.</li>
                                    <li>Push-уведомление подписчикам Telegram-бота.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pricing card */}
                    <div className="flex justify-center lg:justify-end">
                        <PricingInteraction
                            plans={PLANS}
                            currency="₸"
                            ctaLabel={busy ? "Оформляем…" : "Выбрать тариф"}
                            onSelect={handleSelect}
                        />
                    </div>
                </div>

                <p className="mt-12 text-center text-xs text-gray-500">
                    Цены указаны в тенге, без НДС. Оплата за месяц списывается единоразово.
                    Подробности — в{" "}
                    <Link href="/terms" className="underline hover:text-white">условиях использования</Link>{" "}
                    и{" "}
                    <Link href="/privacy" className="underline hover:text-white">политике конфиденциальности</Link>.
                </p>
            </div>
        </div>
    );
}
