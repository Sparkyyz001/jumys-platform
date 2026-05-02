import { Bot, Context, webhookCallback, InlineKeyboard } from "grammy";
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
const SITE = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://jumys.kz";
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

// ── Search cache (5 min TTL per query) ──────────────────────────────────────
const searchCache = new Map<string, { results: MatchedJobFromQuery[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function cachedMatchJobs(query: string): Promise<MatchedJobFromQuery[]> {
    const key = query.toLowerCase().trim();
    const hit = searchCache.get(key);
    if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.results;
    const results = await matchJobsByTextQuery(query, { limit: 20 });
    searchCache.set(key, { results, ts: Date.now() });
    if (searchCache.size > 200) {
        // evict oldest entry
        const first = searchCache.keys().next().value;
        if (first !== undefined) searchCache.delete(first);
    }
    return results;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function log(level: "info" | "warn" | "error", msg: string, extra?: unknown) {
    const prefix = `[bot][${level.toUpperCase()}]`;
    if (level === "error") console.error(prefix, msg, extra ?? "");
    else console.log(prefix, msg, extra ?? "");
}

function parseDistrict(text: string): string | null {
    const match = text.trim().toLowerCase().match(/(\d{1,2})\s*(мкр|микрорайон)?/i);
    return match?.[1] ?? null;
}

function jobActionsKeyboard(jobId: string) {
    return new InlineKeyboard()
        .text("Откликнуться ✅", `apply_${jobId}`)
        .text("Сохранить ⭐", `save_${jobId}`)
        .row()
        .text("Не интересно 🙈", `dislike_${jobId}`)
        .url("Открыть на сайте →", `${SITE}/jobs/${jobId}`);
}

function mainMenuKeyboard() {
    return {
        keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }], [{ text: "/vacancies" }, { text: "/profile" }]],
        resize_keyboard: true,
    };
}

async function sendTyping(ctx: Context) {
    if (ctx.chat?.id) {
        await ctx.api.sendChatAction(ctx.chat.id, "typing").catch(() => null);
    }
}

const HELP_TEXT =
    "📋 <b>Команды Jumys:</b>\n\n" +
    "/start — Подключить Telegram к профилю\n" +
    "/vacancies — Персональная подборка вакансий\n" +
    "/saved — Сохранённые вакансии\n" +
    "/profile — Ваш профиль\n" +
    "/help — Эта справка\n\n" +
    "💬 <b>Свободный поиск:</b>\n" +
    "Просто напишите что ищете — например:\n" +
    "<i>«Ищу работу баристой в 14 мкр»</i>\n" +
    "<i>«Повар полный день»</i>\n" +
    "<i>«Охранник»</i>";

// ── DB helpers ────────────────────────────────────────────────────────────────
async function linkTelegramToProfile(chatId: number, profileId: string): Promise<void> {
    const { error: clearError } = await admin
        .from("profiles")
        .update({ telegram_chat_id: null })
        .eq("telegram_chat_id", chatId)
        .neq("id", profileId);
    if (clearError) log("error", "clear previous telegram_chat_id failed", clearError);

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

    log("info", "new telegram seeker profile created", { profileId, chatId: input.chatId });
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

    await sendTyping(ctx);
    const jobs = await cachedMatchJobs(query);

    if (jobs.length === 0) {
        await ctx.reply(
            "😔 По этому запросу пока нет подходящих вакансий.\n\n" +
            "Попробуйте:\n• /vacancies — персональная подборка\n• Другой запрос: «повар», «охранник», «водитель»"
        );
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
        .filter((job) => feedbackByJob.get(job.id) !== "disliked")
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

    if (ranked.length === 0) {
        await ctx.reply("По запросу ничего не нашлось — всё уже отмечено как «не интересно». Попробуйте /vacancies для обновлённой подборки.");
        return;
    }

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
            reply_markup: jobActionsKeyboard(job.id),
        });
    }
}

