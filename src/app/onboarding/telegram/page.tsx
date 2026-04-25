import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Briefcase, Send } from "lucide-react";
import { getCurrentFullProfile } from "@/lib/profile";
import { DotMapBackground } from "@/components/ui/dot-map-background";
import TelegramConnectButton from "./connect-button";

export const metadata = { title: "Подключение Telegram — Jumys" };
export const dynamic = "force-dynamic";

export default async function TelegramOnboardingPage() {
    const data = await getCurrentFullProfile();
    if (!data?.profile) redirect("/auth/login");
    if (data.profile.telegram_chat_id) redirect("/dashboard");

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#060818] to-[#0d1023] p-4">
            <div className="w-full max-w-5xl rounded-2xl overflow-hidden flex bg-[#090b13] text-white shadow-2xl ring-1 ring-white/10">
                <div className="hidden md:block md:w-1/2 relative overflow-hidden border-r border-[#1f2130] min-h-[560px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0f1120] to-[#151929]">
                        <DotMapBackground />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                            <Link
                                href="/dashboard"
                                className="absolute left-6 top-6 inline-flex items-center text-xs text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                                В кабинет
                            </Link>
                            <div className="mb-6 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Send className="text-white h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                                Telegram бот
                            </h2>
                            <p className="text-sm text-center text-gray-400 max-w-xs mb-8">
                                Получайте мгновенные уведомления о новых откликах, новых вакансиях и AI-подобранных кандидатах.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-center gap-2">
                                    <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
                                    Уведомления в реальном времени
                                </li>
                                <li className="flex items-center gap-2">
                                    <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
                                    Отклик на вакансии в один клик
                                </li>
                                <li className="flex items-center gap-2">
                                    <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
                                    Безопасный one-time link
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                    <div className="md:hidden mb-4 inline-flex items-center gap-2 text-blue-400 font-bold">
                        <Briefcase className="h-5 w-5" />
                        Jumys
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1 text-white">
                        Последний шаг
                    </h1>
                    <p className="text-gray-400 text-sm mb-6">
                        Подключите Telegram, чтобы получать уведомления и откликаться в один клик
                    </p>

                    <ol className="text-sm text-gray-300 space-y-3 mb-8 list-none">
                        <li className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
                                1
                            </span>
                            Нажмите кнопку ниже
                        </li>
                        <li className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
                                2
                            </span>
                            Откроется бот Jumys в Telegram
                        </li>
                        <li className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
                                3
                            </span>
                            Нажмите Start — подключение завершится автоматически
                        </li>
                    </ol>

                    <TelegramConnectButton />

                    <p className="mt-6 text-center text-xs text-gray-500">
                        Можно подключить позже из{" "}
                        <Link href="/dashboard/settings" className="text-blue-400 hover:text-blue-300 transition-colors">
                            настроек профиля
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
