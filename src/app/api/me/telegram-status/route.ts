import { NextResponse } from "next/server";
import { createSSRClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Лёгкий polling endpoint для страницы /onboarding/telegram.
 * Возвращает {linked: boolean} без кэша.
 */
export async function GET() {
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ linked: false, authenticated: false }, { status: 200 });
    }
    const { data } = await supabase
        .from("profiles")
        .select("telegram_chat_id")
        .eq("id", user.id)
        .maybeSingle();
    const linked = Boolean((data as { telegram_chat_id?: number | null } | null)?.telegram_chat_id);
    return NextResponse.json(
        { linked, authenticated: true },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
}
