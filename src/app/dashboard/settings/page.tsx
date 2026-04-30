import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check, Crown, ShieldCheck, Sparkles, User } from "lucide-react";
import { getCurrentFullProfile } from "@/lib/profile";
import { createSSRClient } from "@/lib/supabase/server";
import { SettingsForm } from "./form";
import { EmojiRating } from "@/components/ui/emoji-rating";

export const metadata = { title: "Настройки — Jumys" };
export const dynamic = "force-dynamic";

type Tab = "profile" | "verification" | "subscription";

const PLAN_FEATURES: Record<"free" | "boost" | "pro", { label: string; price: string; features: string[]; badge?: string; accent: string; }> = {
    free: {
        label: "Free",
        price: "0 ₸/мес",
        accent: "from-slate-500/20 to-slate-700/20",
        features: [
            "До 3 активных вакансий",
            "AI-рекомендации",
            "Telegram-уведомления",
        ],
    },
    boost: {
        label: "Boost",
        price: "4 990 ₸/мес",
        badge: "Топ",
        accent: "from-blue-500/30 to-indigo-600/30",
        features: [
            "1 вакансия в ТОПе на 7 дней",
            "Приоритет в AI-выдаче",
            "Бейдж ⚡ в карточке",
            "До 6× больше откликов",
        ],
    },
    pro: {
        label: "Pro",
        price: "14 990 ₸/мес",
        badge: "Лучшее",
        accent: "from-amber-500/30 to-rose-500/30",
        features: [
            "Безлимит вакансий",
            "Все вакансии в ТОПе",
            "Verified Business",
            "Расширенная аналитика",
        ],
    },
};

