import { Bot, webhookCallback } from "grammy";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { formatSalary, labelForEmployment } from "@/lib/constants";
import { enqueueNewApplicationNotification, flushNotifications } from "@/lib/telegram/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = token ? new Bot(token) : null;

function adminClient() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createServerAdminClient() as any;
}

function normalizePhone(phone: string): string {
    let digits = phone.replace(/\D/g, "");
    if (digits.startsWith("8") && digits.length === 11) digits = "7" + digits.slice(1);
    return digits;
}

async function findProfileByPhone(phone: string): Promise<string | null> {
    const admin = adminClient();
    const normalized = normalizePhone(phone);
    // Try exact match, and also match by last 10 digits
    const { data } = await admin
        .from("profiles")
        .select("id, phone");
    const rows = (data ?? []) as Array<{ id: string; phone: string | null }>;
    if (rows.length === 0) return null;
    for (const row of rows) {
        if (!row.phone) continue;
        const rowDigits = normalizePhone(row.phone);
        if (rowDigits === normalized) return row.id;
        if (rowDigits.length >= 10 && normalized.length >= 10 &&
            rowDigits.slice(-10) === normalized.slice(-10)) return row.id;
    }
    return null;
}

if (bot) {
    bot.command("start", async (ctx) => {
        const startPayload = typeof ctx.match === "string" ? ctx.match.trim() : "";
        const chatId = ctx.chat?.id;

        if (startPayload && chatId) {
            const admin = adminClient();
            const { data: profile } = await admin
                .from("profiles")
                .select("id, telegram_link_token_expires_at")
                .eq("telegram_link_token", startPayload)
                .maybeSingle();

            if (!profile) {
                await ctx.reply("Ссылка привязки недействительна. Сгенерируйте новую в настройках профиля.");
                return;
            }

            const expiresAt = profile.telegram_link_token_expires_at
                ? new Date(profile.telegram_link_token_expires_at).getTime()
                : 0;

            if (!expiresAt || expiresAt < Date.now()) {
                await ctx.reply("Срок действия ссылки истек. Сгенерируйте новую в настройках профиля.");
                return;
            }

            // Сначала отвязываем chatId от любого другого профиля (UNIQUE constraint)
            const { error: clearError } = await admin
                .from("profiles")
                .update({ telegram_chat_id: null })
                .eq("telegram_chat_id", chatId)
                .neq("id", profile.id);
            if (clearError) {
                console.error("clear previous telegram_chat_id failed", clearError);
            }

            const { error } = await admin
                .from("profiles")
                .update({
                    telegram_chat_id: chatId,
                    telegram_link_token: null,
                    telegram_link_token_expires_at: null,
                })
                .eq("id", profile.id);

            if (error) {
                console.error("link by token failed", error);
                const detail = (error as { message?: string }).message ?? "";
                await ctx.reply(
                    `Не удалось завершить привязку Telegram: ${detail || "DB error"}. ` +
                    "Попробуйте сгенерировать новую ссылку в настройках профиля."
                );
                return;
            }

            await ctx.reply(
                "✅ Telegram успешно подтвержден и привязан к вашему профилю.\n" +
                "Теперь уведомления и команды бота работают автоматически.\n\n" +
                "Команды:\n/vacancies — подборка вакансий"
            );
            return;
        }

        await ctx.reply(
            "Привет! Я — бот Jumys (AI-поиск работы в Актау).\n\n" +
                "Чтобы связать этот чат с вашим профилем, поделитесь номером телефона кнопкой ниже.\n" +
                (startPayload ? `Код привязки: ${startPayload}\n` : "") +
                "После этого вы сможете получать уведомления и использовать команду /vacancies.",
            {
                reply_markup: {
                    keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }]],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            }
        );
    });

    bot.on(":contact", async (ctx) => {
        const contact = ctx.message?.contact;
        if (!contact || !contact.phone_number) return;
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const profileId = await findProfileByPhone(contact.phone_number);
        if (!profileId) {
            await ctx.reply(
                "Не нашли профиль с таким номером. Сначала зарегистрируйтесь на сайте и укажите этот же телефон.",
                { reply_markup: { remove_keyboard: true } }
            );
            return;
        }

        const admin = adminClient();
        const { error: clearError } = await admin
            .from("profiles")
            .update({ telegram_chat_id: null })
            .eq("telegram_chat_id", chatId)
            .neq("id", profileId);
        if (clearError) {
            console.error("clear previous telegram_chat_id failed", clearError);
        }

        const { error } = await admin
            .from("profiles")
            .update({ telegram_chat_id: chatId })
            .eq("id", profileId);

        if (error) {
            console.error("link telegram failed", error);
            const detail = (error as { message?: string }).message ?? "";
            await ctx.reply(
                `Не удалось привязать Telegram: ${detail || "DB error"}. ` +
                "Если ошибка повторяется — напишите в /support."
            );
            return;
        }

        await ctx.reply(
            "✅ Telegram привязан! Теперь вы будете получать уведомления о подходящих вакансиях.\n\n" +
                "Команды:\n/vacancies — подборка вакансий",
            { reply_markup: { remove_keyboard: true } }
        );
    });

    bot.command("vacancies", async (ctx) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const admin = adminClient();
        const { data: profile } = await admin
            .from("profiles")
            .select("id, role")
            .eq("telegram_chat_id", chatId)
            .maybeSingle();

        if (!profile) {
            await ctx.reply("Сначала привяжите Telegram через /start.");
            return;
        }
        if (profile.role !== "seeker") {
            await ctx.reply("Команда /vacancies доступна только соискателям.");
            return;
        }

        const { data: matches } = await admin.rpc("match_jobs_for_seeker", {
            p_seeker_id: profile.id,
            p_count: 5,
        });
        const slimMatches = (matches as Array<{ id: string; title: string; similarity: number }> | null) ?? [];

        if (slimMatches.length === 0) {
            await ctx.reply("Пока нет подходящих вакансий. Загляните позже.");
            return;
        }

        for (const m of slimMatches) {
            const { data: job } = await admin
                .from("jobs")
                .select("district, salary_from, salary_to, employment")
                .eq("id", m.id)
                .maybeSingle();
            const pct = Math.round(Number(m.similarity) * 100);
            const text = [
                `<b>${m.title}</b> — ${pct}% матч`,
                job?.district ? `📍 ${job.district} мкр.` : null,
                `💰 ${formatSalary(job?.salary_from ?? null, job?.salary_to ?? null)}`,
                job?.employment ? `⏱ ${labelForEmployment(job.employment)}` : null,
            ].filter(Boolean).join("\n");

            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const keyboard: any[][] = [[
                { text: "Подробнее", callback_data: `view_${m.id}` },
                { text: "Откликнуться", callback_data: `apply_${m.id}` },
            ]];
            if (siteUrl) {
                keyboard.push([{ text: "Открыть на сайте", url: `${siteUrl}/jobs/${m.id}` }]);
            }

            await ctx.reply(text, {
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: keyboard },
            });
        }
    });

    bot.on("callback_query:data", async (ctx) => {
        const data = ctx.callbackQuery.data;
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const admin = adminClient();
        const { data: profile } = await admin
            .from("profiles")
            .select("id, role")
            .eq("telegram_chat_id", chatId)
            .maybeSingle();

        if (!profile) {
            await ctx.answerCallbackQuery({ text: "Сначала привяжите Telegram через /start" });
            return;
        }

        if (data.startsWith("view_")) {
            const jobId = data.slice(5);
            const { data: job } = await admin
                .from("jobs")
                .select("*, employer_profiles:employer_profiles!jobs_employer_id_fkey(company_name)")
                .eq("id", jobId)
                .maybeSingle();
            if (!job) {
                await ctx.answerCallbackQuery({ text: "Вакансия не найдена" });
                return;
            }
            const company = (job as unknown as { employer_profiles: { company_name: string } | null }).employer_profiles?.company_name;
            const text = [
                `<b>${job.title}</b>`,
                company ? `🏢 ${company}` : null,
                job.district ? `📍 ${job.district} мкр.` : null,
                `💰 ${formatSalary(job.salary_from, job.salary_to)}`,
                job.employment ? `⏱ ${labelForEmployment(job.employment)}` : null,
                "",
                job.description.slice(0, 800),
            ].filter(Boolean).join("\n");
            await ctx.answerCallbackQuery();
            await ctx.reply(text, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [[
                        { text: "Откликнуться", callback_data: `apply_${jobId}` },
                    ]],
                },
            });
            return;
        }

        if (data.startsWith("apply_")) {
            const jobId = data.slice(6);
            if (profile.role !== "seeker") {
                await ctx.answerCallbackQuery({ text: "Откликаться могут только соискатели" });
                return;
            }

            const { data: existing } = await admin
                .from("applications")
                .select("id")
                .eq("job_id", jobId)
                .eq("seeker_id", profile.id)
                .maybeSingle();

            if (existing) {
                await ctx.answerCallbackQuery({ text: "Вы уже откликнулись" });
                return;
            }

            // Compute match score
            let matchScore: number | null = null;
            const { data: scoreRows } = await admin.rpc("match_jobs_for_seeker", {
                p_seeker_id: profile.id,
                p_count: 1000,
            });
            const found = (scoreRows as Array<{ id: string; similarity: number }> | null)
                ?.find(r => r.id === jobId);
            if (found) matchScore = Math.max(0, Math.min(1, Number(found.similarity)));

            const { error } = await admin.from("applications").insert({
                job_id: jobId,
                seeker_id: profile.id,
                message: "Отклик из Telegram",
                match_score: matchScore,
            });

            if (error) {
                await ctx.answerCallbackQuery({ text: "Ошибка при отправке отклика" });
                return;
            }

            await enqueueNewApplicationNotification(jobId, profile.id);
            flushNotifications().catch((err) => console.error("flush notifications failed", err));

            await ctx.answerCallbackQuery({ text: "Отклик отправлен ✅" });
            return;
        }

        await ctx.answerCallbackQuery();
    });
}

async function noBot(): Promise<Response> {
    return new Response("Bot not configured", { status: 503 });
}

export const POST = bot
    ? webhookCallback(bot, "std/http")
    : noBot;

export async function GET(): Promise<Response> {
    return new Response("Jumys bot webhook is alive", { status: 200 });
}
