import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentFullProfile } from "@/lib/profile";
import { createSSRClient } from "@/lib/supabase/server";
import { SettingsForm } from "./form";

export const metadata = { title: "Настройки — Jumys" };
export const dynamic = "force-dynamic";

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
    const tab = (tabRaw === "verification" || tabRaw === "subscription" ? tabRaw : "profile") as "profile" | "verification" | "subscription";
    const seekerIin = typeof metadata.seeker_iin === "string" ? metadata.seeker_iin : "";
    const isEmployerVerified = normalizeDigits(companyBin).length === 12;
    const isSeekerVerified = normalizeDigits(seekerIin).length === 12;

    const tabLink = (value: "profile" | "verification" | "subscription") => `/dashboard/settings?tab=${value}`;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Настройки профиля</h1>
                <p className="text-sm text-gray-600 mt-1">Измените личные данные, пароль и контакты для Telegram</p>
            </div>

            <div className="flex flex-wrap gap-2">
                <Link href={tabLink("profile")} className={`rounded-full px-4 py-2 text-sm border ${tab === "profile" ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-700"}`}>
                    Профиль
                </Link>
                <Link href={tabLink("verification")} className={`rounded-full px-4 py-2 text-sm border ${tab === "verification" ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-700"}`}>
                    Проверка личности
                </Link>
                <Link href={tabLink("subscription")} className={`rounded-full px-4 py-2 text-sm border ${tab === "subscription" ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-700"}`}>
                    Подписка и продвижение
                </Link>
            </div>

            {tab === "profile" && <Card>
                <CardHeader>
                    <CardTitle>Профиль и интеграции</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>}

            {tab === "verification" && <Card id="trust-safety">
                <CardHeader>
                    <CardTitle>Проверка личности</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                    <p>Заполните IIN/BIN, чтобы получить доверие пользователей и снизить риск фейковых откликов.</p>
                    <div className="rounded-md border p-3 bg-gray-50">
                        <p className="font-medium text-gray-800">Статус работодателя: {isEmployerVerified ? "Проверен" : "Не проверен"}</p>
                        <p className="text-xs mt-1">Требование: BIN/IIN из 12 цифр в профиле компании.</p>
                    </div>
                    <div className="rounded-md border p-3 bg-gray-50">
                        <p className="font-medium text-gray-800">Статус соискателя: {isSeekerVerified ? "Проверен" : "Не проверен"}</p>
                        <p className="text-xs mt-1">Требование: IIN из 12 цифр в профиле соискателя.</p>
                    </div>
                    <p className="text-xs">Данные меняются в вкладке «Профиль».</p>
                </CardContent>
            </Card>}

            {tab === "subscription" && <Card>
                <CardHeader>
                    <CardTitle>Подписка и продвижение</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <p className="text-gray-600">Как в маркетплейсах: можно поднять вакансии выше в выдаче.</p>
                    <div className="grid md:grid-cols-2 gap-3">
                        <div className="rounded-md border p-4">
                            <p className="font-semibold">Free</p>
                            <p className="text-gray-600 mt-1">Обычное размещение вакансий</p>
                        </div>
                        <div className="rounded-md border border-primary-300 bg-primary-50 p-4">
                            <p className="font-semibold text-primary-800">Top (скоро)</p>
                            <p className="text-gray-700 mt-1">Приоритет в поиске и значок «TOP» в карточке</p>
                        </div>
                    </div>
                </CardContent>
            </Card>}
        </div>
    );
}

function normalizeDigits(value: string): string {
    return value.replace(/\D/g, "");
}
