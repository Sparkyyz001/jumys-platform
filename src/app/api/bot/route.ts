import { Bot, Context, webhookCallback } from "grammy";
import { createServerAdminClient } from "@/lib/supabase/serverAdminClient";
import { formatSalary, labelForEmployment } from "@/lib/constants";
import { enqueueNewApplicationNotification, flushNotifications } from "@/lib/telegram/send";
import { findProfileByPhone, getProfileByTelegramChatId, normalizePhone } from "@/lib/profile";
import { matchJobsByTextQuery, type MatchedJobFromQuery } from "@/lib/actions/matching";
import type { EmploymentType, Profile, TelegramJobFeedback } from "@/lib/types";
import { buildSeekerEmbeddingInput, generateEmbedding } from "@/lib/ai/embeddings";

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
    fullName?: string;
    step: "await_phone" | "await_full_name" | "await_district";
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

function getJobActionsKeyboard(jobId: string) {
    return [
        [
            { text: "Откликнуться ✅", callback_data: `apply_${jobId}` },
            { text: "Сохранить ⭐", callback_data: `save_${jobId}` },
        ],
        [
            { text: "Не интересно 🙈", callback_data: `dislike_${jobId}` },
            ...getOpenJobButton(jobId),
        ],
    ];
}

function getMainMenuKeyboard() {
    return {
        keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }], [{ text: "/vacancies" }, { text: "/profile" }]],
        resize_keyboard: true,
    };
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

async function createTelegramSeekerProfile(input: {
    chatId: number;
    phone: string;
    fullName: string;
    district: string;
}): Promise<{ profileId: string; created: boolean }> {
    const normalizedPhone = normalizePhone(input.phone);
    const existingByPhone = await findProfileByPhone(normalizedPhone);
    if (existingByPhone) {
        await linkTelegramToProfile(input.chatId, existingByPhone.id);
        return { profileId: existingByPhone.id, created: false };
    }

    const pseudoEmail = `tg_${input.chatId}_${Date.now()}@telegram.jumys.local`;
    const password = `Jumys_${crypto.randomUUID()}!`;
    const { data: createdUser, error: userError } = await admin.auth.admin.createUser({
        email: pseudoEmail,
        password,
        email_confirm: true,
        user_metadata: {
            source: "telegram_bot",
            telegram_chat_id: input.chatId,
            phone: normalizedPhone,
        },
    });
    if (userError || !createdUser.user) {
        throw new Error(userError?.message ?? "Failed to create auth user");
    }

    const profileId = createdUser.user.id;
    const { error: profileError } = await admin
        .from("profiles")
        .upsert(
            {
                id: profileId,
                role: "seeker",
                full_name: input.fullName,
                phone: `+${normalizedPhone}`,
                district: input.district,
                telegram_chat_id: input.chatId,
            },
            { onConflict: "id" }
        );
    if (profileError) throw new Error(profileError.message);

    const seekerText = buildSeekerEmbeddingInput({
        full_name: input.fullName,
        district: input.district,
        about: `Кандидат из Telegram. Ищет работу в ${input.district} мкр Актау.`,
        skills: [],
        desired_employment: "full",
        experience_years: 0,
    });
    const embedding = await generateEmbedding(seekerText);
    const { error: seekerError } = await admin.from("seeker_profiles").upsert(
        {
            profile_id: profileId,
            about: `Кандидат из Telegram. Ищет работу в ${input.district} мкр Актау.`,
            skills: [],
            experience_years: 0,
            desired_employment: "full",
            embedding: embedding as unknown as number[],
        },
        { onConflict: "profile_id" }
    );
    if (seekerError) throw new Error(seekerError.message);

    return { profileId, created: true };
}

