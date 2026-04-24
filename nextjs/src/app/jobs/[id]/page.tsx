import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Building2, Clock, Calendar, Briefcase, ShieldCheck } from "lucide-react";
import { createSSRClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    formatSalary, labelForEmployment, labelForExperience
} from "@/lib/constants";
import { ApplyDialog } from "./apply-dialog";

export default async function JobDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createSSRClient();

    const { data: job } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    const jobRow = job as {
        id: string;
        employer_id: string | null;
        title: string;
        is_active: boolean;
        salary_from: number | null;
        salary_to: number | null;
        district: string | null;
        employment: "full" | "part" | "gig" | null;
        experience_required: "none" | "junior" | "middle" | "senior";
        category: string | null;
        description: string;
        skills_required: string[];
        created_at: string;
    } | null;
    if (!jobRow) notFound();

    const [{ data: user }, companyLookup] = await Promise.all([
        supabase.auth.getUser(),
        jobRow.employer_id
            ? supabase.from("employer_profiles").select("company_name, company_type").eq("profile_id", jobRow.employer_id).maybeSingle()
            : Promise.resolve({ data: null }),
    ]);

    const userId = user.user?.id ?? null;
    let role: "employer" | "seeker" | null = null;
    let alreadyApplied = false;
    if (userId) {
        const { data: prof } = await supabase
            .from("profiles").select("role").eq("id", userId).maybeSingle();
        const profileRow = prof as { role: "employer" | "seeker" } | null;
        role = profileRow?.role ?? null;

        if (role === "seeker") {
            const { data: existing } = await supabase
                .from("applications")
                .select("id")
                .eq("job_id", id)
                .eq("seeker_id", userId)
                .maybeSingle();
            alreadyApplied = Boolean(existing as { id: string } | null);
        }
    }

    const company = companyLookup.data as { company_name: string; company_type: string | null } | null;
    const isOwner = userId === jobRow.employer_id;
    const isVerifiedCompany = /BIN\/IIN:\d{12}/i.test(company?.company_type ?? "");
    const whatsappText = encodeURIComponent(`Здравствуйте! Интересует вакансия "${jobRow.title}" на Jumys.`);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-4">
                <Link href="/jobs" className="text-sm text-primary-700 hover:underline">
                    ← Все вакансии
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-2xl">{jobRow.title}</CardTitle>
                            {company && (
                                <p className="text-gray-700 flex items-center gap-1.5 mt-2">
                                    <Building2 className="h-4 w-4" />
                                    {company.company_name}
                                    {isVerifiedCompany && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                            <ShieldCheck className="h-3 w-3" />
                                            Verified Business
                                        </span>
                                    )}
                                    {company.company_type && ` · ${company.company_type}`}
                                </p>
                            )}
                        </div>
                        {!jobRow.is_active && (
                            <Badge variant="destructive">В архиве</Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="text-2xl font-bold">
                        {formatSalary(jobRow.salary_from, jobRow.salary_to)}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {jobRow.district && (
                            <Badge variant="secondary" className="gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {jobRow.district} мкр.
                            </Badge>
                        )}
                        {jobRow.employment && (
                            <Badge variant="secondary" className="gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {labelForEmployment(jobRow.employment)}
                            </Badge>
                        )}
                        <Badge variant="secondary" className="gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {labelForExperience(jobRow.experience_required)}
                        </Badge>
                        {jobRow.category && <Badge variant="outline">{jobRow.category}</Badge>}
                        <Badge variant="outline" className="gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(jobRow.created_at).toLocaleDateString("ru-RU")}
                        </Badge>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Описание</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{jobRow.description}</p>
                    </div>

                    {jobRow.skills_required.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2">Требуемые навыки</h3>
                            <div className="flex flex-wrap gap-2">
                                {jobRow.skills_required.map(s => (
                                    <Badge key={s} variant="secondary">{s}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t">
                        <div className="mb-4 flex flex-wrap gap-2">
                            <a
                                href={`https://wa.me/?text=${whatsappText}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Button variant="outline" size="sm">WhatsApp Contact</Button>
                            </a>
                            <a
                                href={`https://t.me/share/url?url=${encodeURIComponent(`https://jumys.kz/jobs/${id}`)}&text=${encodeURIComponent(`Интересует вакансия: ${jobRow.title}`)}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Button variant="outline" size="sm">Telegram</Button>
                            </a>
                            <a href="https://t.me/jumys_support" target="_blank" rel="noreferrer">
                                <Button variant="outline" size="sm">Support</Button>
                            </a>
                        </div>
                        {!userId ? (
                            <Link href={`/auth/login?next=/jobs/${id}`}>
                                <Button size="lg" className="w-full sm:w-auto">
                                    Войти и откликнуться
                                </Button>
                            </Link>
                        ) : isOwner ? (
                            <div className="flex gap-2">
                                <Link href={`/dashboard/jobs/${id}/candidates`}>
                                    <Button>Посмотреть кандидатов</Button>
                                </Link>
                                <Link href="/dashboard/jobs">
                                    <Button variant="outline">Все мои вакансии</Button>
                                </Link>
                            </div>
                        ) : role === "employer" ? (
                            <p className="text-sm text-gray-600">
                                Откликаться могут только соискатели
                            </p>
                        ) : alreadyApplied ? (
                            <div className="flex items-center gap-2">
                                <Badge variant="success">Вы уже откликнулись</Badge>
                                <Link href="/dashboard/applications">
                                    <Button variant="outline" size="sm">Мои отклики</Button>
                                </Link>
                            </div>
                        ) : (
                            <ApplyDialog jobId={id} jobTitle={jobRow.title} />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
