import { matchJobsByTextQuery } from "@/lib/actions/matching";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
    const body = await request.json().catch(() => ({}));
    const query = String(body.query ?? "").trim();
    if (!query) return Response.json({ jobs: [] });

    try {
        const jobs = await matchJobsByTextQuery(query, { limit: 8 });
        return Response.json({ jobs });
    } catch (error) {
        const message = error instanceof Error ? error.message : "AI search failed";
        return Response.json({ error: message }, { status: 503 });
    }
}
