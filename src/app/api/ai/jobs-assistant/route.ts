import { matchJobsByTextQueryWithMeta } from "@/lib/actions/matching";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
    const body = await request.json().catch(() => ({}));
    const query = String(body.query ?? "").trim();
    if (!query) return Response.json({ jobs: [], provider: "local-transformers" });

    try {
        const result = await matchJobsByTextQueryWithMeta(query, { limit: 8 });
        return Response.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "AI search failed";
        const safeMessage = message.toLowerCase().includes("match_jobs")
            ? "Database search function is not ready. Apply latest Supabase migrations."
            : "AI assistant is temporarily unavailable. Please try again.";
        return Response.json(
            { error: safeMessage, debug: message, provider: "local-transformers" },
            { status: 503 }
        );
    }
}
