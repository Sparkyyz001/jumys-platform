"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSSRClient } from "@/lib/supabase/server";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { generateEmbedding, buildJobEmbeddingInput } from "@/lib/ai/embeddings";
import { enqueueJobMatchNotifications, flushNotifications } from "@/lib/telegram/send";

const jobSchema = z.object({
    title: z.string().min(3, "Укажите название"),
    description: z.string().min(20, "Опишите вакансию подробнее"),
    category: z.string().optional().default(""),
    district: z.string().optional().default(""),
    employment: z.enum(["full", "part", "gig"]),
    experience_required: z.enum(["none", "junior", "middle", "senior"]),
    salary_from: z.number().int().nonnegative().optional().nullable(),
    salary_to: z.number().int().nonnegative().optional().nullable(),
    skills_required: z.array(z.string()).default([]),
});

export type JobInput = z.infer<typeof jobSchema>;

export async function createJobAction(input: JobInput) {
    const parsed = jobSchema.parse(input);
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Требуется авторизация");

    const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", user.id).maybeSingle();
    const profileRow = profile as { role: "employer" | "seeker" } | null;
    if (!profileRow || profileRow.role !== "employer") {
        throw new Error("Только работодатели могут создавать вакансии");
    }

    const row = {
        employer_id: user.id,
        title: parsed.title,
        description: parsed.description,
        category: parsed.category || null,
        district: parsed.district || null,
        employment: parsed.employment,
        experience_required: parsed.experience_required,
        salary_from: parsed.salary_from ?? null,
        salary_to: parsed.salary_to ?? null,
        skills_required: parsed.skills_required,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error } = await (supabase.from("jobs") as any)
        .insert(row)
        .select("id")
        .single();
    if (error) throw new Error(error.message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createServerAdminClient() as any;
    const text = buildJobEmbeddingInput(row);
    try {
        const embedding = await generateEmbedding(text);
        await admin
            .from("jobs")
            .update({ embedding: embedding as unknown as number[] })
            .eq("id", inserted.id);
        // Enqueue notifications for matched seekers
        await enqueueJobMatchNotifications(inserted.id, 10);
        flushNotifications().catch(err => console.error("flush notifications failed", err));
    } catch (err) {
        console.error("job embedding failed", err);
    }

    revalidatePath("/jobs");
    revalidatePath("/dashboard/jobs");
    redirect(`/jobs/${inserted.id}`);
}

export async function archiveJobAction(jobId: string) {
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Требуется авторизация");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("jobs") as any)
        .update({ is_active: false })
        .eq("id", jobId)
        .eq("employer_id", user.id);
    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/jobs");
    revalidatePath("/jobs");
}

export async function restoreJobAction(jobId: string) {
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Требуется авторизация");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("jobs") as any)
        .update({ is_active: true })
        .eq("id", jobId)
        .eq("employer_id", user.id);
    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/jobs");
    revalidatePath("/jobs");
}
