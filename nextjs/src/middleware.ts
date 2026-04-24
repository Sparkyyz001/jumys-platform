import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    try {
        return await updateSession(request)
    } catch (e) {
        console.error('middleware top-level fatal', e)
        return NextResponse.next({ request })
    }
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/onboarding/:path*',
        '/jobs/:path*',
    ],
}