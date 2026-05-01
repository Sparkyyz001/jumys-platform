import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseBrowserConfigured } from '@/lib/supabase/public-env'

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding', '/jobs']

export async function updateSession(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    if (pathname.startsWith('/setup-error') || pathname.startsWith('/api/health')) {
        return NextResponse.next({ request })
    }

    if (!isSupabaseBrowserConfigured()) {
        const url = request.nextUrl.clone()
        url.pathname = '/setup-error'
        url.searchParams.set('reason', 'missing_env')
        return NextResponse.redirect(url)
    }

    try {
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

        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            console.error('middleware getUser', userError.message)
        }

        const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
        const isAuthPage =
            pathname === '/auth/login' ||
            pathname === '/auth/register' ||
            pathname === '/auth/forgot-password'

        if (!userData?.user && isProtected) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth/login'
            url.searchParams.set('next', pathname)
            return NextResponse.redirect(url)
        }

        if (userData?.user && isAuthPage) {
            const requestedNext = request.nextUrl.searchParams.get("next");
            const target =
                requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
                    ? requestedNext
                    : "/dashboard";
            return NextResponse.redirect(new URL(target, request.url));
        }

        if (userData?.user && (pathname.startsWith('/dashboard') || pathname.startsWith('/jobs'))) {
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("telegram_chat_id, role")
                .eq("id", userData.user.id)
                .maybeSingle()

            if (profileError) {
                console.error('middleware profiles', profileError.message)
            } else {
                const profileRow = profile as { telegram_chat_id: number | null; role: "employer" | "seeker" | null } | null
                const mustConnectTelegram = profileRow?.role && !profileRow.telegram_chat_id
                const isTelegramOnboarding = pathname.startsWith('/onboarding/telegram')
                if (mustConnectTelegram && !isTelegramOnboarding) {
                    const url = request.nextUrl.clone()
                    url.pathname = "/onboarding/telegram"
                    return NextResponse.redirect(url)
                }
            }
        }

        return supabaseResponse
    } catch (e) {
        console.error('middleware fatal', e)
        const url = request.nextUrl.clone()
        url.pathname = '/setup-error'
        url.searchParams.set('reason', 'runtime')
        return NextResponse.redirect(url)
    }
}
