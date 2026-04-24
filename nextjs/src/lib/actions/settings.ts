"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { z } from "zod";
import { createSSRClient } from "@/lib/supabase/server";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { buildSeekerEmbeddingInput, generateEmbedding } from "@/lib/ai/embeddings";

const settingsSchema = z.object({
    full_name: z.string().min(2, "Укажите имя"),
    avatar_url: z.string().url("Некорректная ссылка на фото").optional().or(z.literal("")).default(""),
    about: z.string().max(2000).optional().default(""),
    telegram_username: z.string().max(64).optional().default(""),
    company_name: z.string().max(160).optional().default(""),
    company_bin_iin: z.string().max(20).optional().default(""),
    company_description: z.string().max(300).optional().default(""),
    seeker_iin: z.string().max(20).optional().default(""),
});

const passwordSchema = z.object({
    password: z.string().min(8, "Минимум 8 символов"),
});

function normalizeDigits(value: string): string {
    return value.replace(/\D/g, "");
}

export async function updateSettingsAction(input: z.infer<typeof settingsSchema>) {
    const parsed = settingsSchema.parse(input);
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Требуется авторизация");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, district, phone")
        .eq("id", user.id)
        .maybeSingle();
    const profileRow = profile as { role: "employer" | "seeker"; district: string | null; phone: string | null } | null;
    if (!profileRow) throw new Error("Профиль не найден");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any)
        .upsert({ id: user.id, full_name: parsed.full_name }, { onConflict: "id" });

    if (profileRow.role === "seeker") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: seeker } = await (supabase.from("seeker_profiles") as any)
            .select("skills, experience_years, desired_employment")
            .eq("profile_id", user.id)
            .maybeSingle();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("seeker_profiles") as any)
            .upsert({ profile_id: user.id, about: parsed.about }, { onConflict: "profile_id" });

        const text = buildSeekerEmbeddingInput({
            full_name: parsed.full_name,
            district: profileRow.district,
            about: parsed.about,
            skills: seeker?.skills ?? [],
            experience_years: seeker?.experience_years ?? 0,
            desired_employment: seeker?.desired_employment ?? "full",
        });
        const embedding = await generateEmbedding(text);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const admin = createServerAdminClient() as any;
        await admin
            .from("seeker_profiles")
            .update({ embedding: embedding as unknown as number[] })
            .eq("profile_id", user.id);
    }

    if (profileRow.role === "employer") {
        const normalizedBin = normalizeDigits(parsed.company_bin_iin);
        const companyTypeParts = [
            parsed.company_description.trim(),
            normalizedBin ? `BIN/IIN:${normalizedBin}` : "",
        ].filter(Boolean);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("employer_profiles") as any)
            .upsert({
                profile_id: user.id,
                company_name: parsed.company_name || "Компания",
                company_type: companyTypeParts.join(" | ") || null,
            }, { onConflict: "profile_id" });
    }

    await supabase.auth.updateUser({
        data: {
            telegram_username: parsed.telegram_username.trim(),
            avatar_url: parsed.avatar_url.trim(),
            company_bin_iin: normalizeDigits(parsed.company_bin_iin),
            seeker_iin: normalizeDigits(parsed.seeker_iin),
            is_verified: profileRow.role === "employer" ? normalizeDigits(parsed.company_bin_iin).length === 12 : false,
        },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    revalidatePath("/jobs");
}

export async function updatePasswordAction(input: z.infer<typeof passwordSchema>) {
    const parsed = passwordSchema.parse(input);
    const supabase = await createSSRClient();
    const { error } = await supabase.auth.updateUser({ password: parsed.password });
    if (error) throw new Error(error.message);
}

export async function createTelegramLinkAction(): Promise<{ url: string }> {
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Требуется авторизация");

    const botUsernameRaw = process.env.TELEGRAM_BOT_USERNAME;
    if (!botUsernameRaw) {
        throw new Error("Не настроен TELEGRAM_BOT_USERNAME");
    }

    const botUsername = botUsernameRaw.replace(/^@/, "").trim();
    const token = randomBytes(18).toString("base64url");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("profiles") as any)
        .update({
            telegram_link_token: token,
            telegram_link_token_expires_at: expiresAt,
        })
        .eq("id", user.id);

    if (error) throw new Error("Не удалось создать ссылку для привязки Telegram");

    return {
        url: `https://t.me/${botUsername}?start=${token}`,
    };
}
