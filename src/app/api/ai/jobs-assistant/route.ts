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
    const districtMatch = normalized.match(/(\d{1,2})\s*(мкр|микрорайон|microdistrict)/i);
    const district = districtMatch?.[1];

    const employment: ParsedQuery["employment"] = /удал[её]н|remote/i.test(normalized)
        ? "full"
        : /подработк|gig/i.test(normalized)
            ? "gig"
            : /част(ич)?н|неполн|part/i.test(normalized)
                ? "part"
                : undefined;

    const stop = [
        "найди", "найти", "ищу", "хочу", "мне", "работу", "работа", "в", "на",
        "актау", "город", "пожалуйста", "please", "find", "me", "job", "for",
        "удалённый", "удаленный", "remote", "подработка", "gig", "частичная", "part",
        "полная", "full", "мкр", "микрорайон", "microdistrict",
    ];
    const stopRegex = new RegExp(`\\b(${stop.join("|")})\\b`, "gi");
    const keyword = normalized
        .replace(/(\d{1,2})\s*(мкр|микрорайон|microdistrict)/gi, "")
        .replace(stopRegex, "")
        .replace(/[.,!?;:]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    return { keyword: keyword || undefined, district, employment };
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
        .limit(300);

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
                        content:
                            'Extract job-search filters in JSON. Keys: keyword (string, profession/skill), district (string, only digit number from Aktau microdistricts), employment (one of "full","part","gig"). Omit absent keys.',
                    },
                    { role: "user", content: query },
                ],
                response_format: { type: "json_object" },
            });
            const content = completion.choices[0]?.message?.content;
            if (content) {
                const decoded = JSON.parse(content) as ParsedQuery;
                parsed = {
                    keyword: decoded.keyword?.trim() || parsed.keyword,
                    district: decoded.district?.toString().trim() || parsed.district,
                    employment: decoded.employment ?? parsed.employment,
                };
            }
        } catch {
            // keep heuristic on AI failure
        }
    }

    const district = parsed.district?.trim();
    const keyword = parsed.keyword?.toLowerCase().trim();
    const keywordTokens = keyword ? keyword.split(/\s+/).filter(Boolean) : [];

    type Scored = { row: JobSearchRow; score: number };
    const scored: Scored[] = rows.map((job) => {
        let score = 0;
        const haystack = `${job.title} ${job.description ?? ""}`.toLowerCase();

        if (district && job.district) {
            if (job.district === district || job.district.includes(district)) score += 3;
        }
        if (parsed.employment && job.employment === parsed.employment) score += 2;
        if (keywordTokens.length > 0) {
            for (const token of keywordTokens) {
                if (token.length < 3) continue;
                if (haystack.includes(token)) score += 2;
                if (haystack.includes(token.slice(0, Math.max(3, token.length - 2)))) {
                    score += 1;
                }
            }
        }
        return { row: job, score };
    });

    const anyFilters = Boolean(district || parsed.employment || keywordTokens.length > 0);
    const matched = anyFilters
        ? scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score)
        : scored;

    const final = (matched.length > 0 ? matched : scored).slice(0, 8).map((s) => s.row);

    return Response.json({ jobs: final, parsed });
}
