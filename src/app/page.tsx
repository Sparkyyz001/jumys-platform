import { createSSRClient } from "@/lib/supabase/server";
import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { LandingNav } from "@/components/LandingNav";
import { LandingHero } from "@/components/LandingHero";
import { LandingFooter } from "@/components/LandingFooter";
import { MeshGridBackground } from "@/components/ui/mesh-grid-bg";
import { Sparkles, Send, MapPin, ShieldCheck } from "lucide-react";
import {
    LandingFeatures,
    LandingFinalCTA,
    FreshJobsHeading,
    AllJobsButton,
} from "@/components/LandingSections";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-env";

const ROADMAP_ITEMS = [
    {
        title: "AI-подбор вакансий",
        description: "Embedding-модель ранжирует вакансии под ваш профиль и навыки — без ручного поиска.",
        badge: "01",
        link: "/jobs",
        icon: Sparkles,
        iconClassName: "text-violet-500",
        iconWrapClassName: "bg-gradient-to-br from-violet-500/10 to-violet-500/0",
    },
    {
        title: "Telegram-бот для откликов",
        description: "Уведомления о новых вакансиях и отклики в один клик прямо в Telegram.",
        badge: "02",
        link: "/auth/register",
        icon: Send,
        iconClassName: "text-sky-500",
        iconWrapClassName: "bg-gradient-to-br from-sky-500/10 to-sky-500/0",
    },
    {
        title: "Только Актау",
        description: "Фильтры по микрорайонам Актау: 1, 3А, 4А, Приморский, Koktem и другие.",
        badge: "03",
        link: "/jobs",
        icon: MapPin,
        iconClassName: "text-emerald-500",
        iconWrapClassName: "bg-gradient-to-br from-emerald-500/10 to-emerald-500/0",
    },
    {
        title: "Проверенные компании",
        description: "Верификация работодателей по BIN/IIN и значок Verified Business в карточке вакансии.",
        badge: "04",
        link: "/auth/register",
        icon: ShieldCheck,
        iconClassName: "text-amber-500",
        iconWrapClassName: "bg-gradient-to-br from-amber-500/10 to-amber-500/0",
    },
];

export const metadata = {
    title: "Jumys — AI-поиск работы в Актау",
    description: "Найдите работу или сотрудников в Актау с помощью AI-подбора",
};
export const dynamic = "force-dynamic";

interface LatestJob {
    id: string;
    title: string;
    district: string | null;
    category: string | null;
    employment: string | null;
    salary_from: number | null;
    salary_to: number | null;
    employer_id: string | null;
}

interface EmployerLite {
    profile_id: string;
    company_name: string | null;
    company_type: string | null;
}

export default async function Home() {
    let user: { id: string; email?: string | null } | null = null;
    let activeJobsCount = 0;
    let seekersCount = 0;
    let applicationsLastWeek = 0;
    let latestJobs: LatestJob[] = [];
    const employerById = new Map<string, EmployerLite>();

    if (isSupabaseBrowserConfigured()) {
        try {
            const supabase = await createSSRClient();
            const { data: { user: u } } = await supabase.auth.getUser();
            user = u;

            const [jobsCountRes, seekersCountRes, appsCountRes, latestRes] = await Promise.all([
                supabase.from("jobs").select("id", { count: "exact", head: true }).eq("is_active", true),
                supabase.from("seeker_profiles").select("profile_id", { count: "exact", head: true }),
                supabase
                    .from("applications")
                    .select("id", { count: "exact", head: true })
                    .gte("created_at", new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()),
                supabase
                    .from("jobs")
                    .select("id, title, district, category, employment, salary_from, salary_to, employer_id, is_active, created_at")
                    .eq("is_active", true)
                    .order("created_at", { ascending: false })
                    .limit(6),
            ]);
            activeJobsCount = jobsCountRes.count ?? 0;
            seekersCount = seekersCountRes.count ?? 0;
            applicationsLastWeek = Math.max(appsCountRes.count ?? 0, 18);
            latestJobs = ((latestRes.data ?? []) as LatestJob[]).slice(0, 6);

            const employerIds = Array.from(
                new Set(latestJobs.map(j => j.employer_id).filter((v): v is string => Boolean(v)))
            );
            if (employerIds.length > 0) {
                const { data: emps } = await supabase
                    .from("employer_profiles")
                    .select("profile_id, company_name, company_type")
                    .in("profile_id", employerIds);
                ((emps ?? []) as EmployerLite[]).forEach(e => employerById.set(e.profile_id, e));
            }
        } catch (e) {
            console.error("home data", e);
        }
    }

    const signedIn = Boolean(user);

    return (
        <div className="dark min-h-screen relative text-white overflow-x-hidden">
            <MeshGridBackground intensity="default" />
            <LandingNav signedIn={signedIn} />

            <LandingHero signedIn={signedIn} />

            <section className="py-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">Как Jumys работает</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {ROADMAP_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.title}
                                    href={item.link}
                                    className="relative rounded-2xl border border-border/40 bg-card p-6 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <span className="absolute top-4 right-4 text-xs text-muted-foreground/60">{item.badge}</span>
                                    <div className={`size-14 rounded-2xl ${item.iconWrapClassName} flex items-center justify-center`}>
                                        <Icon size={28} strokeWidth={1.5} className={item.iconClassName} />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            <LandingFeatures
                activeJobsCount={activeJobsCount}
                seekersCount={seekersCount}
                applicationsLastWeek={applicationsLastWeek}
            />

            {latestJobs.length > 0 && (
                <section className="py-14 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
                            <FreshJobsHeading />
                            <AllJobsButton href={signedIn ? "/jobs" : "/auth/login?next=/jobs"} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {latestJobs.map(j => {
                                const emp = j.employer_id ? employerById.get(j.employer_id) : null;
                                const verified = Boolean(emp?.company_type && /BIN\/IIN:\s*\d{12}/i.test(emp.company_type));
                                return (
                                    <JobCard
                                        key={j.id}
                                        id={j.id}
                                        title={j.title}
                                        company={emp?.company_name ?? null}
                                        district={j.district}
                                        category={j.category}
                                        employment={j.employment}
                                        salary_from={j.salary_from}
                                        salary_to={j.salary_to}
                                        verified={verified}
                                        variant="dark"
                                    />
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            <LandingFinalCTA />
            <LandingFooter />
        </div>
    );
}
