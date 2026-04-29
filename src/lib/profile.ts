import { createSSRClient } from "@/lib/supabase/server";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import type { Profile, EmployerProfile, SeekerProfile } from "@/lib/types";

export interface FullProfile {
    user: { id: string; email: string | null; email_confirmed: boolean };
    profile: Profile | null;
    employer: EmployerProfile | null;
    seeker: SeekerProfile | null;
}

export async function getCurrentFullProfile(): Promise<FullProfile | null> {
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
    const profileRow = profile as Profile | null;

    let employer: EmployerProfile | null = null;
    let seeker: SeekerProfile | null = null;

    if (profileRow?.role === "employer") {
        const { data } = await supabase
            .from("employer_profiles")
            .select("*")
            .eq("profile_id", user.id)
            .maybeSingle();
        employer = data ?? null;
    } else if (profileRow?.role === "seeker") {
        const { data } = await supabase
            .from("seeker_profiles")
            .select("*")
            .eq("profile_id", user.id)
            .maybeSingle();
        seeker = data ?? null;
    }

    return {
        user: {
            id: user.id,
            email: user.email ?? null,
            email_confirmed: Boolean(user.email_confirmed_at ?? user.confirmed_at),
        },
        profile: profileRow ?? null,
        employer,
        seeker,
    };
}

export function normalizePhone(phone: string): string {
    let digits = phone.replace(/\D/g, "");
    if (digits.startsWith("8") && digits.length === 11) digits = `7${digits.slice(1)}`;
    return digits;
}

type BotProfileRow = Pick<Profile, "id" | "role" | "full_name" | "phone" | "district" | "telegram_chat_id">;

export async function getProfileByTelegramChatId(chatId: number): Promise<BotProfileRow | null> {
    const admin = createServerAdminClient();
    const { data, error } = await admin
        .from("profiles")
        .select("id, role, full_name, phone, district, telegram_chat_id")
        .eq("telegram_chat_id", chatId)
        .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as BotProfileRow | null) ?? null;
}

export async function findProfileByPhone(phone: string): Promise<BotProfileRow | null> {
    const admin = createServerAdminClient();
    const normalized = normalizePhone(phone);
    if (!normalized) return null;

    const full = `+${normalized}`;
    const last10 = normalized.length >= 10 ? normalized.slice(-10) : normalized;

    const { data, error } = await admin
        .from("profiles")
        .select("id, role, full_name, phone, district, telegram_chat_id")
        .or(`phone.eq.${full},phone.ilike.%${last10}`)
        .limit(1)
        .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as BotProfileRow | null) ?? null;
}
