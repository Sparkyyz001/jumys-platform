import Link from "next/link";

export const metadata = { title: "Настройка сервера — Jumys" };

export default async function SetupErrorPage({
    searchParams,
}: {
    searchParams: Promise<{ reason?: string }>;
}) {
    const { reason } = await searchParams;
    const reasonHint =
        reason === "missing_env"
            ? "Причина: не заданы NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY."
            : reason === "runtime"
              ? "Причина: ошибка при обращении к Supabase (см. логи Vercel → Functions)."
              : null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
            <div className="max-w-lg w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-3xl p-8 space-y-4">
                <h1 className="text-xl font-bold text-zinc-100">Сайт не настроен на хостинге</h1>
                {reasonHint && (
                    <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-xl p-3">
                        {reasonHint}
                    </p>
                )}
                <p className="text-sm text-zinc-400">
                    На Vercel (или другом хостинге) не заданы переменные окружения Supabase, либо при запросе к базе произошла ошибка.
                </p>
                <p className="text-sm text-zinc-400">
                    В проекте Vercel откройте <strong className="text-zinc-200">Settings → Environment Variables</strong> и добавьте для <strong className="text-zinc-200">Production</strong>:
                </p>
                <ul className="text-sm font-mono bg-white/[0.04] border border-white/[0.07] rounded-xl p-3 space-y-1 list-disc list-inside text-zinc-300">
                    <li>NEXT_PUBLIC_SUPABASE_URL</li>
                    <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                    <li>SUPABASE_SERVICE_ROLE_KEY</li>
                    <li>OPENAI_API_KEY</li>
                    <li>TELEGRAM_BOT_TOKEN</li>
                    <li>TELEGRAM_BOT_USERNAME</li>
                    <li>NEXT_PUBLIC_SITE_URL (URL этого деплоя)</li>
                    <li>CRON_SECRET</li>
                </ul>
                <p className="text-xs text-zinc-500">
                    После сохранения переменных нажмите <strong className="text-zinc-400">Redeploy</strong>. Проверка: откройте{" "}
                    <Link href="/api/health" className="text-amber-400 hover:text-amber-300 underline transition-colors">
                        /api/health
                    </Link>
                    .
                </p>
                <Link href="/" className="inline-block text-sm text-amber-400 font-medium hover:text-amber-300 transition-colors">
                    На главную
                </Link>
            </div>
        </div>
    );
}
