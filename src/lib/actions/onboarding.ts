"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSSRClient } from "@/lib/supabase/server";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { generateEmbedding, buildSeekerEmbeddingInput } from "@/lib/ai/embeddings";
import type { UserRole } from "@/lib/types";

async function requireUser() {
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Требуется авторизация");
    return { supabase, user };
}

export async function setRoleAction(role: UserRole) {
    const { supabase, user } = await requireUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("profiles") as any)
        .upsert({ id: user.id, role }, { onConflict: "id" });

    if (error) throw new Error(error.message);

    revalidatePath("/dashboard");
    if (role === "seeker") redirect("/onboarding/seeker");
    redirect("/onboarding/employer");
}

const seekerSchema = z.object({
    full_name: z.string().min(2, "Укажите имя"),
    phone: z.string().min(6, "Укажите телефон"),
    district: z.string().min(1, "Выберите район"),
    skills: z.array(z.string()).default([]),
    experience_years: z.number().int().min(0).max(60).default(0),
    desired_employment: z.enum(["full", "part", "gig"]),
    about: z.string().max(2000).optional().default(""),
});

export type SeekerInput = z.infer<typeof seekerSchema>;

export async function submitSeekerAction(input: SeekerInput) {
    const parsed = seekerSchema.parse(input);
    const { supabase, user } = await requireUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase.from("profiles") as any)
        .upsert({
            id: user.id,
            role: "seeker",
            full_name: parsed.full_name,
            phone: parsed.phone,
            district: parsed.district,
        }, { onConflict: "id" });
    if (profileError) throw new Error(profileError.message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: seekerError } = await (supabase.from("seeker_profiles") as any)
        .upsert({
            profile_id: user.id,
            about: parsed.about,
            skills: parsed.skills,
            experience_years: parsed.experience_years,
            desired_employment: parsed.desired_employment,
        }, { onConflict: "profile_id" });
    if (seekerError) throw new Error(seekerError.message);

    // Generate embedding asynchronously (fire-and-forget via admin client)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createServerAdminClient() as any;
    const text = buildSeekerEmbeddingInput({
        full_name: parsed.full_name,
        district: parsed.district,
        about: parsed.about,
        skills: parsed.skills,
        experience_years: parsed.experience_years,
        desired_employment: parsed.desired_employment,
    });

    generateEmbedding(text)
        .then(async (embedding) => {
            await admin
                .from("seeker_profiles")
                .update({ embedding: embedding as unknown as number[] })
                .eq("profile_id", user.id);
        })
        .catch((err) => console.error("seeker embedding failed", err));

    revalidatePath("/dashboard");
    redirect("/onboarding/telegram");
}

const employerSchema = z.object({
    full_name: z.string().min(2, "Укажите имя"),
    phone: z.string().min(6, "Укажите телефон"),
    company_name: z.string().min(2, "Укажите компанию"),
    company_type: z.string().optional().default(""),
    district: z.string().optional().default(""),
});

export type EmployerInput = z.infer<typeof employerSchema>;

export async function submitEmployerAction(input: EmployerInput) {
    const parsed = employerSchema.parse(input);
    const { supabase, user } = await requireUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase.from("profiles") as any)
        .upsert({
            id: user.id,
            role: "employer",
            full_name: parsed.full_name,
            phone: parsed.phone,
            district: parsed.district || null,
        }, { onConflict: "id" });
    if (profileError) throw new Error(profileError.message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: empError } = await (supabase.from("employer_profiles") as any)
        .upsert({
            profile_id: user.id,
            company_name: parsed.company_name,
            company_type: parsed.company_type || null,
        }, { onConflict: "profile_id" });
    if (empError) throw new Error(empError.message);

    revalidatePath("/dashboard");
    redirect("/onboarding/telegram");
}
