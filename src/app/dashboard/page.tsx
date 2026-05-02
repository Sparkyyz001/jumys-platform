import Link from "next/link";
import { Briefcase, FileText, Sparkles, Users, Plus, MessageCircle, CheckCircle2 } from "lucide-react";
import { getCurrentFullProfile } from "@/lib/profile";
import { createSSRClient } from "@/lib/supabase/server";
import { DashboardVisual } from "@/components/DashboardVisual";

export const metadata = { title: "Обзор — Jumys" };
export const dynamic = "force-dynamic";

export default async function DashboardHome() {
    const data = await getCurrentFullProfile();
    if (!data || !data.profile) return null;
    const supabase = await createSSRClient();

    const isEmployer = data.profile.role === "employer";

    let jobsCount = 0;
    let applicationsCount = 0;
    let newApplicationsCount = 0;

    if (isEmployer) {
        const { count: jc } = await supabase
            .from("jobs")
            .select("id", { count: "exact", head: true })
            .eq("employer_id", data.user.id);
        jobsCount = jc ?? 0;

        const { data: myJobs } = await supabase
            .from("jobs")
            .select("id")
            .eq("employer_id", data.user.id);
        const jobRows = (myJobs ?? []) as Array<{ id: string }>;
        const jobIds = jobRows.map(j => j.id);

        if (jobIds.length > 0) {
            const { count: ac } = await supabase
                .from("applications")
                .select("id", { count: "exact", head: true })
                .in("job_id", jobIds);
            applicationsCount = ac ?? 0;

            const { count: nac } = await supabase
                .from("applications")
                .select("id", { count: "exact", head: true })
                .in("job_id", jobIds)
                .eq("status", "new");
            newApplicationsCount = nac ?? 0;
        }
    } else {
        const { count: ac } = await supabase
            .from("applications")
            .select("id", { count: "exact", head: true })
            .eq("seeker_id", data.user.id);
        applicationsCount = ac ?? 0;
    }

    const glassCard = "rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-3xl p-6 hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/[0.07] transition-all duration-300";
    const btnAmber = "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all";
    const btnGhost = "inline-flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07]";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-zinc-100">
                    Привет, {data.profile.full_name?.split(" ")[0] ?? "друг"}!
                </h1>
                <p className="text-zinc-400 mt-1">
                    {isEmployer ? "Управляйте вакансиями и откликами" : "Откликайтесь на вакансии в Актау"}
                </p>
            </div>

            {isEmployer ? (
                <div className="grid gap-4 md:grid-cols-3">
                    <div className={glassCard}>
                        <div className="flex items-center gap-3 mb-4">
                            <Briefcase className="h-5 w-5 text-amber-400" />
                            <span className="font-semibold text-zinc-100">Мои вакансии</span>
                        </div>
                        <p className="text-3xl font-bold text-zinc-100">{jobsCount}</p>
                        <Link href="/dashboard/jobs" className="mt-2 text-sm text-amber-400 hover:text-amber-300 transition-colors">
                            Посмотреть →
                        </Link>
                    </div>
                    <div className={glassCard}>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="h-5 w-5 text-amber-400" />
                            <span className="font-semibold text-zinc-100">Отклики</span>
                        </div>
                        <p className="text-3xl font-bold text-zinc-100">{applicationsCount}</p>
                        <Link href="/dashboard/applications" className="mt-2 text-sm text-amber-400 hover:text-amber-300 transition-colors">
                            Посмотреть →
                        </Link>
                    </div>
                    <div className={glassCard}>
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="h-5 w-5 text-amber-400" />
                            <span className="font-semibold text-zinc-100">Новые</span>
                        </div>
                        <p className="text-3xl font-bold text-amber-400">{newApplicationsCount}</p>
                        <p className="mt-2 text-sm text-zinc-500">Ожидают просмотра</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-3">
                    <div className={glassCard}>
                        <div className="flex items-center gap-3 mb-1">
                            <Sparkles className="h-5 w-5 text-amber-400" />
                            <span className="font-semibold text-zinc-100">AI Рекомендации</span>
                        </div>
                        <p className="text-sm text-zinc-400 mb-4">Подборка вакансий по вашему профилю</p>
                        <Link href="/dashboard/recommendations">
                            <button className={btnAmber}>Смотреть подборку</button>
                        </Link>
                    </div>
                    <div className={glassCard}>
                        <div className="flex items-center gap-3 mb-1">
                            <FileText className="h-5 w-5 text-amber-400" />
                            <span className="font-semibold text-zinc-100">Мои отклики</span>
                        </div>
                        <p className="text-sm text-zinc-400 mb-4">{applicationsCount} шт.</p>
                        <Link href="/dashboard/applications">
                            <button className={btnGhost}>Посмотреть</button>
                        </Link>
                    </div>
                    <div className={glassCard}>
                        <div className="flex items-center gap-3 mb-1">
                            <MessageCircle className="h-5 w-5 text-emerald-400" />
                            <span className="font-semibold text-zinc-100">Telegram</span>
                        </div>
                        <p className="flex items-center gap-1.5 text-sm text-zinc-400 mb-4">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            Уведомления подключены
                        </p>
                        <Link href="/dashboard/settings">
                            <button className={btnGhost}>Управлять</button>
                        </Link>
                    </div>
                </div>
            )}

            {isEmployer && (
                <div className={glassCard}>
                    <p className="font-semibold text-zinc-100 mb-4">Быстрые действия</p>
                    <Link href="/jobs/new">
                        <button className={btnAmber}>
                            <Plus className="h-4 w-4" />
                            Создать вакансию
                        </button>
                    </Link>
                </div>
            )}

            <DashboardVisual />
        </div>
    );
}