async function sendMatches(ctx: Context, query: string) {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const linked = await getSeekerProfile(chatId);
    if (!linked || linked.role !== "seeker") {
        await ctx.reply("Сначала пройдите регистрацию соискателя через /start.");
        return;
    }

    const jobs = await matchJobsByTextQuery(query, { limit: 20 });
    if (jobs.length === 0) {
        await ctx.reply("По этому запросу пока нет подходящих вакансий.");
        return;
    }

    const jobIds = jobs.map((job) => job.id);
    const { data: feedbackRows } = await admin
        .from("telegram_job_feedback")
        .select("job_id, action")
        .eq("seeker_id", linked.id)
        .in("job_id", jobIds);
    const feedback = (feedbackRows as Pick<TelegramJobFeedback, "job_id" | "action">[] | null) ?? [];
    const feedbackByJob = new Map(feedback.map((item) => [item.job_id, item.action]));

    const ranked = jobs
        .map((job) => {
            const action = feedbackByJob.get(job.id);
            let adjusted = job.similarity;
            if (action === "saved") adjusted += 0.08;
            if (action === "disliked") adjusted -= 0.2;
            return { ...job, similarity: Math.max(0, Math.min(1, adjusted)) };
        })
        .filter((job) => !feedbackByJob.has(job.id) || feedbackByJob.get(job.id) !== "disliked")
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

    for (const job of ranked) {
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
                inline_keyboard: getJobActionsKeyboard(job.id),
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
                "Команды:\n/vacancies — подборка вакансий\n/saved — сохраненные вакансии\n/profile — ваш профиль"
            );
            return;
        }

        await ctx.reply(
            "Привет! Я — бот Jumys (AI-поиск работы в Актау).\n\n" +
                "Чтобы связать этот чат с вашим профилем, поделитесь номером телефона кнопкой ниже.\n" +
                (startPayload ? `Код привязки: ${startPayload}\n` : "") +
                "После этого сможете искать вакансии прямо в Telegram (например: \"Ищу работу баристой в 14 мкр\").",
            {
                reply_markup: getMainMenuKeyboard(),
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
            sessions.set(chatId, { phone: normalizePhone(contact.phone_number), step: "await_full_name" });
            await ctx.reply(
                "Профиль с таким номером не найден. Продолжим регистрацию прямо здесь.\n\nКак вас зовут? (Имя и фамилия)",
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
                "Команды:\n/vacancies — подборка вакансий\n/saved — сохраненные вакансии\n/profile — ваш профиль",
            { reply_markup: getMainMenuKeyboard() }
        );
    });
    bot.command("profile", async (ctx) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        const profile = await getProfileByTelegramChatId(chatId);
        if (!profile) {
            await ctx.reply("Профиль не найден. Нажмите /start и зарегистрируйтесь через Telegram.");
            return;
        }
        await ctx.reply(
            `👤 Профиль Jumys\n` +
            `ID: ${profile.id}\n` +
            `Роль: ${profile.role}\n` +
            `Имя: ${profile.full_name ?? "—"}\n` +
            `Телефон: ${profile.phone ?? "—"}\n` +
            `Район: ${profile.district ?? "—"} мкр.`,
            {
                reply_markup: {
                    inline_keyboard: [[{ text: "Открыть вакансии", web_app: { url: `${siteUrl || "https://jumys.kz"}/jobs` } }]],
                },
            }
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
            p_count: 20,
        });
        const slimMatches = (matches as VacancySlim[] | null) ?? [];
        const jobIds = slimMatches.map((m) => m.id);
        const { data: feedbackRows } = await admin
            .from("telegram_job_feedback")
            .select("job_id, action")
            .eq("seeker_id", profile.id)
            .in("job_id", jobIds);
        const feedback = (feedbackRows as Pick<TelegramJobFeedback, "job_id" | "action">[] | null) ?? [];
        const feedbackByJob = new Map(feedback.map((item) => [item.job_id, item.action]));
        const ranked = slimMatches
            .map((job) => {
                const action = feedbackByJob.get(job.id);
                let score = Number(job.similarity);
                if (action === "saved") score += 0.08;
                if (action === "disliked") score -= 0.2;
                return { ...job, similarity: Math.max(0, Math.min(1, score)) };
            })
            .filter((job) => feedbackByJob.get(job.id) !== "disliked")
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5);

        if (ranked.length === 0) {
            await ctx.reply("Пока нет подходящих вакансий. Загляните позже.");
            return;
        }

        for (const m of ranked) {
            const pct = Math.round(Number(m.similarity) * 100);
            const text = [
                `<b>${m.title}</b> — ${pct}% матч`,
                m.district ? `📍 ${m.district} мкр.` : null,
                `💰 ${formatSalary(m.salary_from, m.salary_to)}`,
                m.employment ? `⏱ ${labelForEmployment(m.employment)}` : null,
            ].filter(Boolean).join("\n");

            await ctx.reply(text, {
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: getJobActionsKeyboard(m.id) },
            });
        }
    });

    bot.command("saved", async (ctx) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        const profile = await getSeekerProfile(chatId);
        if (!profile || profile.role !== "seeker") {
            await ctx.reply("Сначала завершите регистрацию соискателя через /start.");
            return;
        }

        const { data: savedRows } = await admin
            .from("telegram_job_feedback")
            .select("job_id")
            .eq("seeker_id", profile.id)
            .eq("action", "saved")
            .order("updated_at", { ascending: false })
            .limit(10);
        const savedIds = ((savedRows as Array<{ job_id: string }> | null) ?? []).map((row) => row.job_id);
        if (savedIds.length === 0) {
            await ctx.reply("У вас пока нет сохраненных вакансий. Нажимайте «Сохранить ⭐» в подборке.");
            return;
        }

        const { data: jobs } = await admin
            .from("jobs")
            .select("id, title, district, salary_from, salary_to, employment")
            .in("id", savedIds);
        const savedJobs = (jobs as VacancySlim[] | null) ?? [];
        for (const job of savedJobs) {
            await ctx.reply(
                [
                    `<b>${job.title}</b>`,
                    job.district ? `📍 ${job.district} мкр.` : null,
                    `💰 ${formatSalary(job.salary_from, job.salary_to)}`,
                    job.employment ? `⏱ ${labelForEmployment(job.employment)}` : null,
                ].filter(Boolean).join("\n"),
                {
                    parse_mode: "HTML",
                    reply_markup: { inline_keyboard: getJobActionsKeyboard(job.id) },
                }
            );
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
                reply_markup: getMainMenuKeyboard(),
            });
            return;
        }

        if (onboarding?.step === "await_phone") {
            await ctx.reply("Для продолжения нажмите кнопку \"Поделиться номером\".");
            return;
        }

        if (onboarding?.step === "await_full_name") {
            if (messageText.length < 3) {
                await ctx.reply("Имя слишком короткое. Пример: Айдана Турсынова.");
                return;
            }
            sessions.set(chatId, { ...onboarding, fullName: messageText, step: "await_district" });
            await ctx.reply("Отлично! Теперь укажите ваш микрорайон в Актау (например: 14 мкр).");
            return;
        }

        if (onboarding?.step === "await_district") {
            const district = parseDistrict(messageText);
            if (!district) {
                await ctx.reply("Не распознал микрорайон. Пример: 14 мкр.");
                return;
            }
            if (!onboarding.phone || !onboarding.fullName) {
                sessions.set(chatId, { step: "await_phone" });
                await ctx.reply("Давайте начнем заново. Нажмите кнопку и отправьте номер телефона.");
                return;
            }

            try {
                const created = await createTelegramSeekerProfile({
                    chatId,
                    phone: onboarding.phone,
                    fullName: onboarding.fullName,
                    district,
                });
                sessions.delete(chatId);
                await ctx.reply(
                    created.created
                        ? "✅ Готово! Мы зарегистрировали вас в Jumys прямо через Telegram и подключили AI-поиск вакансий."
                        : "✅ Профиль найден и Telegram успешно привязан.",
                    {
                        reply_markup: {
                            inline_keyboard: [[{ text: "Смотреть вакансии", web_app: { url: `${siteUrl || "https://jumys.kz"}/jobs` } }]],
                        },
                    }
                );
            } catch (error) {
                const detail = error instanceof Error ? error.message : "Registration failed";
                await ctx.reply(`Не удалось завершить регистрацию: ${detail}`);
            }
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

        if (data.startsWith("save_") || data.startsWith("dislike_")) {
            const isSave = data.startsWith("save_");
            const jobId = data.slice(isSave ? 5 : 8);
            const action: TelegramJobFeedback["action"] = isSave ? "saved" : "disliked";

            const { error } = await admin
                .from("telegram_job_feedback")
                .upsert(
                    {
                        seeker_id: profile.id,
                        job_id: jobId,
                        action,
                    },
                    { onConflict: "seeker_id,job_id" }
                );
            if (error) {
                await ctx.answerCallbackQuery({ text: "Не удалось сохранить выбор" });
                return;
            }
            await ctx.answerCallbackQuery({ text: isSave ? "Сохранено в избранное ⭐" : "Учту, больше такого не показываю 🙈" });
            return;
        }

        await ctx.answerCallbackQuery();
    });
}

if (bot) {
    bot.catch((err) => {
        console.error("telegram bot unhandled error", err.error);
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
