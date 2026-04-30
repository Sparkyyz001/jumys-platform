"use client";

import Link from "next/link";
import { type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
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
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(y, { stiffness: 300, damping: 30 });
    const rotateY = useSpring(x, { stiffness: 300, damping: 30 });

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Здравствуйте! Интересует вакансия: ${title}. https://jumys.kz/jobs/${id}`)}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(`https://jumys.kz/jobs/${id}`)}&text=${encodeURIComponent(`Интересует вакансия: ${title}`)}`;

    const openExternal = (event: MouseEvent<HTMLButtonElement>, url: string) => {
        event.preventDefault();
        event.stopPropagation();
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const onPointerMove = (event: MouseEvent<HTMLAnchorElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        x.set((px - 0.5) * 10);
        y.set((0.5 - py) * 10);
    };

    const onPointerLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{ rotateX, rotateY, transformPerspective: 1000 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
        <Link
            href={`/jobs/${id}`}
            onMouseMove={onPointerMove}
            onMouseLeave={onPointerLeave}
            className="group block rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 backdrop-blur-3xl hover:border-sky-300/30 transition-all duration-300"
        >
            <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-1 font-semibold text-base text-zinc-100">{title}</h3>
                {typeof similarity === "number" && (
                    <MatchScoreBadge score={similarity} />
                )}
            </div>
            {company && (
                <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-zinc-400">
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
            <p className="mt-2 text-base font-medium text-zinc-100">
                {formatSalary(salary_from ?? null, salary_to ?? null)}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
                {district && (
                    <Badge variant="secondary" className="gap-1 border border-white/10 bg-white/[0.03] text-zinc-300">
                        <MapPin className="h-3 w-3" />
                        {district} мкр.
                    </Badge>
                )}
                {employment && (
                    <Badge variant="secondary" className="gap-1 border border-white/10 bg-white/[0.03] text-zinc-300">
                        <Clock className="h-3 w-3" />
                        {labelForEmployment(employment)}
                    </Badge>
                )}
                {category && (
                    <Badge variant="secondary" className="border border-white/10 bg-white/[0.03] text-zinc-300">
                        {category}
                    </Badge>
                )}
            </div>
            <div className="mt-3 flex justify-end gap-1 border-t border-white/10 pt-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-zinc-300 hover:bg-sky-400/10 hover:text-sky-200 hover:shadow-[0_0_22px_rgba(56,189,248,0.28)]"
                    title="Связаться через WhatsApp"
                    onClick={(event) => openExternal(event, whatsappUrl)}
                >
                    <MessageCircle className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-zinc-300 hover:bg-sky-400/10 hover:text-sky-200 hover:shadow-[0_0_22px_rgba(56,189,248,0.28)]"
                    title="Поделиться в Telegram"
                    onClick={(event) => openExternal(event, telegramUrl)}
                >
                    <Send className="size-4" />
                </Button>
            </div>
        </Link>
        </motion.div>
    );
}
