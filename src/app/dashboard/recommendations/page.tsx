import Link from "next/link";
import { Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentFullProfile } from "@/lib/profile";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { createSSRClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";

export const metadata = { title: "Подборка вакансий — Jumys" };
export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
    const data = await getCurrentFullProfile();
    if (!data?.profile) redirect("/auth/login");
    if (data.profile.role !== "seeker") redirect("/dashboard");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createServerAdminClient() as any;
    const { data: matches, error } = await admin.rpc("match_jobs_for_seeker", {
        p_seeker_id: data.user.id,
        p_count: 20,
    });
    const slimMatches = (matches as Array<{ id: string; title: string; similarity: number }> | null) ?? [];

    const supabase = await createSSRClient();
    const jobIds = slimMatches.map((m) => m.id);
    const { data: jobs } = jobIds.length
        ? await supabase
            .from("jobs")
            .select("id, title, category, district, employment, salary_from, salary_to, employer_id")
            .in("id", jobIds)
        : { data: [] };
    const jobRows = (jobs ?? []) as Array<{
        id: string;
        title: string;
        category: string | null;
        district: string | null;
        employment: "full" | "part" | "gig" | null;
        salary_from: number | null;
        salary_to: number | null;
        employer_id: string | null;
    }>;

    const jobMap = new Map(jobRows.map((job) => [job.id, job]));
    const employerIds = Array.from(new Set(jobRows.map((j) => j.employer_id).filter(Boolean))) as string[];
    const companyMap = new Map<string, string>();
    const verifiedMap = new Map<string, boolean>();
    if (employerIds.length > 0) {
        const { data: emps } = await supabase
            .from("employer_profiles")
            .select("profile_id, company_name, company_type")
            .in("profile_id", employerIds);
        const employerRows = (emps ?? []) as Array<{ profile_id: string; company_name: string; company_type: string | null }>;
        employerRows.forEach((emp) => {
            companyMap.set(emp.profile_id, emp.company_name);
            verifiedMap.set(emp.profile_id, /BIN\/IIN:\d{12}/i.test(emp.company_type ?? ""));
        });
    }

    if (error) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Подборка для вас</h1>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-red-600">Ошибка: {error.message}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const hasEmbedding = Boolean(data.seeker?.embedding);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-zinc-100">
                    <Sparkles className="h-7 w-7 text-amber-400" />
                    Подборка для вас
                </h1>
                <p className="text-zinc-400 mt-1">
                    {hasEmbedding
                        ? "Вакансии отсортированы по соответствию вашему профилю"
                        : "Профиль обрабатывается — скоро появятся персональные рекомендации"}
                </p>
            </div>

            {slimMatches.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-lg font-medium">Пока нет подходящих вакансий</p>
                        <p className="text-sm text-zinc-500 mt-1">
                            Попробуйте зайти позже — мы добавляем новые каждый день
                        </p>
                        <Link href="/jobs" className="inline-block mt-4">
                            <Button>Посмотреть все вакансии</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {slimMatches.map((match) => {
                        const job = jobMap.get(match.id);
                        if (!job) return null;
                        return (
                            <JobCard
                                key={match.id}
                                id={match.id}
                                title={job.title}
                                company={job.employer_id ? companyMap.get(job.employer_id) ?? null : null}
                                district={job.district}
                                category={job.category}
                                employment={job.employment}
                                salary_from={job.salary_from}
                                salary_to={job.salary_to}
                                similarity={match.similarity}
                                verified={job.employer_id ? verifiedMap.get(job.employer_id) ?? false : false}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
