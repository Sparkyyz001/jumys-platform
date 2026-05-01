import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Building2, Clock, Calendar, Briefcase, ShieldCheck } from "lucide-react";
import { createSSRClient } from "@/lib/supabase/server";
import {
    formatSalary, labelForEmployment, labelForExperience
} from "@/lib/constants";
import { ApplyDialog } from "./apply-dialog";

export const dynamic = "force-dynamic";

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
                <Link href="/jobs" className="inline-flex items-center text-sm text-zinc-400 transition-colors hover:text-white">
                    ← Все вакансии
                </Link>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-3xl overflow-hidden">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-white/[0.07]">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{jobRow.title}</h1>
                            {company && (
                                <p className="text-zinc-400 flex items-center gap-1.5 mt-2 text-sm">
                                    <Building2 className="h-4 w-4 shrink-0" />
                                    {company.company_name}
                                    {isVerifiedCompany && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                            <ShieldCheck className="h-3 w-3" />
                                            Verified
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>
                        {!jobRow.is_active && (
                            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">В архиве</span>
                        )}
                    </div>

                    <div className="mt-4 text-2xl font-bold text-zinc-100">
                        {formatSalary(jobRow.salary_from, jobRow.salary_to)}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {jobRow.district && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300">
                                <MapPin className="h-3.5 w-3.5 text-amber-400" />{jobRow.district} мкр.
                            </span>
                        )}
                        {jobRow.employment && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300">
                                <Clock className="h-3.5 w-3.5 text-amber-400" />{labelForEmployment(jobRow.employment)}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300">
                            <Briefcase className="h-3.5 w-3.5 text-amber-400" />{labelForExperience(jobRow.experience_required)}
                        </span>
                        {jobRow.category && (
                            <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300">
                                {jobRow.category}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-400">
                            <Calendar className="h-3.5 w-3.5" />{new Date(jobRow.created_at).toLocaleDateString("ru-RU")}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-3">Описание</h3>
                        <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-sm">{jobRow.description}</p>
                    </div>

                    {jobRow.skills_required.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-3">Навыки</h3>
                            <div className="flex flex-wrap gap-2">
                                {jobRow.skills_required.map(s => (
                                    <span key={s} className="rounded-lg border border-amber-400/20 bg-amber-400/[0.07] px-2.5 py-1 text-xs text-amber-300">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/[0.07]">
                        <div className="mb-4 flex flex-wrap gap-2">
                            <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noreferrer">
                                <button className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.07]">WhatsApp</button>
                            </a>
                            <a href={`https://t.me/share/url?url=${encodeURIComponent(`https://jumys.kz/jobs/${id}`)}&text=${encodeURIComponent(`Интересует вакансия: ${jobRow.title}`)}`} target="_blank" rel="noreferrer">
                                <button className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.07]">Telegram</button>
                            </a>
                            <a href="https://t.me/jumys_support" target="_blank" rel="noreferrer">
                                <button className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.07]">Support</button>
                            </a>
                        </div>

                        {!userId ? (
                            <Link href={`/auth/login?next=/jobs/${id}`}>
                                <button className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all">
                                    Войти и откликнуться
                                </button>
                            </Link>
                        ) : isOwner ? (
                            <div className="flex gap-2 flex-wrap">
                                <Link href={`/dashboard/jobs/${id}/candidates`}>
                                    <button className="inline-flex items-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-orange-400">Посмотреть кандидатов</button>
                                </Link>
                                <Link href="/dashboard/jobs">
                                    <button className="inline-flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07]">Все вакансии</button>
                                </Link>
                            </div>
                        ) : role === "employer" ? (
                            <p className="text-sm text-zinc-500">Откликаться могут только соискатели</p>
                        ) : alreadyApplied ? (
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">Вы уже откликнулись</span>
                                <Link href="/dashboard/applications">
                                    <button className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.07]">Мои отклики</button>
                                </Link>
                            </div>
                        ) : (
                            <ApplyDialog jobId={id} jobTitle={jobRow.title} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
