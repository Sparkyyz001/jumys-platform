import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding', '/jobs']

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: userData } = await supabase.auth.getUser()
    const pathname = request.nextUrl.pathname
    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

    if (!userData?.user && isProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    if (userData?.user && (pathname.startsWith('/dashboard') || pathname.startsWith('/jobs'))) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("telegram_chat_id, role")
            .eq("id", userData.user.id)
            .maybeSingle();

        const profileRow = profile as { telegram_chat_id: number | null; role: "employer" | "seeker" | null } | null;
        const mustConnectTelegram = profileRow?.role && !profileRow.telegram_chat_id;
        const isTelegramOnboarding = pathname.startsWith('/onboarding/telegram');
        if (mustConnectTelegram && !isTelegramOnboarding) {
            const url = request.nextUrl.clone();
            url.pathname = "/onboarding/telegram";
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse
}
