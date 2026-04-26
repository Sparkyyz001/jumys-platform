"use client";

import Link from "next/link";
import { type MouseEvent } from "react";
import { MapPin, Building2, Clock, ShieldCheck, MessageCircle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSalary, labelForEmployment } from "@/lib/constants";
import { MatchScoreBadge } from "@/components/MatchScoreBadge";

interface JobCardProps {
    id: string;
    title: string;
    company?: string | null;
    district?: string | null;
    category?: string | null;
    employment?: string | null;
    salary_from?: number | null;
    salary_to?: number | null;
    similarity?: number;
    verified?: boolean;
    variant?: "light" | "dark";
}

export function JobCard({
    id, title, company, district, category, employment,
    salary_from, salary_to, similarity, verified, variant = "light",
}: JobCardProps) {
    void variant;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Здравствуйте! Интересует вакансия: ${title}. https://jumys.kz/jobs/${id}`)}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(`https://jumys.kz/jobs/${id}`)}&text=${encodeURIComponent(`Интересует вакансия: ${title}`)}`;

    const openExternal = (event: MouseEvent<HTMLButtonElement>, url: string) => {
        event.preventDefault();
        event.stopPropagation();
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <Link
            href={`/jobs/${id}`}
            className="group block rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200"
        >
            <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-1 font-semibold text-base text-foreground">{title}</h3>
                {typeof similarity === "number" && (
                    <MatchScoreBadge score={similarity} />
                )}
            </div>
            {company && (
                <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5 min-w-0">
                    <Building2 className="size-3.5 shrink-0" />
                    <span className="truncate">{company}</span>
                    {verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30 shrink-0">
                            <ShieldCheck className="h-3 w-3" />
                            Verified
                        </span>
                    )}
                </p>
            )}
            <p className="mt-2 text-base font-medium text-foreground">
                {formatSalary(salary_from ?? null, salary_to ?? null)}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
                {district && (
                    <Badge variant="secondary" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {district} мкр.
                    </Badge>
                )}
                {employment && (
                    <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {labelForEmployment(employment)}
                    </Badge>
                )}
                {category && (
                    <Badge variant="secondary">
                        {category}
                    </Badge>
                )}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex justify-end gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    title="Связаться через WhatsApp"
                    onClick={(event) => openExternal(event, whatsappUrl)}
                >
                    <MessageCircle className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    title="Поделиться в Telegram"
                    onClick={(event) => openExternal(event, telegramUrl)}
                >
                    <Send className="size-4" />
                </Button>
            </div>
        </Link>
    );
}
