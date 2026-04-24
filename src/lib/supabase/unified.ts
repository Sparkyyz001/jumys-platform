import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types";

export enum ClientType {
    SERVER = 'server',
    SPA = 'spa'
}

export class SassClient {
    private client: SupabaseClient<Database, "public", "public">;
    private clientType: ClientType;

    constructor(client: SupabaseClient<Database, "public", "public">, clientType: ClientType) {
        this.client = client;
        this.clientType = clientType;
    }

    async loginEmail(email: string, password: string) {
        return this.client.auth.signInWithPassword({ email, password });
    }

    async registerEmail(
        email: string,
        password: string,
        metadata?: { telegram_username?: string | null },
        emailRedirectTo?: string
    ) {
        return this.client.auth.signUp({
            email,
            password,
            options: {
                ...(metadata ? { data: metadata } : {}),
                ...(emailRedirectTo ? { emailRedirectTo } : {}),
            },
        });
    }

    async exchangeCodeForSession(code: string) {
        return this.client.auth.exchangeCodeForSession(code);
    }

    async resendVerificationEmail(email: string) {
        return this.client.auth.resend({ email, type: 'signup' });
    }

    async logout() {
        const { error } = await this.client.auth.signOut({ scope: 'local' });
        if (error) throw error;
        if (this.clientType === ClientType.SPA) {
            window.location.href = '/auth/login';
        }
    }

    getSupabaseClient() {
        return this.client;
    }
}
