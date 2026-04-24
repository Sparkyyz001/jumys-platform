"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSSRClient } from "@/lib/supabase/server";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import {
    enqueueNewApplicationNotification,
    flushNotifications
} from "@/lib/telegram/send";
import type { ApplicationStatus } from "@/lib/types";

const applySchema = z.object({
    job_id: z.string().uuid(),
    message: z.string().max(2000).optional().default(""),
});

export type ApplyInput = z.infer<typeof applySchema>;

export async function applyToJobAction(input: ApplyInput) {
    const parsed = applySchema.parse(input);
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Требуется авторизация");

    const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", user.id).maybeSingle();
    const profileRow = profile as { role: "employer" | "seeker" } | null;
    if (!profileRow || profileRow.role !== "seeker") {
        throw new Error("Только соискатели могут откликаться");
    }

    // Check duplicate
    const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", parsed.job_id)
        .eq("seeker_id", user.id)
        .maybeSingle();
    if (existing) {
        throw new Error("Вы уже откликнулись на эту вакансию");
    }

    // Compute match score via admin client (has access to embeddings)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createServerAdminClient() as any;
    let matchScore: number | null = null;
    try {
        const { data: scoreRow } = await admin.rpc("match_jobs_for_seeker", {
            p_seeker_id: user.id,
            p_count: 1000,
        });
        const found = (scoreRow as Array<{ id: string; similarity: number }> | null)
            ?.find(r => r.id === parsed.job_id);
        if (found) matchScore = Math.max(0, Math.min(1, Number(found.similarity)));
    } catch (err) {
        console.error("match score compute failed", err);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertResult = await (supabase.from("applications") as any).insert({
        job_id: parsed.job_id,
        seeker_id: user.id,
        message: parsed.message || null,
        match_score: matchScore,
    });
    if (insertResult.error) throw new Error(insertResult.error.message);

    try {
        await enqueueNewApplicationNotification(parsed.job_id, user.id);
        flushNotifications().catch(err => console.error("flush notifications failed", err));
    } catch (err) {
        console.error("notification enqueue failed", err);
    }

    revalidatePath(`/jobs/${parsed.job_id}`);
    revalidatePath(`/dashboard/applications`);
}

const statusSchema = z.object({
    application_id: z.string().uuid(),
    status: z.enum(["new", "viewed", "contacted", "rejected"]),
});

export async function updateApplicationStatusAction(
    application_id: string,
    status: ApplicationStatus
) {
    const parsed = statusSchema.parse({ application_id, status });
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Требуется авторизация");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("applications") as any)
        .update({ status: parsed.status })
        .eq("id", parsed.application_id);
    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/applications");
    revalidatePath("/dashboard/jobs");
}
