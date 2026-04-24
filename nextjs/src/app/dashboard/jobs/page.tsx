import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Briefcase, Users, Eye } from "lucide-react";
import { getCurrentFullProfile } from "@/lib/profile";
import { createSSRClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatSalary, labelForEmployment } from "@/lib/constants";
import { JobActions } from "./actions";

export const metadata = { title: "Мои вакансии — Jumys" };
export const dynamic = "force-dynamic";

export default async function EmployerJobsPage() {
    const data = await getCurrentFullProfile();
    if (!data?.profile) redirect("/auth/login");
    if (data.profile.role !== "employer") redirect("/dashboard");

    const supabase = await createSSRClient();
    const { data: jobs } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", data.user.id)
        .order("created_at", { ascending: false });
    const jobRows = (jobs ?? []) as Array<{
        id: string;
        title: string;
        is_active: boolean;
        salary_from: number | null;
        salary_to: number | null;
        district: string | null;
        employment: "full" | "part" | "gig" | null;
        created_at: string;
    }>;

    const applicationsCountByJob = new Map<string, { total: number; new: number }>();
    if (jobRows.length > 0) {
        const jobIds = jobRows.map(j => j.id);
        const { data: apps } = await supabase
            .from("applications")
            .select("job_id, status")
            .in("job_id", jobIds);
        const appRows = (apps ?? []) as Array<{ job_id: string; status: "new" | "viewed" | "contacted" | "rejected" }>;
        appRows.forEach(a => {
            const cur = applicationsCountByJob.get(a.job_id) ?? { total: 0, new: 0 };
            cur.total += 1;
            if (a.status === "new") cur.new += 1;
            applicationsCountByJob.set(a.job_id, cur);
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h1 className="text-3xl font-bold">Мои вакансии</h1>
                    <p className="text-gray-600 mt-1">Всего: {jobRows.length}</p>
                </div>
                <Link href="/jobs/new">
                    <Button>
                        <Plus className="h-4 w-4" />
                        Новая вакансия
                    </Button>
                </Link>
            </div>

            {jobRows.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-lg font-medium">Пока нет вакансий</p>
                        <p className="text-sm text-gray-500 mt-1 mb-4">
                            Создайте первую — мы автоматически подберём кандидатов
                        </p>
                        <Link href="/jobs/new">
                            <Button>
                                <Plus className="h-4 w-4" />
                                Создать вакансию
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {jobRows.map(j => {
                        const counts = applicationsCountByJob.get(j.id) ?? { total: 0, new: 0 };
                        return (
                            <Card key={j.id}>
                                <CardContent className="p-4 flex flex-col md:flex-row gap-4 md:items-center">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-2 flex-wrap">
                                            <Link
                                                href={`/jobs/${j.id}`}
                                                className="font-semibold text-lg hover:text-primary-700"
                                            >
                                                {j.title}
                                            </Link>
                                            {!j.is_active && <Badge variant="destructive">В архиве</Badge>}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {formatSalary(j.salary_from, j.salary_to)}
                                            {j.district && ` · ${j.district} мкр.`}
                                            {j.employment && ` · ${labelForEmployment(j.employment)}`}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Создано: {new Date(j.created_at).toLocaleDateString("ru-RU")}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="secondary" className="gap-1">
                                            <Users className="h-3 w-3" />
                                            {counts.total} откликов
                                        </Badge>
                                        {counts.new > 0 && (
                                            <Badge variant="warning">
                                                {counts.new} новых
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Link href={`/dashboard/jobs/${j.id}/candidates`}>
                                            <Button variant="outline" size="sm">
                                                <Users className="h-4 w-4" />
                                                Кандидаты
                                            </Button>
                                        </Link>
                                        <Link href={`/jobs/${j.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                                Открыть
                                            </Button>
                                        </Link>
                                        <JobActions jobId={j.id} isActive={j.is_active} />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