// ── Bot handlers ──────────────────────────────────────────────────────────────
if (bot) {
    // /start — link via token or show registration
    bot.command("start", async (ctx) => {
        const startPayload = typeof ctx.match === "string" ? ctx.match.trim() : "";
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        log("info", "/start", { chatId, hasPayload: Boolean(startPayload) });

        if (startPayload) {
            const { data: profile } = await admin
                .from("profiles")
                .select("id, telegram_link_token_expires_at")
                .eq("telegram_link_token", startPayload)
                .maybeSingle();
            const linkedProfile = (profile as BotProfile | null) ?? null;

            if (!linkedProfile) {
                await ctx.reply("❌ Ссылка привязки недействительна. Сгенерируйте новую в настройках профиля.");
                return;
            }

            const expiresAt = linkedProfile.telegram_link_token_expires_at
                ? new Date(linkedProfile.telegram_link_token_expires_at).getTime()
                : 0;

            if (!expiresAt || expiresAt < Date.now()) {
                await ctx.reply("⏰ Срок действия ссылки истёк. Сгенерируйте новую в настройках профиля.");
                return;
            }

            await linkTelegramToProfile(chatId, linkedProfile.id);

            const { error } = await admin
                .from("profiles")
                .update({ telegram_link_token: null, telegram_link_token_expires_at: null })
                .eq("id", linkedProfile.id);

            if (error) {
                log("error", "link by token failed", error);
                await ctx.reply("⚠️ Не удалось завершить привязку. Попробуйте сгенерировать новую ссылку в настройках.");
                return;
            }

            log("info", "account linked via token", { profileId: linkedProfile.id, chatId });
            await ctx.reply(
                "✅ <b>Telegram подключён!</b>\n\n" +
                "Теперь вы будете получать уведомления о вакансиях и можете откликаться прямо здесь.\n\n" +
                HELP_TEXT,
                {
                    parse_mode: "HTML",
                    reply_markup: new InlineKeyboard().url("Открыть личный кабинет →", `${SITE}/dashboard`),
                }
            );
            return;
        }

        await ctx.reply(
            "👋 <b>Добро пожаловать в Jumys!</b>\n\n" +
            "Я помогу найти работу в Актау с помощью AI.\n\n" +
            "Поделитесь номером телефона кнопкой ниже, чтобы привязать аккаунт — " +
            "или просто напишите что ищете: «баристой в 14 мкр», «охранник», «водитель».",
            { parse_mode: "HTML", reply_markup: mainMenuKeyboard() }
        );
    });

    // /help
    bot.command("help", async (ctx) => {
        await ctx.reply(HELP_TEXT, { parse_mode: "HTML" });
    });

    // /profile
    bot.command("profile", async (ctx) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        const profile = await getProfileByTelegramChatId(chatId);
        if (!profile) {
            await ctx.reply("Профиль не найден. Нажмите /start и зарегистрируйтесь.", {
                reply_markup: new InlineKeyboard().url("Зарегистрироваться →", `${SITE}/auth/register`),
            });
            return;
        }
        await ctx.reply(
            `👤 <b>Профиль Jumys</b>\n\n` +
            `Роль: ${profile.role === "seeker" ? "Соискатель" : "Работодатель"}\n` +
            `Имя: ${profile.full_name ?? "—"}\n` +
            `Телефон: ${profile.phone ?? "—"}\n` +
            `Район: ${profile.district ? `${profile.district} мкр.` : "—"}`,
            {
                parse_mode: "HTML",
                reply_markup: new InlineKeyboard()
                    .url("Личный кабинет →", `${SITE}/dashboard`)
                    .row()
                    .url("Все вакансии →", `${SITE}/jobs`),
            }
        );
    });

    // /vacancies — personalised recommendations
    bot.command("vacancies", async (ctx) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        const profile = await getSeekerProfile(chatId);

        if (!profile) {
            await ctx.reply("Сначала привяжите Telegram через /start.", {
                reply_markup: mainMenuKeyboard(),
            });
            return;
        }
        if (profile.role !== "seeker") {
            await ctx.reply("Команда /vacancies доступна только соискателям.");
            return;
        }

        await sendTyping(ctx);
        log("info", "/vacancies", { seekerId: profile.id });

        // Fetch matches + feedback in parallel
        const [matchResult, feedbackResult] = await Promise.all([
            admin.rpc("match_jobs_for_seeker", { p_seeker_id: profile.id, p_count: 20 }),
            admin
                .from("telegram_job_feedback")
                .select("job_id, action")
                .eq("seeker_id", profile.id),
        ]);

        const slimMatches = (matchResult.data as VacancySlim[] | null) ?? [];
        const feedback = (feedbackResult.data as Pick<TelegramJobFeedback, "job_id" | "action">[] | null) ?? [];
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
            await ctx.reply(
                "😔 Пока нет подходящих вакансий.\n\nПопробуйте зайти позже или поищите вручную — просто напишите профессию.",
                { reply_markup: new InlineKeyboard().url("Все вакансии →", `${SITE}/jobs`) }
            );
            return;
        }

        await ctx.reply(`🎯 <b>Подборка для вас — ${ranked.length} вакансий</b>`, { parse_mode: "HTML" });

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
                reply_markup: jobActionsKeyboard(m.id),
            });
        }
    });

    // /saved — bookmarked jobs
    bot.command("saved", async (ctx) => {
        const chatId = ctx.chat?.id;
        if (!chatId) return;
        const profile = await getSeekerProfile(chatId);
        if (!profile || profile.role !== "seeker") {
            await ctx.reply("Сначала завершите регистрацию соискателя через /start.");
            return;
        }

        const { data: savedRows, error } = await admin
            .from("telegram_job_feedback")
            .select("job_id")
            .eq("seeker_id", profile.id)
            .eq("action", "saved")
            .order("updated_at", { ascending: false })
            .limit(10);

        if (error) {
            log("error", "/saved fetch failed", error);
            await ctx.reply("Не удалось загрузить сохранённые вакансии. Попробуйте позже.");
            return;
        }

        const savedIds = ((savedRows as Array<{ job_id: string }> | null) ?? []).map((row) => row.job_id);
        if (savedIds.length === 0) {
            await ctx.reply("У вас пока нет сохранённых вакансий. Нажимайте «Сохранить ⭐» в подборке.");
            return;
        }

        const { data: jobs, error: jobsError } = await admin
            .from("jobs")
            .select("id, title, district, salary_from, salary_to, employment")
            .in("id", savedIds);

        if (jobsError) {
            log("error", "/saved jobs fetch failed", jobsError);
            await ctx.reply("Не удалось загрузить данные вакансий. Попробуйте позже.");
            return;
        }

        const savedJobs = (jobs as VacancySlim[] | null) ?? [];
        await ctx.reply(`⭐ <b>Сохранённые вакансии: ${savedJobs.length}</b>`, { parse_mode: "HTML" });

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
                    reply_markup: jobActionsKeyboard(job.id),
                }
            );
        }
    });

    // Contact shared — link or start registration
    bot.on(":contact", async (ctx) => {
        const contact = ctx.message?.contact;
        if (!contact?.phone_number) return;
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        log("info", "contact shared", { chatId });
        const profile = await findProfileByPhone(contact.phone_number);

        if (!profile) {
            sessions.set(chatId, { phone: normalizePhone(contact.phone_number), step: "await_full_name" });
            await ctx.reply("Профиль с таким номером не найден. Давайте создадим его прямо здесь!\n\nКак вас зовут? (Имя и фамилия)");
            return;
        }

        try {
            await linkTelegramToProfile(chatId, profile.id);
            sessions.delete(chatId);
            log("info", "telegram linked via phone", { profileId: profile.id, chatId });
        } catch (err) {
            log("error", "link telegram failed", err);
            const detail = err instanceof Error ? err.message : "DB error";
            await ctx.reply(`⚠️ Не удалось привязать Telegram: ${detail}. Попробуйте позже или напишите в поддержку.`);
            return;
        }

        await ctx.reply(
            "✅ <b>Telegram привязан!</b>\n\nВы будете получать уведомления о вакансиях.\n\n" + HELP_TEXT,
            { parse_mode: "HTML", reply_markup: mainMenuKeyboard() }
        );
    });

    // Free-text handler — onboarding flow or AI search
    bot.on("message:text", async (ctx) => {
        const chatId = ctx.chat?.id;
        const messageText = ctx.message.text.trim();
        if (!chatId || !messageText || messageText.startsWith("/")) return;

        const linkedProfile = await getProfileByTelegramChatId(chatId);
        const onboarding = sessions.get(chatId);
        if (linkedProfile && onboarding) sessions.delete(chatId);

        if (!linkedProfile && !onboarding) {
            sessions.set(chatId, { step: "await_phone" });
            await ctx.reply("Сначала поделитесь номером телефона кнопкой ниже, чтобы привязать аккаунт.", {
                reply_markup: mainMenuKeyboard(),
            });
            return;
        }

        if (onboarding?.step === "await_phone") {
            await ctx.reply("Нажмите кнопку «📱 Поделиться номером», чтобы продолжить.");
            return;
        }

        if (onboarding?.step === "await_full_name") {
            if (messageText.length < 3) {
                await ctx.reply("Имя слишком короткое. Пример: Айдана Турсынова.");
                return;
            }
            sessions.set(chatId, { ...onboarding, fullName: messageText, step: "await_district" });
            await ctx.reply("Отлично! В каком микрорайоне Актау вы живёте?\nПример: <b>14 мкр</b> или просто <b>14</b>.", {
                parse_mode: "HTML",
            });
            return;
        }

        if (onboarding?.step === "await_district") {
            const district = parseDistrict(messageText);
            if (!district) {
                await ctx.reply("Не распознал микрорайон. Напишите числом, например: <b>14 мкр</b>.", { parse_mode: "HTML" });
                return;
            }
            if (!onboarding.phone || !onboarding.fullName) {
                sessions.set(chatId, { step: "await_phone" });
                await ctx.reply("Давайте начнём заново — поделитесь номером телефона.", { reply_markup: mainMenuKeyboard() });
                return;
            }

            try {
                await sendTyping(ctx);
                const result = await createTelegramSeekerProfile({
                    chatId,
                    phone: onboarding.phone,
                    fullName: onboarding.fullName,
                    district,
                });
                sessions.delete(chatId);
                await ctx.reply(
                    result.created
                        ? "✅ <b>Готово!</b> Профиль создан и Telegram подключён.\nТеперь напишите, какую работу ищете — AI подберёт вакансии! 🎯"
                        : "✅ <b>Профиль найден</b> — Telegram успешно привязан!\n\nНапишите какую работу ищете или используйте /vacancies.",
                    {
                        parse_mode: "HTML",
                        reply_markup: new InlineKeyboard()
                            .text("Смотреть подборку 🎯", "cmd_vacancies")
                            .url("Открыть сайт →", `${SITE}/jobs`),
                    }
                );
            } catch (err) {
                log("error", "createTelegramSeekerProfile failed", err);
                const detail = err instanceof Error ? err.message : "Registration failed";
                await ctx.reply(`⚠️ Не удалось завершить регистрацию: ${detail}\n\nПопробуйте позже.`);
            }
            return;
        }

        // AI search
        try {
            await sendMatches(ctx, messageText);
        } catch (err) {
            log("error", "sendMatches failed", err);
            await ctx.reply(
                "⚠️ Не удалось выполнить поиск. Попробуйте ещё раз или используйте /vacancies для персональной подборки."
            );
        }
    });

    // Callback buttons
    bot.on("callback_query:data", async (ctx) => {
        const data = ctx.callbackQuery.data;
        const chatId = ctx.chat?.id;
        if (!chatId) { await ctx.answerCallbackQuery(); return; }

        // Inline shortcut from registration complete screen
        if (data === "cmd_vacancies") {
            await ctx.answerCallbackQuery();
            // Trigger the vacancies command logic inline
            const profile = await getSeekerProfile(chatId);
            if (!profile || profile.role !== "seeker") {
                await ctx.reply("Для этого нужен профиль соискателя. Нажмите /start.");
                return;
            }
            await sendTyping(ctx);
            const [matchResult, feedbackResult] = await Promise.all([
                admin.rpc("match_jobs_for_seeker", { p_seeker_id: profile.id, p_count: 10 }),
                admin.from("telegram_job_feedback").select("job_id, action").eq("seeker_id", profile.id),
            ]);
            const slimMatches = (matchResult.data as VacancySlim[] | null) ?? [];
            const feedbackByJob = new Map(
                ((feedbackResult.data as Pick<TelegramJobFeedback, "job_id" | "action">[] | null) ?? []).map((r) => [r.job_id, r.action])
            );
            const ranked = slimMatches
                .filter((j) => feedbackByJob.get(j.id) !== "disliked")
                .sort((a, b) => Number(b.similarity) - Number(a.similarity))
                .slice(0, 5);
            if (ranked.length === 0) {
                await ctx.reply("Пока нет подходящих вакансий. Загляните позже или напишите профессию.");
                return;
            }
            for (const m of ranked) {
                const pct = Math.round(Number(m.similarity) * 100);
                await ctx.reply(
                    [
                        `<b>${m.title}</b> — ${pct}% матч`,
                        m.district ? `📍 ${m.district} мкр.` : null,
                        `💰 ${formatSalary(m.salary_from, m.salary_to)}`,
                        m.employment ? `⏱ ${labelForEmployment(m.employment)}` : null,
                    ].filter(Boolean).join("\n"),
                    { parse_mode: "HTML", reply_markup: jobActionsKeyboard(m.id) }
                );
            }
            return;
        }

        // View job detail (from notification)
        if (data.startsWith("view_")) {
            const jobId = data.slice(5);
            await ctx.answerCallbackQuery();
            await ctx.reply(
                `Открыть вакансию:`,
                { reply_markup: new InlineKeyboard().url("Смотреть на сайте →", `${SITE}/jobs/${jobId}`) }
            );
            return;
        }

        const profile = await getSeekerProfile(chatId);
        if (!profile) {
            await ctx.answerCallbackQuery({ text: "Сначала привяжите Telegram через /start" });
            return;
        }

        // Apply to job
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
                await ctx.answerCallbackQuery({ text: "Вы уже откликнулись ✅" });
                return;
            }

            // Get match score efficiently — fetch only this job's score
            let matchScore: number | null = null;
            const { data: scoreRows } = await admin.rpc("match_jobs_for_seeker", {
                p_seeker_id: profile.id,
                p_count: 50,
            });
            const found = (scoreRows as Array<{ id: string; similarity: number }> | null)?.find((r) => r.id === jobId);
            if (found) matchScore = Math.max(0, Math.min(1, Number(found.similarity)));

            const { error } = await admin.from("applications").insert({
                job_id: jobId,
                seeker_id: profile.id,
                message: "Отклик из Telegram",
                match_score: matchScore,
            });

            if (error) {
                log("error", "apply insert failed", error);
                await ctx.answerCallbackQuery({ text: "Ошибка при отправке. Попробуйте ещё раз" });
                return;
            }

            log("info", "application submitted via bot", { jobId, seekerId: profile.id, matchScore });
            await enqueueNewApplicationNotification(jobId, profile.id);
            flushNotifications().catch((err) => log("error", "flush notifications failed", err));
            await ctx.answerCallbackQuery({ text: "Отклик отправлен ✅" });
            return;
        }

        // Save / dislike
        if (data.startsWith("save_") || data.startsWith("dislike_")) {
            const isSave = data.startsWith("save_");
            const jobId = data.slice(isSave ? 5 : 8);
            const action: TelegramJobFeedback["action"] = isSave ? "saved" : "disliked";

            const { error } = await admin
                .from("telegram_job_feedback")
                .upsert(
                    { seeker_id: profile.id, job_id: jobId, action },
                    { onConflict: "seeker_id,job_id" }
                );
            if (error) {
                log("error", "feedback upsert failed", error);
                await ctx.answerCallbackQuery({ text: "Не удалось сохранить выбор" });
                return;
            }
            log("info", `feedback: ${action}`, { jobId, seekerId: profile.id });
            await ctx.answerCallbackQuery({
                text: isSave ? "Сохранено в избранное ⭐" : "Учту, больше не покажу 🙈",
            });
            return;
        }

        await ctx.answerCallbackQuery();
    });

    // Fallback — unknown commands
    bot.on("message", async (ctx) => {
        const text = ctx.message && "text" in ctx.message ? ctx.message.text ?? "" : "";
        if (text.startsWith("/")) {
            await ctx.reply(
                `Не знаю команду <code>${text.split(" ")[0]}</code>.\n\n` + HELP_TEXT,
                { parse_mode: "HTML" }
            );
        }
    });

    bot.catch((err) => {
        log("error", "unhandled bot error", err.error);
    });
}

async function noBot(): Promise<Response> {
    return new Response("Bot not configured", { status: 503 });
}

export const POST = bot ? webhookCallback(bot, "std/http") : noBot;

export async function GET(): Promise<Response> {
    return new Response("Jumys bot webhook is alive", { status: 200 });
}
