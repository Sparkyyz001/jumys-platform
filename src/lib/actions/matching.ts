"use server";

import { createSSRClient } from "@/lib/supabase/server";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { generateMatchExplanation } from "@/lib/ai/explanations";
import { generateEmbedding } from "@/lib/ai/embeddings";
import type { EmploymentType, ExperienceLevel } from "@/lib/types";

export interface MatchedJobFromQuery {
    id: string;
    title: string;
    description: string;
    district: string | null;
    employment: EmploymentType | null;
    salary_from: number | null;
    salary_to: number | null;
    similarity: number;
}

interface MatchJobsRpcRow extends MatchedJobFromQuery {
    category: string | null;
    experience_required: ExperienceLevel;
    skills_required: string[];
    employer_id: string;
    company_name: string | null;
    created_at: string;
}

interface ParsedSearchIntent {
    query: string;
    district: string | null;
    parser: "gemini" | "heuristic";
}

function parseDistrictHeuristic(input: string): string | null {
    const districtMatch = input.toLowerCase().match(/(\d{1,2})\s*(мкр|микрорайон)?/i);
    return districtMatch?.[1] ?? null;
}

async function parseIntentWithGemini(query: string): Promise<ParsedSearchIntent> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        return { query, district: parseDistrictHeuristic(query), parser: "heuristic" };
    }

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text:
                            "Extract JSON object with keys: query (string for job semantic search), district (Aktau microdistrict number string or null)." +
                            ` User text: ${query}`,
                    }],
                }],
                generationConfig: {
                    responseMimeType: "application/json",
                },
            }),
        }
    );

    if (!res.ok) {
        return { query, district: parseDistrictHeuristic(query), parser: "heuristic" };
    }

    const payload = await res.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) return { query, district: parseDistrictHeuristic(query), parser: "heuristic" };

    try {
        const parsed = JSON.parse(raw) as { query?: string; district?: string | null };
        return {
            query: parsed.query?.trim() || query,
            district: parsed.district?.trim() || parseDistrictHeuristic(query),
            parser: "gemini",
        };
    } catch {
        return { query, district: parseDistrictHeuristic(query), parser: "heuristic" };
    }
}

export interface MatchJobsByQueryResult {
    jobs: MatchedJobFromQuery[];
    provider: "local-transformers" | "gemini+local-transformers";
}

export async function getMatchExplanationAction(
    jobId: string,
    seekerId: string,
    similarity: number
): Promise<string> {
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Требуется авторизация");

    const { data: cached } = await supabase
        .from("match_explanations")
        .select("explanation")
        .eq("job_id", jobId)
        .eq("seeker_id", seekerId)
        .maybeSingle();
    const cachedRow = cached as { explanation: string } | null;
    if (cachedRow?.explanation) return cachedRow.explanation;

    // Fetch data via admin to bypass RLS on cross-role reads when seeker views a job's match
    const admin = createServerAdminClient();

    const { data: jobRow } = await admin
        .from("jobs")
        .select("*, employer_profiles:employer_profiles!jobs_employer_id_fkey(company_name)")
        .eq("id", jobId)
        .maybeSingle();

    const { data: profileRow } = await admin
        .from("profiles")
        .select("full_name, district")
        .eq("id", seekerId)
        .maybeSingle();

    const { data: seekerRow } = await admin
        .from("seeker_profiles")
        .select("about, skills, experience_years, desired_employment")
        .eq("profile_id", seekerId)
        .maybeSingle();

    if (!jobRow || !seekerRow || !profileRow) {
        throw new Error("Не удалось получить данные для объяснения");
    }

    const companyName =
        (jobRow as unknown as { employer_profiles: { company_name: string } | null }).employer_profiles?.company_name ?? null;

    const explanation = await generateMatchExplanation(
        {
            title: jobRow.title,
            description: jobRow.description,
            category: jobRow.category,
            district: jobRow.district,
            employment: jobRow.employment,
            experience_required: jobRow.experience_required,
            salary_from: jobRow.salary_from,
            salary_to: jobRow.salary_to,
            skills_required: jobRow.skills_required,
            company_name: companyName,
        },
        {
            full_name: profileRow.full_name,
            district: profileRow.district,
            about: seekerRow.about,
            skills: seekerRow.skills,
            experience_years: seekerRow.experience_years,
            desired_employment: seekerRow.desired_employment,
        },
        similarity
    );

    await admin.from("match_explanations").insert({
        job_id: jobId,
        seeker_id: seekerId,
        explanation,
    });

    return explanation;
}

export async function matchJobsByTextQuery(
    query: string,
    options?: { limit?: number; district?: string | null }
): Promise<MatchedJobFromQuery[]> {
    const result = await matchJobsByTextQueryWithMeta(query, options);
    return result.jobs;
}

export async function matchJobsByTextQueryWithMeta(
    query: string,
    options?: { limit?: number; district?: string | null }
): Promise<MatchJobsByQueryResult> {
    const text = query.trim();
    if (!text) return { jobs: [], provider: "local-transformers" };

    const intent = await parseIntentWithGemini(text);
    const embedding = await generateEmbedding(intent.query);
    const admin = createServerAdminClient();

    const { data, error } = await admin.rpc("match_jobs", {
        p_query_embedding: embedding,
        p_count: options?.limit ?? 5,
        p_filter_district: options?.district ?? intent.district,
    });

    if (error) throw new Error(error.message);
    const rows = (data as MatchJobsRpcRow[] | null) ?? [];

    const jobs = rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        district: row.district,
        employment: row.employment,
        salary_from: row.salary_from,
        salary_to: row.salary_to,
        similarity: Number(row.similarity),
    }));

    return {
        jobs,
        provider: intent.parser === "gemini" ? "gemini+local-transformers" : "local-transformers",
    };
}
