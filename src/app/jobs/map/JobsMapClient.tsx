"use client";

import { useState, useMemo, useCallback, memo, useEffect } from "react";
import Link from "next/link";
import {
    Map,
    MapMarker,
    MarkerContent,
    MarkerTooltip,
    MapPopup,
    MapControls,
    useMap,
} from "@/components/ui/map";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, MapPin, Wallet, X, BadgeCheck, ChevronDown } from "lucide-react";
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

const ALL_DISTRICTS = Array.from({ length: 39 }, (_, i) => String(i + 1));

function MapFocus({
    center,
    zoom,
}: {
    center: [number, number];
    zoom: number;
}) {
    const { map, isLoaded } = useMap();
    useEffect(() => {
        if (!map || !isLoaded) return;
        map.flyTo({ center, zoom, duration: 900, essential: true });
    }, [map, isLoaded, center, zoom]);
    return null;
}

interface JobsMapClientProps {
    items: JobMapItem[];
}

interface DistrictChipsProps {
    available: Set<string>;
    selected: string | null;
    counts: Record<string, number>;
    onSelect: (d: string | null) => void;
}

const DistrictChips = memo(function DistrictChips({
    available,
    selected,
    counts,
    onSelect,
}: DistrictChipsProps) {
    return (
        <div className="flex flex-wrap gap-1.5">
            <button
                type="button"
                onClick={() => onSelect(null)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    selected === null
                        ? "bg-blue-500 text-white shadow shadow-blue-500/40"
                        : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                }`}
            >
                Все
            </button>
            {ALL_DISTRICTS.map((d) => {
                const has = available.has(d);
                const isSel = selected === d;
                return (
                    <button
                        key={d}
                        type="button"
                        disabled={!has}
                        onClick={() => onSelect(d)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                            isSel
                                ? "bg-blue-500 text-white shadow shadow-blue-500/40"
                                : has
                                    ? "bg-white/5 text-gray-200 hover:bg-white/10 border border-white/10"
                                    : "bg-white/[0.02] text-gray-600 border border-white/5 cursor-not-allowed"
                        }`}
                        title={has ? `${d} мкр — ${counts[d] ?? 0} вак.` : `${d} мкр (нет вакансий)`}
                    >
                        {d}{has && counts[d] ? <span className="ml-1 opacity-70">·{counts[d]}</span> : null}
                    </button>
                );
            })}
        </div>
    );
});

export function JobsMapClient({ items }: JobsMapClientProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [districtFilter, setDistrictFilter] = useState<string | null>(null);
    const [chipsOpen, setChipsOpen] = useState(false);

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

    const districtCounts = useMemo(() => {
        const m: Record<string, number> = {};
        positioned.forEach((j) => {
            const key = (j.district ?? "").replace(/[^0-9]/g, "");
            if (!key) return;
            m[key] = (m[key] ?? 0) + 1;
        });
        return m;
    }, [positioned]);

    const availableDistricts = useMemo(() => new Set(Object.keys(districtCounts)), [districtCounts]);

    const filtered = useMemo(() => {
        if (!districtFilter) return positioned;
        return positioned.filter((j) => (j.district ?? "").replace(/[^0-9]/g, "") === districtFilter);
    }, [positioned, districtFilter]);

    const focusCenter = useMemo(() => {
        if (districtFilter) {
            const center = districtToLngLat(districtFilter);
            if (center) return center;
        }
        return AKTAU_CENTER;
    }, [districtFilter]);

    const focusZoom = districtFilter ? 14.5 : 12;

    const selected = selectedId ? positioned.find((p) => p.id === selectedId) : null;
    const withoutDistrict = items.length - positioned.length;

    const handleSelectDistrict = useCallback((d: string | null) => {
        setDistrictFilter(d);
        setSelectedId(null);
        setChipsOpen(false);
    }, []);

    return (
        <div className="space-y-3">
            {/* District filter panel - glassmorphism */}
            <div className="rounded-xl glass-card-strong p-3">
                <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        Микрорайоны Актау <span className="text-xs text-gray-400 font-normal">(1—39)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        {districtFilter ? (
                            <span className="inline-flex items-center gap-1">
                                <BadgeCheck className="h-3.5 w-3.5 text-blue-400" />
                                Показано: {filtered.length} в {districtFilter} мкр
                            </span>
                        ) : (
                            <span>Найдено: {positioned.length} вакансий</span>
                        )}
                        <button
                            type="button"
                            onClick={() => setChipsOpen((v) => !v)}
                            className="md:hidden inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10"
                        >
                            {chipsOpen ? "Свернуть" : "Развернуть"}
                            <ChevronDown className={`h-3 w-3 transition-transform ${chipsOpen ? "rotate-180" : ""}`} />
                        </button>
                    </div>
                </div>
                <div className={`${chipsOpen ? "block" : "hidden"} md:block`}>
                    <DistrictChips
                        available={availableDistricts}
                        selected={districtFilter}
                        counts={districtCounts}
                        onSelect={handleSelectDistrict}
                    />
                </div>
            </div>

            <div className="relative h-[calc(100vh-260px)] min-h-[480px] w-full rounded-xl overflow-hidden border border-white/10 bg-[#0a0d20]">
                <Map
                    center={focusCenter}
                    zoom={focusZoom}
                    minZoom={10}
                    maxZoom={17}
                >
                    <MapFocus center={focusCenter} zoom={focusZoom} />
                    <MapControls position="bottom-right" showZoom showLocate />

                    {filtered.map((j) => {
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
                                        } shadow-md`}
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
                                    {selected.verified && (
                                        <Badge className="gap-1 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                            <BadgeCheck className="h-3 w-3" />
                                            Верифицирован
                                        </Badge>
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
                            <div className="font-semibold">
                                {filtered.length} вакансий{districtFilter ? ` в ${districtFilter} мкр` : " на карте"}
                            </div>
                            {!districtFilter && withoutDistrict > 0 && (
                                <div className="text-muted-foreground text-[11px]">
                                    +{withoutDistrict} без района
                                </div>
                            )}
                            {districtFilter && filtered.length === 0 && (
                                <div className="text-muted-foreground text-[11px]">
                                    Пока пусто — попробуйте соседний микрорайон
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {districtFilter && (
                    <button
                        type="button"
                        onClick={() => setDistrictFilter(null)}
                        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-md bg-blue-500/90 hover:bg-blue-500 text-white text-xs font-medium px-3 py-2 shadow-lg shadow-blue-500/30 transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                        Сбросить фильтр
                    </button>
                )}
            </div>
        </div>
    );
}
