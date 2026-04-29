import { Bot, Context, webhookCallback } from "grammy";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { formatSalary, labelForEmployment } from "@/lib/constants";
import { enqueueNewApplicationNotification, flushNotifications } from "@/lib/telegram/send";
import { findProfileByPhone, getProfileByTelegramChatId, normalizePhone } from "@/lib/profile";
import { matchJobsByTextQuery, type MatchedJobFromQuery } from "@/lib/actions/matching";
import type { EmploymentType, Profile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = token ? new Bot(token) : null;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const admin = createServerAdminClient();

type Role = Profile["role"];
type BotProfile = Pick<Profile, "id" | "role" | "district" | "telegram_link_token_expires_at">;
type VacancySlim = {
    id: string;
    title: string;
    similarity: number;
    district: string | null;
    salary_from: number | null;
    salary_to: number | null;
    employment: EmploymentType | null;
};

type OnboardingSession = {
    phone?: string;
    district?: string;
    step: "await_phone" | "await_district";
};

const sessions = new Map<number, OnboardingSession>();

function parseDistrict(text: string): string | null {
    const match = text.trim().toLowerCase().match(/(\d{1,2})\s*(мкр|микрорайон)?/i);
    return match?.[1] ?? null;
}

function getOpenJobButton(jobId: string) {
    const appUrl = `${siteUrl || "https://jumys.kz"}/dashboard/jobs/${jobId}`;
    return [{ text: "Открыть вакансию", web_app: { url: appUrl } }];
}

async function linkTelegramToProfile(chatId: number, profileId: string): Promise<void> {
    const { error: clearError } = await admin
        .from("profiles")
        .update({ telegram_chat_id: null })
        .eq("telegram_chat_id", chatId)
        .neq("id", profileId);
    if (clearError) console.error("clear previous telegram_chat_id failed", clearError);

    const { error } = await admin
        .from("profiles")
        .update({ telegram_chat_id: chatId })
        .eq("id", profileId);
    if (error) throw new Error(error.message);
}

async function getSeekerProfile(chatId: number): Promise<{ id: string; role: Role } | null> {
    const profile = await getProfileByTelegramChatId(chatId);
    return profile ? { id: profile.id, role: profile.role } : null;
}

async function sendMatches(ctx: Context, query: string) {
    const jobs = await matchJobsByTextQuery(query, { limit: 5 });
    if (jobs.length === 0) {
        await ctx.reply("По этому запросу пока нет подходящих вакансий.");
        return;
    }

    for (const job of jobs) {
        const pct = Math.round(Number(job.similarity) * 100);
        const text = [
            `<b>${job.title}</b> — ${pct}% матч`,
            job.district ? `📍 ${job.district} мкр.` : null,
            `💰 ${formatSalary(job.salary_from, job.salary_to)}`,
            job.employment ? `⏱ ${labelForEmployment(job.employment)}` : null,
        ].filter(Boolean).join("\n");

        await ctx.reply(text, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [getOpenJobButton(job.id)],
            },
        });
    }
}

