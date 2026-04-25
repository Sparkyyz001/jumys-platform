import { createSSRClient } from "@/lib/supabase/server";
import { JobCard } from "@/components/JobCard";
import { ProjectShowcase, type ProjectShowcaseItem } from "@/components/ui/project-showcase";
import { LandingNav } from "@/components/LandingNav";
import { LandingHero } from "@/components/LandingHero";
import {
    LandingFeatures,
    LandingFinalCTA,
    FreshJobsHeading,
    AllJobsButton,
} from "@/components/LandingSections";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-env";

const ROADMAP_ITEMS: ProjectShowcaseItem[] = [
    {
        title: "AI-подбор вакансий",
        description: "Embedding-модель ранжирует вакансии под ваш профиль и навыки — без ручного поиска.",
        badge: "01",
        link: "/jobs",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    },
    {
        title: "Telegram-бот для откликов",
        description: "Уведомления о новых вакансиях и отклики в один клик прямо в Telegram.",
        badge: "02",
        link: "/auth/register",
        image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?q=80&w=1200&auto=format&fit=crop",
    },
    {
        title: "Только Актау",
        description: "Фильтры по микрорайонам Актау: 1, 3А, 4А, Приморский, Koktem и другие.",
        badge: "03",
        link: "/jobs",
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1200&auto=format&fit=crop",
    },
    {
        title: "Проверенные компании",
        description: "Верификация работодателей по BIN/IIN и значок Verified Business в карточке вакансии.",
        badge: "04",
        link: "/auth/register",
        image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1200&auto=format&fit=crop",
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
            applicationsLastWeek = appsCountRes.count ?? 0;
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
        <div className="dark min-h-screen bg-gradient-to-br from-[#060818] via-[#0a0d20] to-[#0d1023] text-white">
            <LandingNav signedIn={signedIn} />

            <LandingHero signedIn={signedIn} />

            <section className="py-10 px-4">
                <div className="max-w-5xl mx-auto">
                    <ProjectShowcase items={ROADMAP_ITEMS} heading="Как Jumys работает" />
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

            <footer className="py-10 text-sm text-gray-500 border-t border-white/10 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-4 grid gap-6 md:grid-cols-3">
                    <div>
                        <p className="font-semibold text-white">Jumys Platform</p>
                        <p className="mt-2">© {new Date().getFullYear()} AI-поиск работы в Актау</p>
                    </div>
                    <div>
                        <p className="font-semibold text-white">Our Team</p>
                        <p className="mt-2">Product Lead - Hackathon Strategy</p>
                        <p>Full-stack Dev - Platform &amp; AI Matching</p>
                        <p>UX Engineer - Mobile-first Interface</p>
                    </div>
                    <div>
                        <p className="font-semibold text-white">Support Contacts</p>
                        <a
                            href="https://t.me/jumys_support"
                            target="_blank"
                            rel="noreferrer"
                            className="block mt-2 text-blue-400 hover:underline"
                        >
                            Telegram: @jumys_support
                        </a>
                        <a
                            href="https://wa.me/"
                            target="_blank"
                            rel="noreferrer"
                            className="block text-emerald-400 hover:underline"
                        >
                            WhatsApp Support
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
