"use client";

import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Crown, Sparkles, ShieldCheck } from "lucide-react";
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
    const compareRows = [
        ["Активных вакансий", "3", "3", "∞"],
        ["AI-рекомендации", "✓", "✓", "✓"],
        ["Telegram", "✓", "✓", "✓"],
        ["Boost в ТОПе", "—", "1 на 7 дней", "Все вакансии"],
        ["Verified Business", "—", "—", "✓"],
        ["Расширенная аналитика", "—", "—", "✓"],
        ["Приоритетная поддержка", "—", "—", "✓"],
    ];
    const faq = [
        {
            q: "Можно ли отменить подписку?",
            a: "Да, в любой момент из личного кабинета. Доступ сохраняется до конца оплаченного периода.",
        },
        {
            q: "Как работает Verified Business?",
            a: "Мы проверяем БИН/ИИН компании через открытые источники РК. Verified-бейдж видят соискатели — это в среднем в 1.4× повышает CTR на ваших вакансиях.",
        },
        {
            q: "В чём разница между Boost и Pro?",
            a: "Boost — одна вакансия в ТОПе на 7 дней. Pro — все ваши вакансии в ТОПе постоянно + безлимит вакансий + аналитика и Verified Business.",
        },
        {
            q: "Принимаете ли Kaspi Pay?",
            a: "Сейчас оплата через Stripe. Kaspi Pay в ближайшем релизе.",
        },
        {
            q: "Есть ли скидка для стартапов и НКО?",
            a: "Да, напишите нам в Telegram @jumys_support — даём 50% на первые 3 месяца.",
        },
    ];

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
        <div className="dark min-h-screen relative text-white bg-[#050505]">
            <div
                className="pointer-events-none fixed inset-0 -z-10"
                style={{
                    background:
                        "radial-gradient(ellipse 70% 50% at 20% 10%, rgba(251,146,60,0.07), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(56,189,248,0.06), transparent 60%)",
                }}
            />
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
                        <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
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
                        <Card className="border-white/[0.07] bg-white/[0.03] backdrop-blur-3xl text-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="h-5 w-5 text-amber-400" />
                                    <h3 className="font-semibold">Boost — выход в ТОП</h3>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Ваша вакансия закрепляется на первой позиции в каталоге `/jobs` и в подборке
                                    у соискателей в выбранном районе на 7 дней. Метка «⚡ Top» в карточке
                                    показывает, что компания платит за приоритет.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-white/[0.07] bg-white/[0.03] backdrop-blur-3xl text-white">
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

                        <Card className="border-white/[0.07] bg-white/[0.03] backdrop-blur-3xl text-white">
                            <CardContent className="p-5 text-sm text-gray-400">
                                <div className="font-semibold text-white mb-1">Что делает «выход в топ»</div>
                                <ul className="space-y-1.5 list-disc list-inside marker:text-amber-400">
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

                <section className="max-w-4xl mx-auto rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-3xl overflow-hidden mt-16">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-white/[0.07] bg-white/[0.03]">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-zinc-300">Функция</th>
                                    <th className="px-4 py-3 text-center font-medium text-zinc-300">Free</th>
                                    <th className="px-4 py-3 text-center font-medium text-zinc-300">Boost</th>
                                    <th className="px-4 py-3 text-center font-medium text-amber-300 bg-amber-500/5">Pro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {compareRows.map((row) => (
                                    <tr key={row[0]} className="border-t border-white/[0.06]">
                                        <td className="px-4 py-3 text-zinc-400">{row[0]}</td>
                                        <td className="px-4 py-3 text-center text-zinc-300">{row[1] === "✓" ? <Check className="size-4 mx-auto text-emerald-500" /> : row[1]}</td>
                                        <td className="px-4 py-3 text-center text-zinc-300">{row[2] === "✓" ? <Check className="size-4 mx-auto text-emerald-500" /> : row[2]}</td>
                                        <td className="px-4 py-3 text-center text-zinc-300 bg-amber-500/5">{row[3] === "✓" ? <Check className="size-4 mx-auto text-emerald-500" /> : row[3]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="max-w-3xl mx-auto mt-16 space-y-3">
                    <h2 className="text-2xl font-bold text-center mb-8">Частые вопросы</h2>
                    {faq.map((item) => (
                        <details
                            key={item.q}
                            className="group rounded-xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-3xl p-4 text-zinc-100 [&_summary::-webkit-details-marker]:hidden"
                        >
                            <summary className="flex cursor-pointer items-center justify-between font-medium">
                                <span>{item.q}</span>
                                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                            </summary>
                            <p className="mt-3 text-sm text-zinc-400">{item.a}</p>
                        </details>
                    ))}
                </section>
            </div>
        </div>
    );
}
