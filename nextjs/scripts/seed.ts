/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });
dotenv.config();

type EmploymentType = "full" | "part" | "gig";
type ExperienceLevel = "none" | "junior" | "middle" | "senior";

const EMBEDDING_DIMENSIONS = 1536;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PRIVATE_SUPABASE_SERVICE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const USE_OPENAI_EMBEDDINGS = process.env.SEED_USE_OPENAI === "true";

if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});
const openai = OPENAI_KEY && USE_OPENAI_EMBEDDINGS ? new OpenAI({ apiKey: OPENAI_KEY }) : null;

function deterministicEmbeddingFromText(text: string): number[] {
    const vector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
    let state = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
        state ^= text.charCodeAt(i);
        state = Math.imul(state, 16777619);
    }
    for (let i = 0; i < EMBEDDING_DIMENSIONS; i += 1) {
        state ^= i + 1;
        state = Math.imul(state, 2246822519);
        vector[i] = ((state >>> 0) % 2000) / 1000 - 1;
    }
    return vector;
}

async function embed(text: string): Promise<number[]> {
    const input = text.trim().slice(0, 8000);
    if (!openai) return deterministicEmbeddingFromText(input);
    try {
        const res = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input,
        });
        return res.data[0].embedding;
    } catch (error) {
        if (error instanceof OpenAI.APIError && error.status === 429) {
            return deterministicEmbeddingFromText(input);
        }
        throw error;
    }
}

const DISTRICTS = ["1", "14", "29", "32"];
const EMPLOYERS_BASE = [
    { company: "Кафе Dastarkhan", type: "общепит", district: "14" },
    { company: "Кафе Ariba", type: "общепит", district: "14" },
    { company: "KMG Logistics Aktau", type: "логистика", district: "29" },
    { company: "NMSC Marine Services", type: "логистика", district: "1" },
    { company: "14 District IT Shop", type: "IT", district: "14" },
    { company: "Caspian Tourism Hub", type: "сервис", district: "1" },
    { company: "Mangystau Oil Support", type: "нефтесервис", district: "32" },
];
const FIRST_NAMES = ["Айдана", "Бекзат", "Алихан", "Мадина", "Нурлан", "Жанар", "Руслан", "Аружан", "Диас", "Асем", "Ермек", "Самал"];
const LAST_NAMES = ["Турсынов", "Куанышев", "Сарсенова", "Жумабаев", "Баймуратова", "Есентаев", "Касенов", "Оралбекова", "Тулегенов", "Даулетова"];
const SKILLS_BY_CATEGORY: Record<string, string[]> = {
    "общепит": ["обслуживание", "касса", "санитарные нормы", "казахский", "русский"],
    "логистика": ["логистика", "1С", "ТТН", "склад", "категория B"],
    "нефтесервис": ["нефтегаз", "безопасность", "вахта", "техническая документация", "КИПиА"],
    "сервис": ["клиентский сервис", "продажи", "коммуникабельность", "отчетность"],
    "IT": ["TypeScript", "React", "SQL", "поддержка пользователей", "Git"],
};
const JOB_TITLES_BY_CATEGORY: Record<string, string[]> = {
    "общепит": ["Официант", "Повар горячего цеха", "Бариста", "Кондитер", "Администратор смены"],
    "логистика": ["Логист-координатор", "Кладовщик", "Водитель категории B", "Экспедитор", "Оператор склада"],
    "нефтесервис": ["Оператор добычи", "Инженер КИПиА", "Слесарь-ремонтник", "Лаборант", "Супервайзер участка"],
    "сервис": ["Менеджер по туризму", "Администратор ресепшн", "SMM-специалист", "Оператор call-центра", "Консультант"],
    "IT": ["Frontend-разработчик", "QA инженер", "Системный администратор", "Support engineer", "Аналитик данных"],
};

function pick<T>(arr: T[], index: number): T {
    return arr[index % arr.length];
}

