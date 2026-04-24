import {createServerClient} from '@supabase/ssr'
import {cookies} from 'next/headers'
import {ClientType, SassClient} from "@/lib/supabase/unified";

export async function createSSRClient() {
    const cookieStore = await cookies()

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

    return createServerClient(
        url,
        anon,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            }
        }
    )
}



export async function createSSRSassClient() {
    const client = await createSSRClient();
    // This must be some bug that SupabaseClient is not properly recognized, so must be ignored
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new SassClient(client as any, ClientType.SERVER);
}