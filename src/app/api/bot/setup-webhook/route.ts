import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function inferSiteUrl(req: Request): string {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (envUrl) return envUrl.replace(/\/$/, "");
    const u = new URL(req.url);
    return `${u.protocol}//${u.host}`;
}

async function tg(path: string, init?: RequestInit) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
    const res = await fetch(`https://api.telegram.org/bot${token}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
        cache: "no-store",
    });
    const json = (await res.json()) as unknown;
    return { status: res.status, json };
}

export async function GET(req: Request) {
    try {
        if (!process.env.TELEGRAM_BOT_TOKEN) {
            return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN is not set" }, { status: 500 });
        }
        const site = inferSiteUrl(req);
        const webhookUrl = `${site}/api/bot`;
        const { json: setRes } = await tg("/setWebhook", {
            method: "POST",
            body: JSON.stringify({
                url: webhookUrl,
                allowed_updates: ["message", "callback_query"],
                drop_pending_updates: false,
            }),
        });
        const { json: info } = await tg("/getWebhookInfo");
        const { json: me } = await tg("/getMe");
        return NextResponse.json({
            ok: true,
            webhookUrl,
            setWebhook: setRes,
            getWebhookInfo: info,
            getMe: me,
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        if (!process.env.TELEGRAM_BOT_TOKEN) {
            return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN is not set" }, { status: 500 });
        }
        void req;
        const { json } = await tg("/deleteWebhook", {
            method: "POST",
            body: JSON.stringify({ drop_pending_updates: true }),
        });
        return NextResponse.json({ ok: true, result: json });
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
}
