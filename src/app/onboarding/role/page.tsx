import Link from "next/link";
import { Search, Users } from "lucide-react";

export const metadata = { title: "Выберите роль — Jumys" };

export default function RolePage() {
    return (
        <div>
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-zinc-100">Кто вы?</h1>
                <p className="mt-2 text-zinc-400">Выберите, как будете использовать Jumys</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Link href="/onboarding/seeker" className="group">
                    <div className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-3xl p-6 transition-all duration-300 group-hover:border-amber-500/35 group-hover:shadow-lg group-hover:shadow-amber-500/[0.08] cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mb-4">
                            <Search className="h-5 w-5 text-amber-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-zinc-100 mb-1">Ищу работу</h2>
                        <p className="text-sm text-zinc-400 mb-4">
                            Заполните профиль, получайте подходящие вакансии в Актау и откликайтесь в один клик
                        </p>
                        <ul className="text-sm text-zinc-500 space-y-1.5">
                            <li className="flex items-center gap-2"><span className="text-amber-500">→</span> AI-подбор вакансий под ваши навыки</li>
                            <li className="flex items-center gap-2"><span className="text-amber-500">→</span> Объяснение почему вакансия подходит</li>
                            <li className="flex items-center gap-2"><span className="text-amber-500">→</span> Уведомления в Telegram</li>
                        </ul>
                    </div>
                </Link>

                <Link href="/onboarding/employer" className="group">
                    <div className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-3xl p-6 transition-all duration-300 group-hover:border-amber-500/35 group-hover:shadow-lg group-hover:shadow-amber-500/[0.08] cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mb-4">
                            <Users className="h-5 w-5 text-amber-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-zinc-100 mb-1">Ищу сотрудников</h2>
                        <p className="text-sm text-zinc-400 mb-4">
                            Разместите вакансии и получите подборку подходящих кандидатов автоматически
                        </p>
                        <ul className="text-sm text-zinc-500 space-y-1.5">
                            <li className="flex items-center gap-2"><span className="text-amber-500">→</span> Публикация вакансий</li>
                            <li className="flex items-center gap-2"><span className="text-amber-500">→</span> AI-ранжирование откликов</li>
                            <li className="flex items-center gap-2"><span className="text-amber-500">→</span> Связь с кандидатами по WhatsApp</li>
                        </ul>
                    </div>
                </Link>
            </div>
        </div>
    );
}
