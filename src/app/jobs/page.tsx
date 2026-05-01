import Link from "next/link";
import { redirect } from "next/navigation";
import { createSSRClient } from "@/lib/supabase/server";
import { JOB_CATEGORIES, EMPLOYMENT_TYPES } from "@/lib/constants";
import { JobCard } from "@/components/JobCard";
import { Briefcase, ChevronLeft, ChevronRight, Map as MapIcon } from "lucide-react";

export const metadata = { title: "Вакансии в Актау — Jumys" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

function sanitizeJobSearchQ(raw: string): string {
    return raw.replace(/\\/g, "").replace(/%/g, "").replace(/,/g, "").replace(/[()]/g, "").trim();
}

export default async function JobsListPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const params = await searchParams;
    const district = params.district;
    const category = params.category;
    const employment = params.employment;
    const q = sanitizeJobSearchQ((params.q ?? "").trim()).slice(0, 120);
    const minSalary = Number(params.minSalary ?? "0");
    const who = params.who;
    const age = params.age;
    const page = Math.max(1, Number(params.page ?? "1"));
    const districts = Array.from({ length: 39 }, (_, idx) => String(idx + 1));

    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/auth/login?next=${encodeURIComponent("/jobs")}`);

    let query = supabase
        .from("jobs")
        .select("id, title, category, district, employment, salary_from, salary_to, employer_id, created_at", { count: "exact" })
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (district) query = query.eq("district", district);
    if (category) query = query.eq("category", category);
    if (employment) query = query.eq("employment", employment as "full" | "part" | "gig");
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    if (Number.isFinite(minSalary) && minSalary > 0) query = query.gte("salary_from", minSalary);
    if (who === "student") query = query.in("employment", ["part", "gig"]);
    if (who === "noexp") query = query.eq("experience_required", "none");
    if (who === "professional") query = query.in("experience_required", ["middle", "senior"]);
    if (age === "16-29") query = query.in("experience_required", ["none", "junior"]);

    query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    const { data: jobs, count } = await query;
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

    const employerIds = Array.from(new Set(jobRows.map(j => j.employer_id).filter(Boolean))) as string[];
    const companyMap = new Map<string, string>();
    const verifiedMap = new Map<string, boolean>();
    if (employerIds.length > 0) {
        const { data: emps } = await supabase
            .from("employer_profiles")
            .select("profile_id, company_name, company_type")
            .in("profile_id", employerIds);
        const employerRows = (emps ?? []) as Array<{ profile_id: string; company_name: string; company_type: string | null }>;
        employerRows.forEach(e => {
            companyMap.set(e.profile_id, e.company_name);
            verifiedMap.set(e.profile_id, /BIN\/IIN:\d{12}/i.test(e.company_type ?? ""));
        });
    }

    const topRows = jobRows
        .filter((j) => (j.employer_id ? verifiedMap.get(j.employer_id) ?? false : false))
        .sort((a, b) => (b.salary_to ?? b.salary_from ?? 0) - (a.salary_to ?? a.salary_from ?? 0))
        .slice(0, 3);

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const hasActiveFilters = Boolean(district || category || employment || q || minSalary > 0 || who || age);

    const makeUrl = (overrides: Record<string, string | undefined>) => {
        const p = new URLSearchParams();
        const merged = { district, category, employment, who, age, q: q || undefined, minSalary: minSalary > 0 ? String(minSalary) : undefined, ...overrides };
        Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
        const qs = p.toString();
        return qs ? `/jobs?${qs}` : "/jobs";
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 lg:py-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                        Вакансии в Актау
                    </h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Найдено: <span className="font-medium text-zinc-200">{total}</span>
                    </p>
                </div>
                <Link
                    href="/jobs/map"
                    className="liquid-glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                    <MapIcon className="h-4 w-4" />
                    На карте
                </Link>
            </div>

            {topRows.length > 0 && (
                <div className="mb-8">
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        ТОП вакансии
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {topRows.map(j => (
                            <div key={`top-${j.id}`} className="liquid-glass rounded-2xl p-5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-amber-400/90">
                                    TOP
                                </p>
                                <p className="mt-2 line-clamp-2 font-semibold text-white">{j.title}</p>
                                <p className="mt-2 text-sm text-zinc-400">
                                    {j.employer_id ? companyMap.get(j.employer_id) ?? "Компания" : "Компания"}
                                </p>
                                <Link
                                    href={`/jobs/${j.id}`}
                                    className="mt-4 inline-flex text-sm font-medium text-white/90 underline-offset-4 hover:text-amber-300 hover:underline"
                                >
                                    Открыть →
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[minmax(0,300px)_1fr]">
                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <div className="liquid-glass rounded-2xl p-1">
                        <div className="rounded-[0.875rem] p-4 sm:p-5">
                            <form action="/jobs" className="space-y-5">
                                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                        Быстрый подбор
                                    </p>
                                    <p className="mt-2 text-sm leading-snug text-zinc-300">
                                        Фильтры и поиск по всем активным вакансиям
                                    </p>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                        Поиск по названию
                                    </h3>
                                    <input
                                        name="q"
                                        defaultValue={(params.q ?? "").trim()}
                                        placeholder="Например, Frontend-разработчик"
                                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus-visible:border-amber-500/40 focus-visible:ring-2 focus-visible:ring-amber-500/20"
                                    />
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                        Район (1–39 мкр)
                                    </h3>
                                    <select
                                        name="district"
                                        defaultValue={district ?? ""}
                                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus-visible:border-amber-500/40 focus-visible:ring-2 focus-visible:ring-amber-500/20 [&>option]:bg-zinc-900"
                                    >
                                        <option value="">Все районы</option>
                                        {districts.map(d => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                        Кто вы?
                                    </h3>
                                    <select
                                        name="who"
                                        defaultValue={who ?? ""}
                                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus-visible:border-amber-500/40 focus-visible:ring-2 focus-visible:ring-amber-500/20 [&>option]:bg-zinc-900"
                                    >
                                        <option value="">Любой формат</option>
                                        <option value="student">Student</option>
                                        <option value="professional">Professional</option>
                                        <option value="noexp">No Experience</option>
                                    </select>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                        Возраст
                                    </h3>
                                    <select
                                        name="age"
                                        defaultValue={age ?? ""}
                                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus-visible:border-amber-500/40 focus-visible:ring-2 focus-visible:ring-amber-500/20 [&>option]:bg-zinc-900"
                                    >
                                        <option value="">Любой</option>
                                        <option value="16-29">16–29 (youth)</option>
                                    </select>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                        Мин. зарплата ₸
                                    </h3>
                                    <input
                                        name="minSalary"
                                        defaultValue={minSalary > 0 ? String(minSalary) : ""}
                                        type="number"
                                        min={0}
                                        step={10000}
                                        placeholder="150000"
                                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus-visible:border-amber-500/40 focus-visible:ring-2 focus-visible:ring-amber-500/20"
                                    />
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                        Занятость
                                    </h3>
                                    <select
                                        name="employment"
                                        defaultValue={employment ?? ""}
                                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus-visible:border-amber-500/40 focus-visible:ring-2 focus-visible:ring-amber-500/20 [&>option]:bg-zinc-900"
                                    >
                                        <option value="">Любая</option>
                                        {EMPLOYMENT_TYPES.map(e => (
                                            <option key={e.value} value={e.value}>
                                                {e.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                        Категория
                                    </h3>
                                    <select
                                        name="category"
                                        defaultValue={category ?? ""}
                                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus-visible:border-amber-500/40 focus-visible:ring-2 focus-visible:ring-amber-500/20 [&>option]:bg-zinc-900"
                                    >
                                        <option value="">Все категории</option>
                                        {JOB_CATEGORIES.map(c => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <input type="hidden" name="page" value="1" />
                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
                                >
                                    Применить фильтры
                                </button>
                            </form>

                            {hasActiveFilters && (
                                <Link
                                    href="/jobs"
                                    className="mt-4 block border-t border-white/10 pt-4 text-center text-sm text-zinc-400 hover:text-white"
                                >
                                    Сбросить фильтры
                                </Link>
                            )}
                        </div>
                    </div>
                </aside>

                <div className="min-w-0">
                    {jobRows.length === 0 ? (
                        <div className="liquid-glass rounded-2xl p-12 text-center">
                            <Briefcase className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
                            <p className="text-lg font-medium text-white">Нет вакансий</p>
                            <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">
                                Попробуйте сбросить фильтры или зайти позже
                            </p>
                            {hasActiveFilters && (
                                <Link
                                    href="/jobs"
                                    className="mt-6 inline-flex rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white hover:bg-white/10"
                                >
                                    Показать все
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {jobRows.map(j => (
                                    <JobCard
                                        key={j.id}
                                        id={j.id}
                                        title={j.title}
                                        company={j.employer_id ? companyMap.get(j.employer_id) ?? null : null}
                                        district={j.district}
                                        category={j.category}
                                        employment={j.employment}
                                        salary_from={j.salary_from}
                                        salary_to={j.salary_to}
                                        verified={j.employer_id ? verifiedMap.get(j.employer_id) ?? false : false}
                                        variant="dark"
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (() => {
                                const delta = 2;
                                const start = Math.max(1, page - delta);
                                const end = Math.min(totalPages, page + delta);
                                const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
                                return (
                                    <div className="mt-10 flex items-center justify-center gap-1">
                                        {/* Prev */}
                                        {page > 1 ? (
                                            <Link
                                                href={makeUrl({ page: String(page - 1) })}
                                                className="flex h-9 w-9 items-center justify-center rounded-lg liquid-glass text-zinc-200 transition-colors hover:bg-white/10"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Link>
                                        ) : (
                                            <span className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 cursor-not-allowed">
                                                <ChevronLeft className="h-4 w-4" />
                                            </span>
                                        )}

                                        {/* First page + ellipsis */}
                                        {start > 1 && (
                                            <>
                                                <Link href={makeUrl({ page: "1" })} className="flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium liquid-glass text-zinc-200 hover:bg-white/10 transition-colors">1</Link>
                                                {start > 2 && <span className="flex h-9 items-center px-1 text-zinc-500 text-sm">…</span>}
                                            </>
                                        )}

                                        {/* Page window */}
                                        {pages.map(n => (
                                            <Link
                                                key={n}
                                                href={makeUrl({ page: String(n) })}
                                                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors ${
                                                    n === page
                                                        ? "bg-white text-black"
                                                        : "liquid-glass text-zinc-200 hover:bg-white/10"
                                                }`}
                                            >
                                                {n}
                                            </Link>
                                        ))}

                                        {/* Last page + ellipsis */}
                                        {end < totalPages && (
                                            <>
                                                {end < totalPages - 1 && <span className="flex h-9 items-center px-1 text-zinc-500 text-sm">…</span>}
                                                <Link href={makeUrl({ page: String(totalPages) })} className="flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium liquid-glass text-zinc-200 hover:bg-white/10 transition-colors">{totalPages}</Link>
                                            </>
                                        )}

                                        {/* Next */}
                                        {page < totalPages ? (
                                            <Link
                                                href={makeUrl({ page: String(page + 1) })}
                                                className="flex h-9 w-9 items-center justify-center rounded-lg liquid-glass text-zinc-200 transition-colors hover:bg-white/10"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        ) : (
                                            <span className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 cursor-not-allowed">
                                                <ChevronRight className="h-4 w-4" />
                                            </span>
                                        )}
                                    </div>
                                );
                            })()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
