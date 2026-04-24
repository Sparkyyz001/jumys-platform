import OpenAI from "openai";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

export const runtime = "nodejs";

interface ParsedQuery {
    keyword?: string;
    district?: string;
    employment?: "full" | "part" | "gig";
}

interface JobSearchRow {
    id: string;
    title: string;
    description: string;
    district: string | null;
    employment: "full" | "part" | "gig" | null;
    salary_from: number | null;
    salary_to: number | null;
}

function heuristicParse(query: string): ParsedQuery {
    const normalized = query.toLowerCase();
    const districtMatch = normalized.match(/(\d{1,2})\s*(мкр|микрорайон)/i);
    const district = districtMatch?.[1];
    const employment = normalized.includes("подработка")
        ? "gig"
        : normalized.includes("част")
            ? "part"
            : undefined;
    const keyword = normalized
        .replace(/(\d{1,2})\s*(мкр|микрорайон)/gi, "")
        .replace(/найди|мне|работу|в|актау/gi, "")
        .trim();
    return { keyword, district, employment };
}

export async function POST(request: Request): Promise<Response> {
    const body = await request.json().catch(() => ({}));
    const query = String(body.query ?? "").trim();
    if (!query) return Response.json({ jobs: [] });

    const admin = createServerAdminClient();
    const { data: jobs } = await admin
        .from("jobs")
        .select("id, title, description, district, employment, salary_from, salary_to")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(200);

    const rows = (jobs ?? []) as JobSearchRow[];

    if (rows.length === 0) {
        return Response.json({ jobs: [] });
    }

    let parsed: ParsedQuery = heuristicParse(query);

    if (process.env.OPENAI_API_KEY) {
        try {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                temperature: 0,
                messages: [
                    {
                        role: "system",
                        content: "Extract job-search filters. Return JSON with keys: keyword, district, employment(full|part|gig).",
                    },
                    { role: "user", content: query },
                ],
                response_format: { type: "json_object" },
            });
            const content = completion.choices[0]?.message?.content;
            if (content) {
                const decoded = JSON.parse(content) as ParsedQuery;
                parsed = { ...parsed, ...decoded };
            }
        } catch {
            // keep heuristic parsing for resilience
        }
    }

    const district = parsed.district?.trim();
    const keyword = parsed.keyword?.toLowerCase().trim();

    const filtered = rows.filter((job) => {
        if (district && job.district !== district) return false;
        if (parsed.employment && job.employment !== parsed.employment) return false;
        if (keyword) {
            const haystack = `${job.title} ${job.description}`.toLowerCase();
            if (!haystack.includes(keyword)) return false;
        }
        return true;
    }).slice(0, 8);

    return Response.json({ jobs: filtered });
}
