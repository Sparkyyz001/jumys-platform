"use server";

import { createSSRClient } from "@/lib/supabase/server";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { generateMatchExplanation } from "@/lib/ai/explanations";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createServerAdminClient() as any;

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
