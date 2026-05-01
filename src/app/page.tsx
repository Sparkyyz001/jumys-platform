import { createSSRClient } from "@/lib/supabase/server";
import { JobCard } from "@/components/JobCard";
import { LandingFooter } from "@/components/LandingFooter";
import { CaseStudy } from "@/components/sections/CaseStudy";
import { LandingBlocks } from "@/components/sections/LandingBlocks";
import { CinematicHero } from "@/components/sections/CinematicHero";
import {
    LandingFinalCTA,
    FreshJobsHeading,
    AllJobsButton,
} from "@/components/LandingSections";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-env";

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
            const {
                data: { user: u },
            } = await supabase.auth.getUser();
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
                new Set(latestJobs.map(j => j.employer_id).filter((v): v is string => Boolean(v))),
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
        <main className="dark relative min-h-screen overflow-x-hidden bg-[#050505] text-white">
            <CinematicHero signedIn={signedIn} />

            <LandingBlocks
                signedIn={signedIn}
                activeJobsCount={activeJobsCount}
                seekersCount={seekersCount}
                applicationsLastWeek={applicationsLastWeek}
            />

            {latestJobs.length > 0 && (
                <section id="jobs" className="px-4 py-20">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
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

            <section id="about">
                <CaseStudy />
                <LandingFinalCTA />
            </section>
            <LandingFooter />
        </main>
    );
}
