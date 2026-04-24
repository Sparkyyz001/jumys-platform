import { NextResponse } from "next/server";
import { createSSRSassClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const tokenHash = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type");
    const next = requestUrl.searchParams.get("next") ?? "/dashboard";
    const errorDescription = requestUrl.searchParams.get("error_description");

    if (errorDescription) {
        return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(errorDescription)}`, request.url));
    }

    if (code) {
        const supabase = await createSSRSassClient();
        await supabase.exchangeCodeForSession(code);
        return NextResponse.redirect(new URL(next, request.url));
    }

    if (tokenHash && type) {
        const supabase = await createSSRSassClient();
        const { error } = await supabase.getSupabaseClient().auth.verifyOtp({
            token_hash: tokenHash,
            type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email",
        });
        if (!error) {
            return NextResponse.redirect(new URL(next, request.url));
        }
    }

    return NextResponse.redirect(new URL("/auth/login", request.url));
}
