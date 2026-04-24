"use client";

import Link from "next/link";
import { type MouseEvent, useState } from "react";
import { MapPin, Building2, Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
}

export function JobCard({
    id, title, company, district, category, employment,
    salary_from, salary_to, similarity, verified
}: JobCardProps) {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const onMove = (event: MouseEvent<HTMLAnchorElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: y * -7, y: x * 9 });
    };

    return (
        <Link
            href={`/jobs/${id}`}
            className="group block cursor-pointer [perspective:1100px]"
            onMouseMove={onMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
                setIsHovering(false);
                setTilt({ x: 0, y: 0 });
            }}
        >
            <Card
                className="h-full border border-white/35 bg-white/60 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 group-hover:border-primary-300/70 group-hover:shadow-[0_20px_45px_rgba(124,58,237,0.22)]"
                style={{
                    transform: isHovering ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px)` : "rotateX(0deg) rotateY(0deg)",
                }}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary-700">
                            {title}
                        </h3>
                        {typeof similarity === "number" && (
                            <MatchScoreBadge score={similarity} />
                        )}
                    </div>
                    {company && (
                        <p className="text-sm text-gray-600 flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" />
                            {company}
                            {verified && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    <ShieldCheck className="h-3 w-3" />
                                    Verified Business
                                </span>
                            )}
                        </p>
                    )}
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-lg font-semibold text-slate-900">
                        {formatSalary(salary_from ?? null, salary_to ?? null)}
                    </p>
                    <div className="flex flex-wrap gap-2">
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
                        {category && <Badge variant="outline">{category}</Badge>}
                    </div>
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Здравствуйте! Интересует вакансия: ${title}. https://jumys.kz/jobs/${id}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-xs font-medium text-emerald-700 hover:underline"
                        onClick={(event) => event.stopPropagation()}
                    >
                        WhatsApp Contact
                    </a>
                    <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(`https://jumys.kz/jobs/${id}`)}&text=${encodeURIComponent(`Интересует вакансия: ${title}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-3 inline-flex text-xs font-medium text-sky-700 hover:underline"
                        onClick={(event) => event.stopPropagation()}
                    >
                        Telegram
                    </a>
                </CardContent>
            </Card>
        </Link>
    );
}
