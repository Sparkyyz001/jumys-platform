import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { Job, SeekerProfile, Profile } from "@/lib/types";
import { labelForEmployment, labelForExperience, formatSalary } from "@/lib/constants";

interface JobSummary {
    title: string;
    description?: string | null;
    category?: string | null;
    district?: string | null;
    employment?: string | null;
    experience_required?: string | null;
    salary_from?: number | null;
    salary_to?: number | null;
    skills_required?: string[] | null;
    company_name?: string | null;
}

interface SeekerSummary {
    full_name?: string | null;
    district?: string | null;
    about?: string | null;
    skills?: string[] | null;
    experience_years?: number | null;
    desired_employment?: string | null;
}

export async function generateMatchExplanation(
    job: JobSummary,
    seeker: SeekerSummary,
    similarity: number
): Promise<string> {
    const jobBlock = [
        `Компания: ${job.company_name ?? "—"}`,
        `Должность: ${job.title}`,
        job.description ? `Описание: ${job.description.slice(0, 400)}` : null,
        job.category ? `Категория: ${job.category}` : null,
        job.district ? `Район: ${job.district}` : null,
        job.employment ? `Занятость: ${labelForEmployment(job.employment)}` : null,
        job.experience_required ? `Требуемый опыт: ${labelForExperience(job.experience_required)}` : null,
        `Зарплата: ${formatSalary(job.salary_from ?? null, job.salary_to ?? null)}`,
        job.skills_required?.length ? `Навыки: ${job.skills_required.join(", ")}` : null,
    ].filter(Boolean).join("\n");

    const seekerBlock = [
        seeker.full_name ? `Имя: ${seeker.full_name}` : null,
        seeker.district ? `Район: ${seeker.district}` : null,
        seeker.about ? `О себе: ${seeker.about.slice(0, 400)}` : null,
        seeker.skills?.length ? `Навыки: ${seeker.skills.join(", ")}` : null,
        typeof seeker.experience_years === "number" ? `Опыт: ${seeker.experience_years} лет` : null,
        seeker.desired_employment ? `Желаемая занятость: ${labelForEmployment(seeker.desired_employment)}` : null,
    ].filter(Boolean).join("\n");

    const prompt = `Ты HR-ассистент сервиса Jumys (поиск работы в Актау, Казахстан).
Объясни за 2-3 предложения на русском языке, почему эта вакансия подходит этому кандидату.
Упомяни 1-2 конкретных совпадения (навыки, район, опыт, тип занятости).
Если совпадений мало — честно скажи, что подходит слабо, и объясни почему.
Похожесть по эмбеддингам: ${(similarity * 100).toFixed(0)}%.

ВАКАНСИЯ:
${jobBlock}

КАНДИДАТ:
${seekerBlock}

Ответ (2-3 предложения, без вступлений):`;

    const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
        temperature: 0.4,
        maxTokens: 220,
    });

    return text.trim();
}

export function combineSeekerForExplanation(
    profile: Pick<Profile, "full_name" | "district">,
    seeker: Pick<SeekerProfile, "about" | "skills" | "experience_years" | "desired_employment">
): SeekerSummary {
    return { ...profile, ...seeker };
}

export function jobRowToSummary(job: Job & { company_name?: string | null }): JobSummary {
    return {
        title: job.title,
        description: job.description,
        category: job.category,
        district: job.district,
        employment: job.employment,
        experience_required: job.experience_required,
        salary_from: job.salary_from,
        salary_to: job.salary_to,
        skills_required: job.skills_required,
        company_name: job.company_name ?? null,
    };
}