function makeEmployers() {
    return Array.from({ length: 55 }).map((_, i) => {
        const base = pick(EMPLOYERS_BASE, i);
        const first = pick(FIRST_NAMES, i);
        const last = pick(LAST_NAMES, i + 3);
        const slug = `${base.company.toLowerCase().replace(/[^a-z0-9]+/gi, "")}${i + 1}`;
        return {
            email: `${slug}@jumys.test`,
            name: `${first} ${last}`,
            phone: `+7700555${String(1000 + i).slice(-4)}`,
            company: `${base.company} ${i + 1}`,
            type: base.type,
            district: base.district,
        };
    });
}

function makeSeekers() {
    return Array.from({ length: 120 }).map((_, i) => {
        const first = pick(FIRST_NAMES, i + 2);
        const last = pick(LAST_NAMES, i + 4);
        const category = pick(Object.keys(SKILLS_BY_CATEGORY), i);
        const district = pick(DISTRICTS, i);
        const skills = SKILLS_BY_CATEGORY[category];
        const experienceYears = i % 11;
        const desiredEmployment: EmploymentType = i % 7 === 0 ? "gig" : (i % 5 === 0 ? "part" : "full");
        return {
            email: `seeker${String(i + 1).padStart(3, "0")}@jumys.test`,
            name: `${first} ${last}`,
            phone: `+7700666${String(1000 + i).slice(-4)}`,
            district,
            about: `${first} живет в ${district} микрорайоне Актау и ищет работу в сфере ${category} в Мангистауской области.`,
            skills: [skills[i % skills.length], skills[(i + 1) % skills.length], skills[(i + 2) % skills.length]],
            experience_years: experienceYears,
            desired_employment: desiredEmployment,
        };
    });
}

function makeJobs(employers: ReturnType<typeof makeEmployers>) {
    return Array.from({ length: 240 }).map((_, i) => {
        const employer = employers[i % employers.length];
        const district = employer.district;
        const category = employer.type;
        const title = pick(JOB_TITLES_BY_CATEGORY[category], i);
        const skills = SKILLS_BY_CATEGORY[category];
        const employment: EmploymentType = i % 8 === 0 ? "gig" : (i % 6 === 0 ? "part" : "full");
        const experience: ExperienceLevel =
            i % 10 === 0 ? "senior" : i % 4 === 0 ? "middle" : i % 3 === 0 ? "junior" : "none";
        const salaryBase = category === "нефтесервис" ? 380000 : category === "IT" ? 420000 : 190000;
        const salary_from = salaryBase + (i % 6) * 25000;
        const salary_to = salary_from + (category === "нефтесервис" ? 260000 : 170000);
        return {
            employerEmail: employer.email,
            title: `${title} (${district} мкр.) #${i + 1}`,
            description: `Вакансия для ${district} микрорайона Актау. Направление: ${category}. Проект в регионе Мангистау: логистика порта, нефтесервис, туризм и городской сервис.`,
            category,
            district,
            employment,
            experience_required: experience,
            salary_from,
            salary_to,
            skills_required: [skills[i % skills.length], skills[(i + 1) % skills.length], skills[(i + 2) % skills.length]],
        };
    });
}

async function getExistingUsersByEmail(): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    let page = 1;
    let keepLoading = true;
    while (keepLoading) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
        if (error) throw new Error(`Failed to list users: ${error.message}`);
        data.users.forEach((user) => {
            if (user.email) map.set(user.email, user.id);
        });
        keepLoading = data.users.length === 200;
        page += 1;
    }
    return map;
}

async function findUserIdByEmail(email: string): Promise<string | null> {
    let page = 1;
    let keepLoading = true;
    while (keepLoading) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
        if (error) throw new Error(`Failed to list users while resolving duplicate email: ${error.message}`);
        const found = data.users.find((user) => user.email === email);
        if (found) return found.id;
        keepLoading = data.users.length === 200;
        page += 1;
    }
    return null;
}

