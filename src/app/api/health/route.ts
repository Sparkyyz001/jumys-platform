import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
    const hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
    const hasService = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
    const ok = hasUrl && hasAnon;

    return NextResponse.json(
        {
            ok,
            supabase: { url: hasUrl, anonKey: hasAnon, serviceRole: hasService },
            siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
            telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim()),
            openai: Boolean(process.env.OPENAI_API_KEY?.trim()),
        },
        { status: ok ? 200 : 503 }
    );
}
