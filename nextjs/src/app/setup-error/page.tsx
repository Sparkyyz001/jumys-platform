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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-lg rounded-xl border bg-white p-8 shadow-sm space-y-4">
                <h1 className="text-xl font-bold text-slate-900">Сайт не настроен на хостинге</h1>
                {reasonHint && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">{reasonHint}</p>}
                <p className="text-sm text-slate-600">
                    На Vercel (или другом хостинге) не заданы переменные окружения Supabase, либо при запросе к базе произошла ошибка.
                </p>
                <p className="text-sm text-slate-600">
                    В проекте Vercel откройте <strong>Settings → Environment Variables</strong> и добавьте для <strong>Production</strong>:
                </p>
                <ul className="text-sm font-mono bg-slate-100 rounded-md p-3 space-y-1 list-disc list-inside text-slate-800">
                    <li>NEXT_PUBLIC_SUPABASE_URL</li>
                    <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                    <li>SUPABASE_SERVICE_ROLE_KEY</li>
                    <li>OPENAI_API_KEY</li>
                    <li>TELEGRAM_BOT_TOKEN</li>
                    <li>TELEGRAM_BOT_USERNAME</li>
                    <li>NEXT_PUBLIC_SITE_URL (URL этого деплоя)</li>
                    <li>CRON_SECRET</li>
                </ul>
                <p className="text-xs text-slate-500">
                    После сохранения переменных нажмите <strong>Redeploy</strong>. Проверка: откройте{" "}
                    <Link href="/api/health" className="text-primary-600 underline">
                        /api/health
                    </Link>
                    .
                </p>
                <Link href="/" className="inline-block text-sm text-primary-700 font-medium hover:underline">
                    На главную
                </Link>
            </div>
        </div>
    );
}
