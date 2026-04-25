import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, List } from "lucide-react";
import { createSSRClient } from "@/lib/supabase/server";
import { JobsMapClient, type JobMapItem } from "./JobsMapClient";

export const metadata = { title: "Карта вакансий — Jumys" };
export const dynamic = "force-dynamic";

export default async function JobsMapPage() {
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login?next=/jobs/map");

    const { data: jobs } = await supabase
        .from("jobs")
        .select("id, title, category, district, employment, salary_from, salary_to, employer_id")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(300);

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

    const employerIds = Array.from(new Set(jobRows.map((j) => j.employer_id).filter(Boolean))) as string[];
    const companyMap = new Map<string, string>();
    const verifiedMap = new Map<string, boolean>();
    if (employerIds.length > 0) {
        const { data: emps } = await supabase
            .from("employer_profiles")
            .select("profile_id, company_name, company_type")
            .in("profile_id", employerIds);
        const employerRows = (emps ?? []) as Array<{ profile_id: string; company_name: string; company_type: string | null }>;
        employerRows.forEach((e) => {
            companyMap.set(e.profile_id, e.company_name);
            verifiedMap.set(e.profile_id, /BIN\/IIN:\s*\d{12}/i.test(e.company_type ?? ""));
        });
    }

    const items: JobMapItem[] = jobRows.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.employer_id ? companyMap.get(j.employer_id) ?? null : null,
        district: j.district,
        category: j.category,
        employment: j.employment,
        salary_from: j.salary_from,
        salary_to: j.salary_to,
        verified: j.employer_id ? verifiedMap.get(j.employer_id) ?? false : false,
    }));

    return (
        <div className="dark min-h-screen bg-gradient-to-br from-[#0b1326] via-[#0d172e] to-[#101e3a] text-white">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
                    <div>
                        <Link
                            href="/jobs"
                            className="inline-flex items-center text-xs text-gray-400 hover:text-white transition-colors mb-2"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                            К списку вакансий
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold">Вакансии на карте Актау</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Кликните по точке, чтобы посмотреть вакансию
                        </p>
                    </div>
                    <Link
                        href="/jobs"
                        className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors"
                    >
                        <List className="h-4 w-4" />
                        Списком
                    </Link>
                </div>

                <JobsMapClient items={items} />
            </div>
        </div>
    );
}
