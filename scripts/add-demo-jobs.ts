import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { buildJobEmbeddingInput, generateEmbedding } from "../src/lib/ai/embeddings";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PRIVATE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});

const DISTRICTS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32"];
const TITLES = ["Официант", "Повар", "Бариста", "Курьер", "Кассир", "Продавец-консультант", "Администратор", "Оператор call-центра", "Кладовщик", "Водитель категории B"];
const CATEGORIES = ["общепит", "ритейл", "логистика", "сервис"];

function pick<T>(arr: T[], i: number): T {
    return arr[i % arr.length];
}

async function run() {
    const amount = Number(process.env.DEMO_JOBS_COUNT ?? "1000");
    const { data: employers, error: employerError } = await supabase
        .from("employer_profiles")
        .select("profile_id, company_name")
        .limit(200);
    if (employerError) throw new Error(employerError.message);
    if (!employers || employers.length === 0) {
        throw new Error("No employer profiles found. Create at least one employer first.");
    }

    console.log(`Generating ${amount} demo jobs...`);
    for (let i = 0; i < amount; i += 1) {
        const employer = pick(employers, i);
        const district = pick(DISTRICTS, i);
        const title = pick(TITLES, i);
        const category = pick(CATEGORIES, i);
        const payload = {
            employer_id: employer.profile_id,
            title: `${title} (${district} мкр) demo #${i + 1}`,
            description: `Демо вакансия для ${district} микрорайона Актау. Компания ${employer.company_name}.`,
            category,
            district,
            employment: i % 4 === 0 ? "part" : "full",
            experience_required: i % 5 === 0 ? "junior" : "none",
            salary_from: 140000 + (i % 7) * 15000,
            salary_to: 220000 + (i % 7) * 20000,
            skills_required: ["коммуникация", "ответственность", "клиентский сервис"],
        };
        const embedding = await generateEmbedding(buildJobEmbeddingInput(payload));

        const { error } = await supabase.from("jobs").insert({
            ...payload,
            embedding: embedding as unknown as number[],
        });
        if (error) throw new Error(`Insert failed at ${i + 1}: ${error.message}`);
        if ((i + 1) % 50 === 0) console.log(`Inserted ${i + 1}/${amount}`);
    }
    console.log("Demo jobs inserted.");
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
