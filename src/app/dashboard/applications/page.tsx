import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { getCurrentFullProfile } from "@/lib/profile";
import { createSSRClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchScoreBadge } from "@/components/MatchScoreBadge";
import { APPLICATION_STATUSES, labelForStatus } from "@/lib/constants";
import { ApplicationStatusControl } from "./status-control";
import { ContactDialog } from "./contact-dialog";
import type { ApplicationStatus } from "@/lib/types";

export const metadata = { title: "Отклики — Jumys" };
export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
    const data = await getCurrentFullProfile();
    if (!data?.profile) redirect("/auth/login");

    const supabase = await createSSRClient();

    if (data.profile.role === "employer") {
        const { data: myJobs } = await supabase
            .from("jobs")
            .select("id, title")
            .eq("employer_id", data.user.id);
        const jobRows = (myJobs ?? []) as Array<{ id: string; title: string }>;
        const jobTitleById = new Map(jobRows.map(j => [j.id, j.title]));

        const jobIds = Array.from(jobTitleById.keys());
        let applications: Array<{
            id: string;
            job_id: string;
            seeker_id: string;
            message: string | null;
            status: ApplicationStatus;
            match_score: number | null;
            created_at: string;
        }> = [];
        if (jobIds.length > 0) {
            const { data: apps } = await supabase
                .from("applications")
                .select("*")
                .in("job_id", jobIds)
                .order("created_at", { ascending: false });
            applications = (apps ?? []) as typeof applications;
        }

        const seekerIds = Array.from(new Set(applications.map(a => a.seeker_id)));
        const seekerById = new Map<string, { full_name: string | null; phone: string | null }>();
        if (seekerIds.length > 0) {
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name, phone")
                .in("id", seekerIds);
            const profileRows = (profiles ?? []) as Array<{ id: string; full_name: string | null; phone: string | null }>;
            profileRows.forEach(p => seekerById.set(p.id, { full_name: p.full_name, phone: p.phone }));
        }

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Отклики</h1>
                    <p className="text-zinc-400 mt-1">Всего: {applications.length}</p>
                </div>

                {applications.length === 0 ? (
                    <EmptyState
                        title="Пока нет откликов"
                        description="Как только соискатели откликнутся на ваши вакансии — они появятся здесь"
                    />
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <div className="md:hidden divide-y divide-border">
                                {applications.map(a => {
                                    const seeker = seekerById.get(a.seeker_id);
                                    return (
                                        <div key={`mobile-${a.id}`} className="p-4 space-y-2">
                                            <div className="font-medium">{seeker?.full_name ?? "Без имени"}</div>
                                            <Link href={`/jobs/${a.job_id}`} className="text-sm text-amber-400 hover:underline">
                                                {jobTitleById.get(a.job_id) ?? "—"}
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                {typeof a.match_score === "number" ? <MatchScoreBadge score={Number(a.match_score)} /> : <span className="text-zinc-500">—</span>}
                                                <span className="text-xs text-zinc-400">{new Date(a.created_at).toLocaleDateString("ru-RU")}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ApplicationStatusControl applicationId={a.id} status={a.status} />
                                                {seeker?.phone ? (
                                                    <ContactDialog
                                                        applicationId={a.id}
                                                        name={seeker.full_name ?? "Кандидат"}
                                                        phone={seeker.phone}
                                                        currentStatus={a.status}
                                                    />
                                                ) : (
                                                    <span className="text-xs text-zinc-500">Нет телефона</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                <thead className="border-b border-border bg-white/[0.03] text-muted-foreground">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium">Кандидат</th>
                                        <th className="text-left px-4 py-3 font-medium">Вакансия</th>
                                        <th className="text-left px-4 py-3 font-medium">Матч</th>
                                        <th className="text-left px-4 py-3 font-medium">Дата</th>
                                        <th className="text-left px-4 py-3 font-medium">Статус</th>
                                        <th className="text-right px-4 py-3 font-medium">Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map(a => {
                                        const seeker = seekerById.get(a.seeker_id);
                                        return (
                                            <tr key={a.id} className="border-b border-border hover:bg-muted/30">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">
                                                        {seeker?.full_name ?? "Без имени"}
                                                    </div>
                                                    {a.message && (
                                                        <div className="text-xs text-zinc-500 mt-0.5 max-w-xs truncate">
                                                            {a.message}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/jobs/${a.job_id}`}
                                                        className="text-amber-400 hover:underline"
                                                    >
                                                        {jobTitleById.get(a.job_id) ?? "—"}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {typeof a.match_score === "number" ? (
                                                        <MatchScoreBadge score={Number(a.match_score)} />
                                                    ) : (
                                                        <span className="text-zinc-500">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-zinc-400">
                                                    {new Date(a.created_at).toLocaleDateString("ru-RU")}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <ApplicationStatusControl
                                                        applicationId={a.id}
                                                        status={a.status}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {seeker?.phone ? (
                                                        <ContactDialog
                                                            applicationId={a.id}
                                                            name={seeker.full_name ?? "Кандидат"}
                                                            phone={seeker.phone}
                                                            currentStatus={a.status}
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-zinc-500">Нет телефона</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    // Seeker view
    const { data: apps } = await supabase
        .from("applications")
        .select("*")
        .eq("seeker_id", data.user.id)
        .order("created_at", { ascending: false });

    const applications = (apps ?? []) as Array<{
        id: string;
        job_id: string;
        message: string | null;
        status: ApplicationStatus;
        match_score: number | null;
        created_at: string;
    }>;

    const jobIds = Array.from(new Set(applications.map(a => a.job_id)));
    const jobInfoById = new Map<string, { title: string; district: string | null; employer_id: string | null }>();
    if (jobIds.length > 0) {
        const { data: jobs } = await supabase
            .from("jobs")
            .select("id, title, district, employer_id")
            .in("id", jobIds);
        const jobRows = (jobs ?? []) as Array<{ id: string; title: string; district: string | null; employer_id: string | null }>;
        jobRows.forEach(j => jobInfoById.set(j.id, j));
    }

    const employerIds = Array.from(new Set(Array.from(jobInfoById.values()).map(j => j.employer_id).filter(Boolean))) as string[];
    const companyById = new Map<string, string>();
    if (employerIds.length > 0) {
        const { data: emps } = await supabase
            .from("employer_profiles")
            .select("profile_id, company_name")
            .in("profile_id", employerIds);
        const employerRows = (emps ?? []) as Array<{ profile_id: string; company_name: string }>;
        employerRows.forEach(e => companyById.set(e.profile_id, e.company_name));
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Мои отклики</h1>
                <p className="text-zinc-400 mt-1">Всего: {applications.length}</p>
            </div>

            {applications.length === 0 ? (
                <EmptyState
                    title="Вы ещё не откликались"
                    description="Посмотрите подборку и откликнитесь на подходящие вакансии"
                    ctaHref="/dashboard/recommendations"
                    ctaLabel="Посмотреть подборку"
                />
            ) : (
                <div className="space-y-3">
                    {applications.map(a => {
                        const job = jobInfoById.get(a.job_id);
                        const company = job?.employer_id ? companyById.get(job.employer_id) : null;
                        const statusMeta = APPLICATION_STATUSES.find(s => s.value === a.status);
                        return (
                            <Card key={a.id}>
                                <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/jobs/${a.job_id}`}
                                            className="font-semibold hover:text-amber-400"
                                        >
                                            {job?.title ?? "Вакансия удалена"}
                                        </Link>
                                        <p className="text-sm text-zinc-400">
                                            {company ?? "—"}
                                            {job?.district && ` · ${job.district} мкр.`}
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Откликнулись: {new Date(a.created_at).toLocaleDateString("ru-RU")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {typeof a.match_score === "number" && (
                                            <MatchScoreBadge score={Number(a.match_score)} />
                                        )}
                                        <Badge className={statusMeta?.color}>
                                            {labelForStatus(a.status)}
                                        </Badge>
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

function EmptyState({
    title, description, ctaHref, ctaLabel,
}: {
    title: string;
    description: string;
    ctaHref?: string;
    ctaLabel?: string;
}) {
    return (
        <Card>
            <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-lg font-medium">{title}</p>
                <p className="text-sm text-zinc-500 mt-1">{description}</p>
                {ctaHref && ctaLabel && (
                    <Link href={ctaHref} className="inline-block mt-4">
                        <Button>{ctaLabel}</Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