if (bot) {
    bot.command("start", async (ctx) => {
        const startPayload = typeof ctx.match === "string" ? ctx.match.trim() : "";
        const chatId = ctx.chat?.id;

        if (startPayload && chatId) {
            const { data: profile } = await admin
                .from("profiles")
                .select("id, telegram_link_token_expires_at")
                .eq("telegram_link_token", startPayload)
                .maybeSingle();
            const linkedProfile = (profile as BotProfile | null) ?? null;

            if (!linkedProfile) {
                await ctx.reply("Ссылка привязки недействительна. Сгенерируйте новую в настройках профиля.");
                return;
            }

            const expiresAt = linkedProfile.telegram_link_token_expires_at
                ? new Date(linkedProfile.telegram_link_token_expires_at).getTime()
                : 0;

            if (!expiresAt || expiresAt < Date.now()) {
                await ctx.reply("Срок действия ссылки истек. Сгенерируйте новую в настройках профиля.");
                return;
            }

            await linkTelegramToProfile(chatId, linkedProfile.id);

            const { error } = await admin
                .from("profiles")
                .update({
                    telegram_link_token: null,
                    telegram_link_token_expires_at: null,
                })
                .eq("id", linkedProfile.id);

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
                "После этого сможете искать вакансии прямо в Telegram (например: \"Ищу работу баристой в 14 мкр\").",
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

        const profile = await findProfileByPhone(contact.phone_number);
        if (!profile) {
            sessions.set(chatId, { phone: normalizePhone(contact.phone_number), step: "await_district" });
            await ctx.reply(
                "Профиль с таким номером не найден. Продолжим мини-онбординг: укажите ваш микрорайон в Актау (например, 14 мкр).",
            );
            return;
        }

        try {
            await linkTelegramToProfile(chatId, profile.id);
            sessions.delete(chatId);
        } catch (error) {
            console.error("link telegram failed", error);
            const detail = error instanceof Error ? error.message : "DB error";
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

        const profile = await getSeekerProfile(chatId);

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
        const slimMatches = (matches as VacancySlim[] | null) ?? [];

        if (slimMatches.length === 0) {
            await ctx.reply("Пока нет подходящих вакансий. Загляните позже.");
            return;
        }

        for (const m of slimMatches) {
            const pct = Math.round(Number(m.similarity) * 100);
            const text = [
                `<b>${m.title}</b> — ${pct}% матч`,
                m.district ? `📍 ${m.district} мкр.` : null,
                `💰 ${formatSalary(m.salary_from, m.salary_to)}`,
                m.employment ? `⏱ ${labelForEmployment(m.employment)}` : null,
            ].filter(Boolean).join("\n");

            await ctx.reply(text, {
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: [getOpenJobButton(m.id)] },
            });
        }
    });

    bot.on("message:text", async (ctx) => {
        const chatId = ctx.chat?.id;
        const messageText = ctx.message.text.trim();
        if (!chatId || !messageText || messageText.startsWith("/")) return;

        const linkedProfile = await getProfileByTelegramChatId(chatId);
        const onboarding = sessions.get(chatId);
        if (linkedProfile && onboarding) sessions.delete(chatId);
        if (!linkedProfile && !onboarding) {
            sessions.set(chatId, { step: "await_phone" });
            await ctx.reply("Сначала отправьте ваш номер телефона кнопкой ниже.", {
                reply_markup: {
                    keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }]],
                    resize_keyboard: true,
                    one_time_keyboard: true,
                },
            });
            return;
        }

        if (onboarding?.step === "await_phone") {
            await ctx.reply("Для продолжения нажмите кнопку \"Поделиться номером\".");
            return;
        }

        if (onboarding?.step === "await_district") {
            const district = parseDistrict(messageText);
            if (!district) {
                await ctx.reply("Не распознал микрорайон. Пример: 14 мкр.");
                return;
            }

            sessions.set(chatId, { ...onboarding, district });
            await ctx.reply(
                "Спасибо! Завершите регистрацию на сайте, чтобы мы создали профиль, и затем привяжите Telegram через /start.\n" +
                `Данные сохранены: телефон ${onboarding.phone ?? "не указан"}, район ${district} мкр.`
            );
            return;
        }

        try {
            await sendMatches(ctx, messageText);
        } catch (error) {
            const detail = error instanceof Error ? error.message : "AI search error";
            await ctx.reply(`Не удалось выполнить AI-поиск: ${detail}`);
        }
    });

    bot.on("callback_query:data", async (ctx) => {
        const data = ctx.callbackQuery.data;
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const profile = await getSeekerProfile(chatId);

        if (!profile) {
            await ctx.answerCallbackQuery({ text: "Сначала привяжите Telegram через /start" });
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
            const found = (scoreRows as MatchedJobFromQuery[] | null)
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
