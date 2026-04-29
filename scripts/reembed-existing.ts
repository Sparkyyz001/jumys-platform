import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { buildJobEmbeddingInput, buildSeekerEmbeddingInput, generateEmbedding } from "../src/lib/ai/embeddings";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PRIVATE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});

async function reembedJobs() {
    const { data: jobs, error } = await supabase
        .from("jobs")
        .select("id, title, description, category, district, employment, experience_required, skills_required")
        .eq("is_active", true);
    if (error) throw new Error(`Failed to load jobs: ${error.message}`);
    if (!jobs || jobs.length === 0) return 0;

    let updated = 0;
    for (const job of jobs) {
        const input = buildJobEmbeddingInput({
            title: job.title,
            description: job.description,
            category: job.category,
            district: job.district,
            employment: job.employment,
            experience_required: job.experience_required,
            skills_required: job.skills_required,
        });
        const embedding = await generateEmbedding(input);
        const { error: updateError } = await supabase
            .from("jobs")
            .update({ embedding: embedding as unknown as number[] })
            .eq("id", job.id);
        if (updateError) throw new Error(`Failed to update job ${job.id}: ${updateError.message}`);
        updated += 1;
        if (updated % 25 === 0) console.log(`Jobs re-embedded: ${updated}/${jobs.length}`);
    }
    return updated;
}

async function reembedSeekers() {
    const { data: rows, error } = await supabase
        .from("seeker_profiles")
        .select("profile_id, about, skills, experience_years, desired_employment, profiles!inner(full_name, district)");
    if (error) throw new Error(`Failed to load seeker profiles: ${error.message}`);
    if (!rows || rows.length === 0) return 0;

    let updated = 0;
    for (const row of rows) {
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        const input = buildSeekerEmbeddingInput({
            full_name: profile?.full_name ?? null,
            district: profile?.district ?? null,
            about: row.about,
            skills: row.skills,
            experience_years: row.experience_years,
            desired_employment: row.desired_employment,
        });
        const embedding = await generateEmbedding(input);
        const { error: updateError } = await supabase
            .from("seeker_profiles")
            .update({ embedding: embedding as unknown as number[] })
            .eq("profile_id", row.profile_id);
        if (updateError) throw new Error(`Failed to update seeker ${row.profile_id}: ${updateError.message}`);
        updated += 1;
        if (updated % 25 === 0) console.log(`Seekers re-embedded: ${updated}/${rows.length}`);
    }
    return updated;
}

async function run() {
    console.log("Starting full re-embedding with local model...");
    const jobs = await reembedJobs();
    const seekers = await reembedSeekers();
    console.log(`Done. Jobs updated: ${jobs}, seekers updated: ${seekers}`);
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
