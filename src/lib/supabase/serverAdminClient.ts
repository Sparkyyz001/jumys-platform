import { createClient } from '@supabase/supabase-js'

export function createServerAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PRIVATE_SUPABASE_SERVICE_KEY!;
    return createClient(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}
