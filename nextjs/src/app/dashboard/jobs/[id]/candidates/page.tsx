import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { MapPin, Briefcase, Phone, Users } from "lucide-react";
import { getCurrentFullProfile } from "@/lib/profile";
import { createSSRClient } from "@/lib/supabase/server";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchScoreBadge } from "@/components/MatchScoreBadge";
import { ExplainMatchButton } from "@/components/ExplainMatchButton";
import { labelForEmployment } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function CandidatesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: jobId } = await params;
    const data = await getCurrentFullProfile();
    if (!data?.profile) redirect("/auth/login");
    if (data.profile.role !== "employer") redirect("/dashboard");

    const supabase = await createSSRClient();
    const { data: job } = await supabase
        .from("jobs")
        .select("id, title, employer_id")
        .eq("id", jobId)
        .maybeSingle();
    const jobRow = job as { id: string; title: string; employer_id: string | null } | null;
    if (!jobRow) notFound();
    if (jobRow.employer_id !== data.user.id) {
        redirect("/dashboard/jobs");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createServerAdminClient() as any;
    const { data: candidates, error } = await admin.rpc("match_seekers_for_job", {
        p_job_id: jobId,
        p_count: 20,
    });
    const candidateRows = (candidates ?? []) as Array<{
        profile_id: string;
        full_name: string | null;
        phone: string | null;
        district: string | null;
        about: string | null;
        skills: string[];
        experience_years: number;
        desired_employment: "full" | "part" | "gig" | null;
        similarity: number;
    }>;

    return (
        <div className="space-y-6">
            <div>
                <Link href="/dashboard/jobs" className="text-sm text-primary-700 hover:underline">
                    ← Мои вакансии
                </Link>
                <h1 className="text-3xl font-bold mt-2">Кандидаты</h1>
                <p className="text-gray-600 mt-1">Вакансия: <span className="font-medium">{jobRow.title}</span></p>
            </div>

            {error ? (
                <Card>
                    <CardContent className="p-6">
                        <p className="text-red-600">Ошибка: {error.message}</p>
                    </CardContent>
                </Card>
            ) : candidateRows.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-lg font-medium">Пока нет кандидатов</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Как только в базе появятся подходящие соискатели — они появятся здесь
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {candidateRows.map(c => (
                        <Card key={c.profile_id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold text-lg leading-tight">
                                        {c.full_name ?? "Без имени"}
                                    </h3>
                                    <MatchScoreBadge score={c.similarity} />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {c.district && (
                                        <Badge variant="secondary" className="gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {c.district} мкр.
                                        </Badge>
                                    )}
                                    {c.experience_years > 0 && (
                                        <Badge variant="secondary" className="gap-1">
                                            <Briefcase className="h-3 w-3" />
                                            {c.experience_years} лет опыта
                                        </Badge>
                                    )}
                                    {c.desired_employment && (
                                        <Badge variant="outline">
                                            {labelForEmployment(c.desired_employment)}
                                        </Badge>
                                    )}
                                </div>

                                {c.about && (
                                    <p className="text-sm text-gray-700 line-clamp-3">{c.about}</p>
                                )}

                                {c.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {c.skills.slice(0, 6).map(s => (
                                            <Badge key={s} variant="secondary" className="text-xs">
                                                {s}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <ExplainMatchButton
                                    jobId={jobId}
                                    seekerId={c.profile_id}
                                    similarity={c.similarity}
                                    label="Почему этот кандидат?"
                                />

                                {c.phone && (
                                    <div className="flex items-center gap-2 pt-2 border-t">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <a
                                            href={`tel:${c.phone}`}
                                            className="text-sm font-medium hover:underline"
                                        >
                                            {c.phone}
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