async function upsertUser(
    email: string,
    meta: { name: string; phone: string },
    cache: Map<string, string>
): Promise<string> {
    const existingId = cache.get(email);
    if (existingId) return existingId;
    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password: "password123",
            email_confirm: true,
            user_metadata: meta,
        });

        if (error || !data.user) {
            const looksLikeDuplicate =
                error?.status === 422 ||
                error?.message.toLowerCase().includes("already been registered");

            if (looksLikeDuplicate) {
                const resolvedId = await findUserIdByEmail(email);
                if (resolvedId) {
                    cache.set(email, resolvedId);
                    return resolvedId;
                }
            }

            throw new Error(`Create user ${email} failed: ${error?.message}`);
        }

        cache.set(email, data.user.id);
        return data.user.id;
    } catch (error) {
        const resolvedId = await findUserIdByEmail(email);
        if (resolvedId) {
            cache.set(email, resolvedId);
            return resolvedId;
        }
        throw error;
    }
}

async function run() {
    console.log(`Embedding mode: ${openai ? "OpenAI with deterministic 429 fallback" : "deterministic fallback only"}`);
    const employers = makeEmployers();
    const seekers = makeSeekers();
    const jobs = makeJobs(employers);
    const userCache = await getExistingUsersByEmail();

    const employerIdByEmail = new Map<string, string>();
    for (const employer of employers) {
        const userId = await upsertUser(employer.email, { name: employer.name, phone: employer.phone }, userCache);
        employerIdByEmail.set(employer.email, userId);

        await supabase.from("profiles").upsert({
            id: userId,
            role: "employer",
            full_name: employer.name,
            phone: employer.phone,
            district: employer.district,
        }, { onConflict: "id" });

        await supabase.from("employer_profiles").upsert({
            profile_id: userId,
            company_name: employer.company,
            company_type: employer.type,
        }, { onConflict: "profile_id" });
    }

    const seekerIds: string[] = [];
    for (const seeker of seekers) {
        const userId = await upsertUser(seeker.email, { name: seeker.name, phone: seeker.phone }, userCache);
        seekerIds.push(userId);
        await supabase.from("profiles").upsert({
            id: userId,
            role: "seeker",
            full_name: seeker.name,
            phone: seeker.phone,
            district: seeker.district,
        }, { onConflict: "id" });

        const text = [
            `Соискатель: ${seeker.name}`,
            `О себе: ${seeker.about}`,
            `Район: ${seeker.district}`,
            `Навыки: ${seeker.skills.join(", ")}`,
            `Опыт работы: ${seeker.experience_years} лет`,
        ].join("\n");
        const embedding = await embed(text);
        await supabase.from("seeker_profiles").upsert({
            profile_id: userId,
            about: seeker.about,
            skills: seeker.skills,
            experience_years: seeker.experience_years,
            desired_employment: seeker.desired_employment,
            embedding: embedding as unknown as any,
        }, { onConflict: "profile_id" });
    }

    for (const job of jobs) {
        const employerId = employerIdByEmail.get(job.employerEmail);
        if (!employerId) continue;
        const text = [
            `Вакансия: ${job.title}`,
            `Описание: ${job.description}`,
            `Категория: ${job.category}`,
            `Район: ${job.district}`,
            `Навыки: ${job.skills_required.join(", ")}`,
        ].join("\n");
        const embedding = await embed(text);
        await supabase.from("jobs").insert({
            employer_id: employerId,
            title: job.title,
            description: job.description,
            category: job.category,
            district: job.district,
            employment: job.employment,
            experience_required: job.experience_required,
            salary_from: job.salary_from,
            salary_to: job.salary_to,
            skills_required: job.skills_required,
            embedding: embedding as unknown as any,
        });
    }

    console.log("Seeding complete.");
    console.log(`Employers: ${employers.length}, Seekers: ${seekers.length}, Jobs: ${jobs.length}`);
    console.log("All records were inserted using SUPABASE_SERVICE_ROLE_KEY.");
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
