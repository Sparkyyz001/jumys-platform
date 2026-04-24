import OpenAI from "openai";
import type { Job, SeekerProfile, Profile } from "@/lib/types";
import { labelForEmployment, labelForExperience } from "@/lib/constants";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

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
        const normalized = ((state >>> 0) % 2000) / 1000 - 1;
        vector[i] = normalized;
    }
    return vector;
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const input = text.trim().slice(0, 8000);
    if (!input) throw new Error("Empty text passed to generateEmbedding");

    if (!process.env.OPENAI_API_KEY) {
        return deterministicEmbeddingFromText(input);
    }

    try {
        const res = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
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

export function buildJobEmbeddingInput(job: {
    title: string;
    description: string;
    category?: string | null;
    district?: string | null;
    employment?: string | null;
    experience_required?: string | null;
    skills_required?: string[] | null;
}): string {
    const parts: string[] = [];
    parts.push(`Вакансия: ${job.title}`);
    parts.push(`Описание: ${job.description}`);
    if (job.category) parts.push(`Категория: ${job.category}`);
    if (job.district) parts.push(`Район: ${job.district}`);
    if (job.employment) parts.push(`Занятость: ${labelForEmployment(job.employment)}`);
    if (job.experience_required) parts.push(`Опыт: ${labelForExperience(job.experience_required)}`);
    if (job.skills_required && job.skills_required.length > 0) {
        parts.push(`Навыки: ${job.skills_required.join(", ")}`);
    }
    return parts.join("\n");
}

export function buildSeekerEmbeddingInput(seeker: {
    full_name?: string | null;
    district?: string | null;
    about?: string | null;
    skills?: string[] | null;
    experience_years?: number | null;
    desired_employment?: string | null;
}): string {
    const parts: string[] = [];
    if (seeker.full_name) parts.push(`Соискатель: ${seeker.full_name}`);
    if (seeker.about) parts.push(`О себе: ${seeker.about}`);
    if (seeker.district) parts.push(`Район: ${seeker.district}`);
    if (seeker.skills && seeker.skills.length > 0) {
        parts.push(`Навыки: ${seeker.skills.join(", ")}`);
    }
    if (typeof seeker.experience_years === "number") {
        parts.push(`Опыт работы: ${seeker.experience_years} лет`);
    }
    if (seeker.desired_employment) {
        parts.push(`Желаемая занятость: ${labelForEmployment(seeker.desired_employment)}`);
    }
    return parts.join("\n");
}

export function buildJobEmbeddingInputFromJob(job: Job): string {
    return buildJobEmbeddingInput(job);
}

export function buildSeekerEmbeddingInputFromRows(
    profile: Pick<Profile, "full_name" | "district">,
    seeker: Pick<SeekerProfile, "about" | "skills" | "experience_years" | "desired_employment">
): string {
    return buildSeekerEmbeddingInput({ ...profile, ...seeker });
}
