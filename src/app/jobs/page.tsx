import Link from "next/link";
import { redirect } from "next/navigation";
import { createSSRClient } from "@/lib/supabase/server";
import { JOB_CATEGORIES, EMPLOYMENT_TYPES } from "@/lib/constants";
import { JobCard } from "@/components/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export const metadata = { title: "Вакансии в Актау — Jumys" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function JobsListPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const params = await searchParams;
    const district = params.district;
    const category = params.category;
    const employment = params.employment;
    const q = (params.q ?? "").trim();
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
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Вакансии в Актау</h1>
                <p className="text-gray-600 mt-1">Найдено: {total}</p>
            </div>

            {topRows.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3">ТОП вакансии</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {topRows.map((j) => (
                            <div key={`top-${j.id}`} className="rounded-xl border border-primary-200 bg-primary-50/60 p-4">
                                <p className="text-xs font-medium text-primary-700">TOP</p>
                                <p className="font-semibold mt-1 line-clamp-2">{j.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{j.employer_id ? companyMap.get(j.employer_id) ?? "Компания" : "Компания"}</p>
                                <Link href={`/jobs/${j.id}`} className="inline-block mt-3 text-sm text-primary-700 hover:underline">
                                    Открыть вакансию →
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                <aside>
                    <Card>
                        <CardContent className="p-4 space-y-5">
                            <form action="/jobs" className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-sm mb-2">Поиск по названию</h3>
                                    <input
                                        name="q"
                                        defaultValue={q}
                                        placeholder="Например, Frontend-разработчик"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-2">Район (1-39 мкр)</h3>
                                    <select
                                        name="district"
                                        defaultValue={district ?? ""}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                                    >
                                        <option value="">Все районы</option>
                                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-2">Кто вы?</h3>
                                    <select
                                        name="who"
                                        defaultValue={who ?? ""}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                                    >
                                        <option value="">Любой формат</option>
                                        <option value="student">Student</option>
                                        <option value="professional">Professional</option>
                                        <option value="noexp">No Experience</option>
                                    </select>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-2">Возраст</h3>
                                    <select
                                        name="age"
                                        defaultValue={age ?? ""}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                                    >
                                        <option value="">Любой</option>
                                        <option value="16-29">16-29 (youth)</option>
                                    </select>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-2">Минимальная зарплата</h3>
                                    <input
                                        name="minSalary"
                                        defaultValue={minSalary > 0 ? String(minSalary) : ""}
                                        type="number"
                                        min={0}
                                        step={10000}
                                        placeholder="150000"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-2">Занятость</h3>
                                    <select
                                        name="employment"
                                        defaultValue={employment ?? ""}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                                    >
                                        <option value="">Любая</option>
                                        {EMPLOYMENT_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-2">Категория</h3>
                                    <select
                                        name="category"
                                        defaultValue={category ?? ""}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                                    >
                                        <option value="">Все категории</option>
                                        {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <button type="submit" className="w-full rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white">
                                    Применить фильтры
                                </button>
                            </form>

                            {hasActiveFilters && (
                                <Link
                                    href="/jobs"
                                    className="block text-sm text-center text-primary-700 hover:underline pt-2 border-t"
                                >
                                    Сбросить фильтры
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                </aside>

                <div>
                    {jobRows.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-lg font-medium text-gray-900 mb-1">Нет вакансий</p>
                                <p className="text-sm text-gray-500">
                                    Попробуйте сбросить фильтры или вернуться позже
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid sm:grid-cols-2 gap-4">
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
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    {Array.from({ length: totalPages }).map((_, i) => {
                                        const n = i + 1;
                                        const isActive = n === page;
                                        return (
                                            <Link
                                                key={n}
                                                href={makeUrl({ page: String(n) })}
                                                className={`min-w-9 h-9 flex items-center justify-center rounded-md text-sm ${
                                                    isActive
                                                        ? "bg-primary-600 text-white"
                                                        : "bg-white border hover:bg-gray-50"
                                                }`}
                                            >
                                                {n}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