export default async function SettingsPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const data = await getCurrentFullProfile();
    if (!data?.profile) redirect("/auth/login");

    const supabase = await createSSRClient();
    const { data: authData } = await supabase.auth.getUser();
    const metadata = authData.user?.user_metadata ?? {};
    const companyType = data.employer?.company_type ?? "";
    const companyBin = typeof metadata.company_bin_iin === "string"
        ? metadata.company_bin_iin
        : (companyType.match(/BIN\/IIN:([A-Za-z0-9-]+)/i)?.[1] ?? "");
    const companyDescription = companyType.replace(/\s*\|\s*BIN\/IIN:[A-Za-z0-9-]+/i, "").trim();
    const params = await searchParams;
    const tabRaw = params.tab;
    const tab: Tab = (tabRaw === "verification" || tabRaw === "subscription" ? tabRaw : "profile") as Tab;
    const seekerIin = typeof metadata.seeker_iin === "string" ? metadata.seeker_iin : "";
    const isEmployerVerified = normalizeDigits(companyBin).length === 12;
    const isSeekerVerified = normalizeDigits(seekerIin).length === 12;

    const tabLink = (value: Tab) => `/dashboard/settings?tab=${value}`;

    const tabs: { id: Tab; label: string; icon: typeof User }[] = [
        { id: "profile", label: "Профиль", icon: User },
        { id: "verification", label: "Верификация", icon: ShieldCheck },
        { id: "subscription", label: "Подписка", icon: Crown },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-zinc-100">Настройки профиля</h1>
                <p className="text-sm text-zinc-400 mt-1">Личные данные, верификация, подписка и продвижение</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {tabs.map(({ id, label, icon: Icon }) => {
                    const active = tab === id;
                    return (
                        <Link
                            key={id}
                            href={tabLink(id)}
                            className={[
                                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors",
                                active
                                    ? "bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border-blue-500/40 text-white"
                                    : "bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.07]",
                            ].join(" ")}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </Link>
                    );
                })}
            </div>

            {tab === "profile" && (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-3xl p-6">
                    <h2 className="text-lg font-semibold text-zinc-100 mb-4">Профиль и интеграции</h2>
                    <SettingsForm
                        role={data.profile.role}
                        fullName={data.profile.full_name ?? ""}
                        about={data.seeker?.about ?? ""}
                        avatarUrl={typeof metadata.avatar_url === "string" ? metadata.avatar_url : ""}
                        telegramUsername={typeof metadata.telegram_username === "string" ? metadata.telegram_username : ""}
                        companyName={data.employer?.company_name ?? ""}
                        companyBinIin={companyBin}
                        companyDescription={companyDescription}
                        seekerIin={seekerIin}
                        telegramConnected={Boolean(data.profile.telegram_chat_id)}
                    />
                </div>
            )}

            {tab === "verification" && (
                <div id="trust-safety" className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-3xl p-6 space-y-3 text-sm text-zinc-300">
                    <h2 className="text-lg font-semibold text-zinc-100">Проверка личности</h2>
                    <p>Заполните IIN/BIN, чтобы получить доверие пользователей и снизить риск фейковых откликов.</p>
                    <div className={`rounded-xl border p-4 ${isEmployerVerified ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
                        <p className="font-medium text-zinc-100 flex items-center gap-2">
                            <ShieldCheck className={`h-4 w-4 ${isEmployerVerified ? "text-emerald-400" : "text-gray-500"}`} />
                            Статус работодателя: {isEmployerVerified ? "Проверен" : "Не проверен"}
                        </p>
                        <p className="text-xs mt-1 text-zinc-400">Требование: BIN/IIN из 12 цифр в профиле компании.</p>
                    </div>
                    <div className={`rounded-xl border p-4 ${isSeekerVerified ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
                        <p className="font-medium text-zinc-100 flex items-center gap-2">
                            <ShieldCheck className={`h-4 w-4 ${isSeekerVerified ? "text-emerald-400" : "text-gray-500"}`} />
                            Статус соискателя: {isSeekerVerified ? "Проверен" : "Не проверен"}
                        </p>
                        <p className="text-xs mt-1 text-zinc-400">Требование: IIN из 12 цифр в профиле соискателя.</p>
                    </div>
                    <p className="text-xs text-zinc-500">Данные меняются на вкладке «Профиль».</p>
                </div>
            )}

            {tab === "subscription" && (
                <div className="space-y-6">
                    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-blue-600/5 p-6 backdrop-blur-3xl">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-blue-300/80 font-medium mb-1">Текущий тариф</p>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-3xl font-bold text-white">{PLAN_FEATURES.free.label}</h2>
                                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs text-gray-300">{PLAN_FEATURES.free.price}</span>
                                </div>
                                <p className="text-sm text-zinc-300 mt-1">Базовый план активен по умолчанию. Без оплаты — без ТОПа.</p>
                            </div>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 text-sm font-medium shadow-lg shadow-blue-500/20 transition-all whitespace-nowrap"
                            >
                                <Sparkles className="h-4 w-4" />
                                Поднять в ТОП
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-base font-semibold text-zinc-100 mb-3">Планы и продвижение</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            {(["free", "boost", "pro"] as const).map((id) => {
                                const plan = PLAN_FEATURES[id];
                                const isCurrent = id === "free";
                                return (
                                    <div
                                        key={id}
                                        className={`relative rounded-2xl border p-5 backdrop-blur-xl transition-all ${
                                            isCurrent
                                                ? "border-blue-500/40 bg-gradient-to-br from-blue-600/15 to-indigo-600/10"
                                                : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.18]"
                                        }`}
                                    >
                                        {plan.badge && (
                                            <span className="absolute -top-2 right-4 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-amber-400 to-rose-400 text-slate-900">
                                                {plan.badge}
                                            </span>
                                        )}
                                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${plan.accent} opacity-30 -z-10`} />
                                        <div className="flex items-baseline justify-between mb-3">
                                            <h4 className="text-xl font-bold text-zinc-100">{plan.label}</h4>
                                            <span className="text-sm text-zinc-100 font-semibold">{plan.price}</span>
                                        </div>
                                        <ul className="space-y-2 text-sm text-zinc-300">
                                            {plan.features.map((f) => (
                                                <li key={f} className="flex items-start gap-2">
                                                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-5">
                                            {isCurrent ? (
                                                    <span className="inline-flex w-full items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-200 text-sm font-medium py-2">
                                                    Текущий план
                                                </span>
                                            ) : (
                                                <Link
                                                    href="/pricing"
                                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-medium py-2 shadow-lg shadow-blue-500/20 transition-all"
                                                >
                                                    Перейти на {plan.label}
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="rounded-xl glass-card-strong p-5 text-sm text-zinc-300">
                            <p className="font-semibold text-zinc-100 mb-2">Как работает «выход в ТОП»</p>
                            <ul className="space-y-1.5 list-disc list-inside marker:text-blue-400">
                                <li>Ваша вакансия закрепляется первой в списке /jobs.</li>
                                <li>AI-рекомендации поднимают её в выдаче.</li>
                                <li>Бейдж ⚡ повышает CTR ~1.8×.</li>
                                <li>Push в Telegram-боте по подходящим соискателям.</li>
                            </ul>
                        </div>
                        <div className="rounded-xl glass-card-strong p-5">
                            <EmojiRating label="Оцените Jumys — мы читаем каждый отзыв" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function normalizeDigits(value: string): string {
    return value.replace(/\D/g, "");
}
