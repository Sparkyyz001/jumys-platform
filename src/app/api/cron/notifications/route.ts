import { NextResponse } from "next/server";
import { processNotificationQueue } from "@/lib/telegram/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const auth = request.headers.get("authorization");
    const expected = process.env.CRON_SECRET;
    if (expected && auth !== `Bearer ${expected}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sent = await processNotificationQueue();
    return NextResponse.json({ sent });
}

export async function POST(request: Request) {
    return GET(request);
}
