"use client";

import { useState, useMemo, useCallback, memo, useEffect } from "react";
import Link from "next/link";
import type maplibregl from "maplibre-gl";
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

/**
 * Рисует все 39 микрорайонов как пульсирующие круги с числами на самой карте.
 * Подсвечивает выбранный микрорайон. Кликабельный — выбирает фильтр.
 */
function DistrictHeatLayer({
    counts,
    selected,
    onSelect,
}: {
    counts: Record<string, number>;
    selected: string | null;
    onSelect: (d: string) => void;
}) {
    const { map, isLoaded } = useMap();

    useEffect(() => {
        if (!map || !isLoaded) return;

        const features = ALL_DISTRICTS
            .map((d) => {
                const c = districtToLngLat(d);
                if (!c) return null;
                const count = counts[d] ?? 0;
                return {
                    type: "Feature" as const,
                    geometry: { type: "Point" as const, coordinates: c },
                    properties: { d, count, label: `${d}` },
                };
            })
            .filter((f): f is NonNullable<typeof f> => f !== null);

        const sourceData = {
            type: "FeatureCollection" as const,
            features,
        };

        const SOURCE = "aktau-districts";
        const FILL_LAYER = "aktau-districts-fill";
        const STROKE_LAYER = "aktau-districts-stroke";
        const LABEL_LAYER = "aktau-districts-label";

        const ensureSource = () => {
            if (map.getSource(SOURCE)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (map.getSource(SOURCE) as any).setData(sourceData);
            } else {
                map.addSource(SOURCE, {
                    type: "geojson",
                    data: sourceData,
                });
            }

            if (!map.getLayer(FILL_LAYER)) {
                map.addLayer({
                    id: FILL_LAYER,
                    type: "circle",
                    source: SOURCE,
                    paint: {
                        "circle-radius": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            10, ["interpolate", ["linear"], ["get", "count"], 0, 6, 10, 14, 30, 22],
                            14, ["interpolate", ["linear"], ["get", "count"], 0, 18, 10, 38, 30, 60],
                            17, ["interpolate", ["linear"], ["get", "count"], 0, 36, 10, 70, 30, 110],
                        ],
                        "circle-color": [
                            "case",
                            ["==", ["get", "d"], selected ?? "__none__"],
                            "#3b82f6",
                            ["==", ["get", "count"], 0],
                            "#1e293b",
                            "#1e3a8a",
                        ],
                        "circle-opacity": [
                            "case",
                            ["==", ["get", "d"], selected ?? "__none__"],
                            0.35,
                            ["==", ["get", "count"], 0],
                            0.10,
                            0.20,
                        ],
                    },
                });
            } else {
                map.setPaintProperty(FILL_LAYER, "circle-color", [
                    "case",
                    ["==", ["get", "d"], selected ?? "__none__"],
                    "#3b82f6",
                    ["==", ["get", "count"], 0],
                    "#1e293b",
                    "#1e3a8a",
                ]);
                map.setPaintProperty(FILL_LAYER, "circle-opacity", [
                    "case",
                    ["==", ["get", "d"], selected ?? "__none__"],
                    0.35,
                    ["==", ["get", "count"], 0],
                    0.10,
                    0.20,
                ]);
            }

            if (!map.getLayer(STROKE_LAYER)) {
                map.addLayer({
                    id: STROKE_LAYER,
                    type: "circle",
                    source: SOURCE,
                    paint: {
                        "circle-radius": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            10, ["interpolate", ["linear"], ["get", "count"], 0, 6, 10, 14, 30, 22],
                            14, ["interpolate", ["linear"], ["get", "count"], 0, 18, 10, 38, 30, 60],
                            17, ["interpolate", ["linear"], ["get", "count"], 0, 36, 10, 70, 30, 110],
                        ],
                        "circle-color": "transparent",
                        "circle-stroke-width": [
                            "case",
                            ["==", ["get", "d"], selected ?? "__none__"], 2,
                            1,
                        ],
                        "circle-stroke-color": [
                            "case",
                            ["==", ["get", "d"], selected ?? "__none__"], "#60a5fa",
                            ["==", ["get", "count"], 0], "rgba(148,163,184,0.25)",
                            "rgba(96,165,250,0.5)",
                        ],
                    },
                });
            } else {
                map.setPaintProperty(STROKE_LAYER, "circle-stroke-width", [
                    "case",
                    ["==", ["get", "d"], selected ?? "__none__"], 2,
                    1,
                ]);
                map.setPaintProperty(STROKE_LAYER, "circle-stroke-color", [
                    "case",
                    ["==", ["get", "d"], selected ?? "__none__"], "#60a5fa",
                    ["==", ["get", "count"], 0], "rgba(148,163,184,0.25)",
                    "rgba(96,165,250,0.5)",
                ]);
            }

            if (!map.getLayer(LABEL_LAYER)) {
                map.addLayer({
                    id: LABEL_LAYER,
                    type: "symbol",
                    source: SOURCE,
                    layout: {
                        "text-field": ["get", "label"],
                        "text-size": [
                            "interpolate", ["linear"], ["zoom"],
                            10, 9, 13, 12, 16, 16,
                        ],
                        "text-font": ["Open Sans Semibold", "Arial Unicode MS Regular"],
                        "text-allow-overlap": false,
                    },
                    paint: {
                        "text-color": [
                            "case",
                            ["==", ["get", "d"], selected ?? "__none__"], "#ffffff",
                            ["==", ["get", "count"], 0], "rgba(148,163,184,0.6)",
                            "#cbd5e1",
                        ],
                        "text-halo-color": "#020617",
                        "text-halo-width": 1.5,
                    },
                });
            } else {
                map.setPaintProperty(LABEL_LAYER, "text-color", [
                    "case",
                    ["==", ["get", "d"], selected ?? "__none__"], "#ffffff",
                    ["==", ["get", "count"], 0], "rgba(148,163,184,0.6)",
                    "#cbd5e1",
                ]);
            }
        };

        const handleStyleData = () => {
            // карта могла перерисовать style → нужно пересоздать source/layers
            if (!map.getLayer(FILL_LAYER)) ensureSource();
        };

        if (map.isStyleLoaded()) {
            ensureSource();
        } else {
            map.once("styledata", ensureSource);
        }

        const handleClick = (e: maplibregl.MapMouseEvent) => {
            const features = map.queryRenderedFeatures(e.point, { layers: [FILL_LAYER] });
            if (features.length > 0) {
                const d = features[0].properties?.d as string | undefined;
                if (d) onSelect(d);
            }
        };

        const handleEnter = () => {
            map.getCanvas().style.cursor = "pointer";
        };
        const handleLeave = () => {
            map.getCanvas().style.cursor = "";
        };

        map.on("click", FILL_LAYER, handleClick);
        map.on("mouseenter", FILL_LAYER, handleEnter);
        map.on("mouseleave", FILL_LAYER, handleLeave);
        map.on("styledata", handleStyleData);

        return () => {
            map.off("click", FILL_LAYER, handleClick);
            map.off("mouseenter", FILL_LAYER, handleEnter);
            map.off("mouseleave", FILL_LAYER, handleLeave);
            map.off("styledata", handleStyleData);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, isLoaded, counts, selected]);

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
                    <DistrictHeatLayer
                        counts={districtCounts}
                        selected={districtFilter}
                        onSelect={handleSelectDistrict}
                    />
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
                                        className={`group/pin relative -translate-x-1/2 -translate-y-full cursor-pointer ${
                                            isSelected ? "scale-110" : ""
                                        } transition-transform`}
                                    >
                                        <div
                                            className={`flex items-center justify-center rounded-full ring-2 ring-white shadow-lg ${
                                                j.verified
                                                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                                    : "bg-gradient-to-br from-blue-500 to-indigo-600"
                                            }`}
                                            style={{ width: 28, height: 28 }}
                                        >
                                            <Briefcase className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <div
                                            className={`absolute left-1/2 top-full -translate-x-1/2 h-2 w-2 rotate-45 -mt-1 ring-2 ring-white ${
                                                j.verified ? "bg-emerald-600" : "bg-indigo-600"
                                            }`}
                                        />
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

                <Card className="absolute top-3 left-3 z-10 border-white/10 bg-[#090b13]/90 backdrop-blur-md text-white shadow-xl">
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

                {/* Легенда */}
                <Card className="absolute bottom-12 left-3 z-10 border-white/10 bg-[#090b13]/90 backdrop-blur-md text-white shadow-xl hidden md:block">
                    <CardContent className="p-3 text-[11px] space-y-1.5 min-w-[160px]">
                        <p className="font-semibold text-white text-xs mb-1.5">Легенда</p>
                        <div className="flex items-center gap-2 text-gray-300">
                            <span className="inline-block h-3 w-3 rounded-full bg-blue-700/40 ring-1 ring-blue-400/60" />
                            Микрорайон с вакансиями
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <span className="inline-block h-3 w-3 rounded-full bg-blue-500/60 ring-2 ring-blue-300" />
                            Выбранный мкр
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <span className="inline-block h-3 w-3 rounded-full bg-slate-800 ring-1 ring-slate-600/40" />
                            Пустой мкр
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 pt-1 border-t border-white/10 mt-1">
                            <Briefcase className="h-3 w-3 text-blue-300" />
                            Маркер вакансии
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <BadgeCheck className="h-3 w-3 text-emerald-400" />
                            Verified business
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
