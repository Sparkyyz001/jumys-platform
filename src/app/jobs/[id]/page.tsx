import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Building2, Clock, Calendar, Briefcase, ShieldCheck, CircleCheck, MessageCircle, ChevronRight, Shield, TrendingUp, Heart, BookOpen, Users } from "lucide-react";
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

    // Similar jobs
    let similarQuery = supabase
        .from("jobs")
        .select("id, title, salary_from, salary_to, category, district, employer_id")
        .eq("is_active", true)
        .neq("id", id)
        .limit(3);
    if (jobRow.category) similarQuery = similarQuery.eq("category", jobRow.category);
    else if (jobRow.district) similarQuery = similarQuery.eq("district", jobRow.district);
    const { data: similarRaw } = await similarQuery;
    const similarJobs = (similarRaw ?? []) as Array<{
        id: string; title: string; salary_from: number | null;
        salary_to: number | null; category: string | null;
        district: string | null; employer_id: string | null;
    }>;

    // Fetch employer names for similar jobs
    const empIds = [...new Set(similarJobs.map(j => j.employer_id).filter(Boolean))] as string[];
    let empMap: Record<string, string> = {};
    if (empIds.length > 0) {
        const { data: emps } = await supabase
            .from("employer_profiles")
            .select("profile_id, company_name")
            .in("profile_id", empIds);
        (emps ?? []).forEach((e: { profile_id: string; company_name: string }) => {
            empMap[e.profile_id] = e.company_name;
        });
    }

    const isHot = (new Date().getTime() - new Date(jobRow.created_at).getTime()) < 1000 * 60 * 60 * 24 * 3;

    const glassCard = "rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-3xl";

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100">
            {/* Ambient bg */}
            <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: "radial-gradient(ellipse 60% 40% at 80% 10%, rgba(251,146,60,0.06), transparent 60%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(56,189,248,0.04), transparent 60%)" }} />

            {/* ── Sticky top bar ── */}
            <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        {company && <p className="text-xs text-zinc-500 truncate">{company.company_name}</p>}
                        <p className="text-sm font-semibold text-zinc-100 truncate">{jobRow.title}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="hidden sm:block text-right">
                            <p className="text-xs text-zinc-500">Предлагаемая зарплата</p>
                            <p className="text-sm font-bold text-amber-400">{formatSalary(jobRow.salary_from, jobRow.salary_to)}</p>
                        </div>
                        <a href="#apply">
                            <button className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all cursor-pointer">
                                Откликнуться сейчас
                            </button>
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back */}
                <Link href="/jobs" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-200 transition-colors">
                    ← Все вакансии
                </Link>

                {/* ── Hero ── */}
                <div className="mt-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {isHot && (
                            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400 uppercase tracking-wide">
                                Горячая вакансия
                            </span>
                        )}
                        {!jobRow.is_active && (
                            <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400">В архиве</span>
                        )}
                        {company && (
                            <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400">
                                <Building2 className="h-3.5 w-3.5" />
                                {company.company_name}
                                {isVerifiedCompany && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400">
                                        <ShieldCheck className="h-3 w-3" /> Verified
                                    </span>
                                )}
                            </span>
                        )}
                        <span className="text-zinc-600">•</span>
                        <span className="text-xs text-zinc-500">
                            Опубликовано {new Date(jobRow.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-100 leading-[1.1]">
                        {jobRow.title}
                    </h1>

                    {/* Big salary */}
                    <div className="mt-5">
                        <p className="text-4xl sm:text-5xl font-bold text-amber-400 leading-none">
                            {formatSalary(jobRow.salary_from, jobRow.salary_to)}
                        </p>
                        <p className="mt-1.5 text-sm text-zinc-500 uppercase tracking-wide">
                            {jobRow.employment ? labelForEmployment(jobRow.employment) : "Занятость"}
                            {jobRow.district ? ` • ${jobRow.district} мкр., Актау` : " • Актау"}
                        </p>
                    </div>

                    {/* Tags */}
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
                    </div>
                </div>

                {/* ── Two-column layout ── */}
                <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">

                    {/* LEFT */}
                    <div className="space-y-8 min-w-0">

                        {/* Description */}
                        <section className={`${glassCard} p-6 md:p-8`}>
                            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Описание роли</h2>
                            <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-sm">{jobRow.description}</p>
                        </section>

                        {/* Requirements / Skills */}
                        {jobRow.skills_required.length > 0 && (
                            <section className={`${glassCard} p-6 md:p-8`}>
                                <h2 className="text-lg font-semibold text-zinc-100 mb-5 flex items-center gap-2">
                                    <span className="inline-block size-1.5 rounded-full bg-amber-400" />
                                    Ключевые требования
                                </h2>
                                <ul className="space-y-3">
                                    {jobRow.skills_required.map(skill => (
                                        <li key={skill} className="flex items-start gap-3">
                                            <CircleCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                            <span className="text-sm text-zinc-300 leading-relaxed">{skill}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Perks */}
                        <section className={`${glassCard} p-6 md:p-8`}>
                            <h2 className="text-lg font-semibold text-zinc-100 mb-5 flex items-center gap-2">
                                <span className="inline-block size-1.5 rounded-full bg-amber-400" />
                                Преимущества работы
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: Shield, label: "Офиц. трудоустройство", color: "text-amber-400" },
                                    { icon: TrendingUp, label: "Карьерный рост", color: "text-emerald-400" },
                                    { icon: Heart, label: "Медицинская страховка", color: "text-rose-400" },
                                    { icon: Clock, label: "Гибкий график", color: "text-sky-400" },
                                    { icon: BookOpen, label: "Обучение и развитие", color: "text-violet-400" },
                                    { icon: Users, label: "Команда профессионалов", color: "text-amber-400" },
                                ].map(({ icon: Icon, label, color }) => (
                                    <div key={label} className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                                        <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                                        <span className="text-xs text-zinc-300 leading-tight">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Apply section */}
                        <section id="apply" className={`${glassCard} p-6 md:p-8`}>
                            <h2 className="text-lg font-semibold text-zinc-100 mb-2">Готовы откликнуться?</h2>
                            <p className="text-sm text-zinc-400 mb-6">Поделитесь кратким сообщением — работодатель увидит его первым.</p>

                            <div className="mb-4 flex flex-wrap gap-2">
                                <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noreferrer">
                                    <button className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] cursor-pointer">WhatsApp</button>
                                </a>
                                <a href={`https://t.me/share/url?url=${encodeURIComponent(`https://jumys.kz/jobs/${id}`)}&text=${encodeURIComponent(`Интересует вакансия: ${jobRow.title}`)}`} target="_blank" rel="noreferrer">
                                    <button className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] cursor-pointer">Telegram</button>
                                </a>
                                <a href="https://t.me/jumys_support" target="_blank" rel="noreferrer">
                                    <button className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] cursor-pointer">Поддержка</button>
                                </a>
                            </div>

                            {!userId ? (
                                <Link href={`/auth/login?next=/jobs/${id}`}>
                                    <button className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all cursor-pointer">
                                        Войти и откликнуться
                                    </button>
                                </Link>
                            ) : isOwner ? (
                                <div className="flex gap-2 flex-wrap">
                                    <Link href={`/dashboard/jobs/${id}/candidates`}>
                                        <button className="inline-flex items-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-orange-400 cursor-pointer">Посмотреть кандидатов</button>
                                    </Link>
                                    <Link href="/dashboard/jobs">
                                        <button className="inline-flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07] cursor-pointer">Все вакансии</button>
                                    </Link>
                                </div>
                            ) : role === "employer" ? (
                                <p className="text-sm text-zinc-500">Откликаться могут только соискатели</p>
                            ) : alreadyApplied ? (
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                                        <CircleCheck className="h-3.5 w-3.5" /> Вы уже откликнулись
                                    </span>
                                    <Link href="/dashboard/applications">
                                        <button className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] cursor-pointer">Мои отклики</button>
                                    </Link>
                                </div>
                            ) : (
                                <ApplyDialog jobId={id} jobTitle={jobRow.title} />
                            )}
                        </section>

                        {/* Similar jobs */}
                        {similarJobs.length > 0 && (
                            <section>
                                <div className="flex items-end justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-zinc-100">Похожие вакансии</h2>
                                        <p className="text-xs text-zinc-500 mt-0.5">Подобранные Jumys AI на основе ваших навыков</p>
                                    </div>
                                    <Link href="/jobs" className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
                                        Все вакансии <ChevronRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {similarJobs.map(sj => (
                                        <Link key={sj.id} href={`/jobs/${sj.id}`}>
                                            <div className={`${glassCard} p-4 hover:-translate-y-0.5 transition-transform duration-200 cursor-pointer h-full`}>
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    {sj.category && (
                                                        <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">{sj.category}</span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-semibold text-zinc-100 leading-snug mb-1">{sj.title}</p>
                                                {sj.employer_id && empMap[sj.employer_id] && (
                                                    <p className="text-xs text-zinc-500 mb-2">{empMap[sj.employer_id]}</p>
                                                )}
                                                <p className="text-xs font-semibold text-amber-400">{formatSalary(sj.salary_from, sj.salary_to)}</p>
                                                <p className="mt-3 text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-0.5">
                                                    Подробнее <ChevronRight className="h-3 w-3" />
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="space-y-4 lg:sticky lg:top-[72px] lg:self-start">

                        {/* Company card */}
                        {company && (
                            <div className={`${glassCard} p-5`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-12 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center shrink-0">
                                        <Building2 className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-zinc-100 text-sm truncate">{company.company_name}</p>
                                        {isVerifiedCompany && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                                                <ShieldCheck className="h-3 w-3" /> Verified Business
                                            </span>
                                        )}
                                        {company.company_type && !isVerifiedCompany && (
                                            <p className="text-xs text-zinc-500 truncate">{company.company_type}</p>
                                        )}
                                    </div>
                                </div>
                                <button className="w-full inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] cursor-pointer">
                                    О компании
                                </button>
                            </div>
                        )}

                        {/* Location / Map card */}
                        {jobRow.district && (
                            <div className={`${glassCard} overflow-hidden`}>
                                {/* Map placeholder */}
                                <div className="h-28 relative bg-zinc-900/60 overflow-hidden">
                                    <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <MapPin className="h-7 w-7 text-amber-400 mx-auto drop-shadow-lg" />
                                            <p className="mt-1 text-xs font-semibold text-zinc-200">{jobRow.district}-й микрорайон</p>
                                            <p className="text-[10px] text-zinc-500">Актау</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mb-1">Локация</p>
                                    <p className="text-sm text-zinc-200">{jobRow.district}-й микрорайон, Актау</p>
                                </div>
                            </div>
                        )}

                        {/* Telegram sync card */}
                        <div className={`${glassCard} p-4 flex items-start gap-3`}>
                            <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <MessageCircle className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-100">Синхронизация с Telegram</p>
                                <p className="text-xs text-zinc-500 mt-0.5">Получайте статус отклика мгновенно в наш бот.</p>
                            </div>
                        </div>

                        {/* Calendar */}
                        <div className={`${glassCard} p-4 flex items-center gap-3`}>
                            <Calendar className="h-4 w-4 text-zinc-500 shrink-0" />
                            <div>
                                <p className="text-xs text-zinc-500">Опубликовано</p>
                                <p className="text-sm text-zinc-300">{new Date(jobRow.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
