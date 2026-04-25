"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Map,
    MapMarker,
    MarkerContent,
    MarkerTooltip,
    MapPopup,
    MapControls,
} from "@/components/ui/map";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, MapPin, Wallet, X } from "lucide-react";
import {
    AKTAU_CENTER,
    districtToLngLat,
    jitter,
} from "@/lib/aktau-districts";
import { Badge } from "@/components/ui/badge";

export interface JobMapItem {
    id: string;
    title: string;
    company: string | null;
    district: string | null;
    category: string | null;
    employment: "full" | "part" | "gig" | null;
    salary_from: number | null;
    salary_to: number | null;
    verified: boolean;
}

const formatSalary = (from: number | null, to: number | null) => {
    if (!from && !to) return null;
    if (from && to) return `${from.toLocaleString("ru-RU")} – ${to.toLocaleString("ru-RU")} ₸`;
    if (from) return `от ${from.toLocaleString("ru-RU")} ₸`;
    return `до ${to!.toLocaleString("ru-RU")} ₸`;
};

interface JobsMapClientProps {
    items: JobMapItem[];
}

export function JobsMapClient({ items }: JobsMapClientProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const positioned = useMemo(() => {
        return items
            .map((j, i) => {
                const base = districtToLngLat(j.district);
                if (!base) return null;
                const [lng, lat] = jitter(base, i + 1);
                return { ...j, lng, lat };
            })
            .filter((x): x is JobMapItem & { lng: number; lat: number } => x !== null);
    }, [items]);

    const selected = selectedId ? positioned.find((p) => p.id === selectedId) : null;
    const withoutDistrict = items.length - positioned.length;

    return (
        <div className="relative h-[calc(100vh-160px)] min-h-[520px] w-full rounded-xl overflow-hidden border border-white/10 bg-[#0a0d20]">
            <Map
                center={AKTAU_CENTER}
                zoom={12}
                minZoom={10}
                maxZoom={17}
            >
                <MapControls position="bottom-right" showZoom showLocate />

                {positioned.map((j) => {
                    const isSelected = selectedId === j.id;
                    return (
                        <MapMarker
                            key={j.id}
                            longitude={j.lng}
                            latitude={j.lat}
                            onClick={() => setSelectedId(j.id)}
                        >
                            <MarkerContent>
                                <div
                                    className={`relative -translate-x-1/2 -translate-y-1/2 rounded-full ${
                                        isSelected
                                            ? "h-5 w-5 bg-blue-500 ring-4 ring-blue-500/30"
                                            : j.verified
                                                ? "h-4 w-4 bg-emerald-500 ring-2 ring-emerald-500/30"
                                                : "h-4 w-4 bg-blue-500 ring-2 ring-blue-500/20"
                                    } shadow-lg transition-all`}
                                >
                                    <span className="absolute inset-0 rounded-full border-2 border-white" />
                                </div>
                            </MarkerContent>
                            <MarkerTooltip>{j.title}</MarkerTooltip>
                        </MapMarker>
                    );
                })}

                {selected && (
                    <MapPopup
                        longitude={selected.lng}
                        latitude={selected.lat}
                        onClose={() => setSelectedId(null)}
                        className="min-w-[280px] max-w-[320px]"
                    >
                        <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div className="font-semibold text-sm leading-snug">
                                    {selected.title}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedId(null)}
                                    className="text-muted-foreground hover:text-foreground"
                                    aria-label="Закрыть"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            {selected.company && (
                                <p className="text-xs text-muted-foreground">{selected.company}</p>
                            )}
                            <div className="flex flex-wrap gap-1.5 text-xs">
                                {selected.district && (
                                    <Badge variant="outline" className="gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {selected.district} мкр
                                    </Badge>
                                )}
                                {selected.category && (
                                    <Badge variant="outline">{selected.category}</Badge>
                                )}
                            </div>
                            {(selected.salary_from || selected.salary_to) && (
                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                    <Wallet className="h-3 w-3 text-emerald-500" />
                                    {formatSalary(selected.salary_from, selected.salary_to)}
                                </div>
                            )}
                            <Link
                                href={`/jobs/${selected.id}`}
                                className="inline-flex items-center justify-center w-full rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-2 transition-colors"
                            >
                                Открыть вакансию
                            </Link>
                        </div>
                    </MapPopup>
                )}
            </Map>

            <Card className="absolute top-3 left-3 z-10 border-white/10 bg-[#090b13]/90 backdrop-blur-xl text-white shadow-xl">
                <CardContent className="p-3 flex items-center gap-3 text-xs">
                    <Briefcase className="h-4 w-4 text-blue-400" />
                    <div>
                        <div className="font-semibold">{positioned.length} вакансий на карте</div>
                        {withoutDistrict > 0 && (
                            <div className="text-muted-foreground text-[11px]">
                                +{withoutDistrict} без района
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
