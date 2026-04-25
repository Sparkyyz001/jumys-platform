import { createSSRClient } from "@/lib/supabase/server";
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
