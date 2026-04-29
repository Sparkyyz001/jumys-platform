import { pipeline } from "@xenova/transformers";
import type { Job, SeekerProfile, Profile } from "@/lib/types";
import { labelForEmployment, labelForExperience } from "@/lib/constants";

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;
const LOCAL_MODEL = "Xenova/all-MiniLM-L6-v2";

let embeddingPipelinePromise: Promise<Awaited<ReturnType<typeof pipeline>>> | null = null;

async function getEmbeddingPipeline() {
    if (!embeddingPipelinePromise) {
        embeddingPipelinePromise = pipeline("feature-extraction", LOCAL_MODEL);
    }
    return embeddingPipelinePromise;
}

function padToPgVectorDimensions(vector: number[]): number[] {
    if (vector.length === EMBEDDING_DIMENSIONS) return vector;
    if (vector.length === 0) throw new Error("Empty embedding from local model");

    const normalized = new Array<number>(EMBEDDING_DIMENSIONS);
    for (let i = 0; i < EMBEDDING_DIMENSIONS; i += 1) {
        normalized[i] = vector[i % vector.length];
    }
    return normalized;
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const input = text.trim().slice(0, 8000);
    if (!input) throw new Error("Empty text passed to generateEmbedding");

    try {
        const extractor = await getEmbeddingPipeline();
        const output = await extractor(input, { pooling: "mean", normalize: true });
        const vectorData = output?.data;
        if (!vectorData || typeof vectorData[Symbol.iterator] !== "function") {
            throw new Error("Unexpected embedding output format");
        }
        const localVector = Array.from(vectorData as Iterable<number>);
        return padToPgVectorDimensions(localVector);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown embedding failure";
        throw new Error(`Local embedding generation failed: ${message}`);
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
