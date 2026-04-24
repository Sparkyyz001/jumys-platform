"use client";

import { createSPASassClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SSOButtons({ onError }: { onError: (message: string) => void }) {
    const [loading, setLoading] = useState<"google" | "github" | null>(null);

    const signIn = async (provider: "google" | "github") => {
        try {
            setLoading(provider);
            const client = await createSPASassClient();
            const { error } = await client.getSupabaseClient().auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding/telegram`,
                },
            });
            if (error) throw error;
        } catch (err) {
            onError(err instanceof Error ? err.message : "Ошибка входа через провайдера");
            setLoading(null);
        }
    };

    return (
        <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-gray-500">или через</span>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => signIn("google")}
                    disabled={loading !== null}
                    className="w-full"
                >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {loading === "google" ? "..." : "Google"}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => signIn("github")}
                    disabled={loading !== null}
                    className="w-full"
                >
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.77.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.41 1.02 0 2.04.14 3 .41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.21.69.82.57C20.57 21.8 24 17.31 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    {loading === "github" ? "..." : "GitHub"}
                </Button>
            </div>
        </div>
    );
}
