import { Bot } from "grammy";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";

let _bot: Bot | null = null;

export function getBot(): Bot | null {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return null;
    if (!_bot) _bot = new Bot(token);
    return _bot;
}

export async function enqueueJobMatchNotifications(
    jobId: string,
    topN = 10
): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createServerAdminClient() as any;
    const { data: matches } = await admin.rpc("match_seekers_for_job", {
        p_job_id: jobId,
        p_count: topN,
    });

    const matchRows = (matches ?? []) as Array<{ profile_id: string; similarity: number }>;
    if (matchRows.length === 0) return 0;

    const { data: job } = await admin
        .from("jobs")
        .select("id, title, district, salary_from, salary_to")
        .eq("id", jobId)
        .maybeSingle();
    if (!job) return 0;

    // Only seekers with telegram_chat_id
    const seekerIds = matchRows.map((m: { profile_id: string }) => m.profile_id);
    const { data: eligible } = await admin
        .from("profiles")
        .select("id, telegram_chat_id")
        .in("id", seekerIds)
        .not("telegram_chat_id", "is", null);

    if (!eligible || eligible.length === 0) return 0;

    const eligibleRows = (eligible ?? []) as Array<{ id: string }>;
    const eligibleSet = new Set(eligibleRows.map((e: { id: string }) => e.id));
    const strong = matchRows.filter((m: { profile_id: string; similarity: number }) => m.similarity >= 0.6 && eligibleSet.has(m.profile_id));
    if (strong.length === 0) return 0;

    const rows = strong.map((m: { profile_id: string; similarity: number }) => ({
        recipient_id: m.profile_id,
        kind: "new_job_match" as const,
        payload: {
            job_id: jobId,
            title: job.title,
            district: job.district,
            salary_from: job.salary_from,
            salary_to: job.salary_to,
            similarity: m.similarity,
        },
    }));
    const { error } = await admin.from("notifications").insert(rows);
    if (error) {
        console.error("enqueueJobMatchNotifications insert failed", error);
        return 0;
    }
    return rows.length;
}

export async function enqueueNewApplicationNotification(
    jobId: string,
    seekerId: string
): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createServerAdminClient() as any;
    const { data: job } = await admin
        .from("jobs")
        .select("id, title, employer_id")
        .eq("id", jobId)
        .maybeSingle();
    if (!job?.employer_id) return;

    const { data: employerProfile } = await admin
        .from("profiles")
        .select("telegram_chat_id")
        .eq("id", job.employer_id)
        .maybeSingle();
    if (!employerProfile?.telegram_chat_id) return;

    const { data: seekerProfile } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", seekerId)
        .maybeSingle();

    await admin.from("notifications").insert({
        recipient_id: job.employer_id,
        kind: "new_application",
        payload: {
            job_id: jobId,
            job_title: job.title,
            seeker_name: seekerProfile?.full_name ?? "Соискатель",
        },
    });
}

function formatSalaryRange(from: number | null | undefined, to: number | null | undefined): string {
    if (!from && !to) return "зарплата не указана";
    if (from && to) return `${from.toLocaleString("ru-RU")} – ${to.toLocaleString("ru-RU")} ₸`;
    if (from) return `от ${from.toLocaleString("ru-RU")} ₸`;
    return `до ${to!.toLocaleString("ru-RU")} ₸`;
}

export async function processNotificationQueue(limit = 50): Promise<number> {
    const bot = getBot();
    if (!bot) return 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createServerAdminClient() as any;
    const { data: pending, error } = await admin
        .from("notifications")
        .select("id, recipient_id, kind, payload")
        .is("sent_at", null)
        .order("created_at", { ascending: true })
        .limit(limit);
    if (error) {
        console.error("fetch pending notifications failed", error);
        return 0;
    }
    if (!pending || pending.length === 0) return 0;

    const pendingRows = (pending ?? []) as Array<{ id: string; recipient_id: string; kind: string; payload: unknown }>;
    const recipientIds = Array.from(new Set(pendingRows.map((n: { recipient_id: string }) => n.recipient_id)));
    const { data: recipientsData } = await admin
        .from("profiles")
        .select("id, telegram_chat_id")
        .in("id", recipientIds);
    const chatIdByProfile = new Map<string, number>();
    (recipientsData as Array<{ id: string; telegram_chat_id: number | null }> | null)?.forEach((r) => {
        if (r.telegram_chat_id) chatIdByProfile.set(r.id, Number(r.telegram_chat_id));
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    let sent = 0;

    for (const n of pendingRows) {
        const chatId = chatIdByProfile.get(n.recipient_id);
        if (!chatId) {
            await admin.from("notifications").update({ sent_at: new Date().toISOString() }).eq("id", n.id);
            continue;
        }

        try {
            if (n.kind === "new_job_match") {
                const p = n.payload as {
                    job_id: string; title: string; district: string | null;
                    salary_from: number | null; salary_to: number | null; similarity: number;
                };
                const pct = Math.round(p.similarity * 100);
                const text = [
                    `🎯 <b>Новая подходящая вакансия (${pct}% совпадение)</b>`,
                    `<b>${p.title}</b>`,
                    p.district ? `📍 ${p.district} мкр.` : null,
                    `💰 ${formatSalaryRange(p.salary_from, p.salary_to)}`,
                ].filter(Boolean).join("\n");

                await bot.api.sendMessage(chatId, text, {
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: [[
                            { text: "Подробнее", callback_data: `view_${p.job_id}` },
                            { text: "Откликнуться", callback_data: `apply_${p.job_id}` },
                        ], siteUrl ? [
                            { text: "Открыть на сайте", url: `${siteUrl}/jobs/${p.job_id}` },
                        ] : []].filter(row => row.length > 0),
                    },
                });
            } else if (n.kind === "new_application") {
                const p = n.payload as {
                    job_id: string; job_title: string; seeker_name: string;
                };
                const text = [
                    `📥 <b>Новый отклик</b>`,
                    `Вакансия: <b>${p.job_title}</b>`,
                    `Кандидат: ${p.seeker_name}`,
                ].join("\n");

                const keyboard = siteUrl
                    ? [[{ text: "Посмотреть в кабинете", url: `${siteUrl}/dashboard/applications` }]]
                    : [];

                await bot.api.sendMessage(chatId, text, {
                    parse_mode: "HTML",
                    reply_markup: keyboard.length ? { inline_keyboard: keyboard } : undefined,
                });
            }

            await admin
                .from("notifications")
                .update({ sent_at: new Date().toISOString() })
                .eq("id", n.id);
            sent++;
        } catch (err) {
            console.error("telegram send failed", err);
        }
    }

    return sent;
}

export async function flushNotifications(): Promise<void> {
    if (!process.env.TELEGRAM_BOT_TOKEN) return;
    await processNotificationQueue().catch(err => console.error("flushNotifications failed", err));
}
