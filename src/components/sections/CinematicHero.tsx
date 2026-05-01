"use client";

import Link from "next/link";
import { Globe, Instagram, Search, Twitter } from "lucide-react";
import {
    FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Logo } from "@/components/brand/Logo";
import { useI18n } from "@/lib/i18n";
import { formatSalary } from "@/lib/constants";
import { createSPAClient } from "@/lib/supabase/client";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-env";

const VIDEO_URL =
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4";

interface CinematicHeroProps {
    signedIn: boolean;
}

type JobHit = {
    id: string;
    title: string;
    employer_id: string | null;
    district: string | null;
    category: string | null;
    salary_from: number | null;
    salary_to: number | null;
};

function sanitizeIlikeFragment(q: string): string {
    return q.replace(/\\/g, "").replace(/%/g, "").replace(/,/g, "").trim();
}

export function CinematicHero({ signedIn }: CinematicHeroProps) {
    const { t, lang } = useI18n();
    const videoRef = useRef<HTMLVideoElement>(null);
    const frameRef = useRef<number | null>(null);
    const resetTimerRef = useRef<number | null>(null);
    const fadeStartRef = useRef<number | null>(null);
    const fadeFromRef = useRef(0);
    const fadeToRef = useRef(0);
    const currentOpacityRef = useRef(0);
    const fadingOutRef = useRef(false);
    const [videoOpacity, setVideoOpacity] = useState(0);

    const [query, setQuery] = useState("");
    const [hits, setHits] = useState<JobHit[]>([]);
    const [companyByEmployerId, setCompanyByEmployerId] = useState<Map<string, string>>(
        () => new Map(),
    );
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    /** Normalized query key for the latest completed fetch (success, empty, or error). */
    const [lastFetchedNormalizedQuery, setLastFetchedNormalizedQuery] = useState("");
    const [debouncing, setDebouncing] = useState(false);
    const searchSeq = useRef(0);

    const suggestionChips = useMemo(() => {
        if (lang === "kk") {
            return ["Консультант", "Курьер", "1 ш/а", "Python"];
        }
        if (lang === "en") {
            return ["Consultant", "Driver", "District 1", "Remote"];
        }
        return ["Консультант", "Водитель", "1 мкр.", "Python"];
    }, [lang]);

    const applyOpacity = useCallback((value: number) => {
        const clamped = Math.max(0, Math.min(1, value));
        currentOpacityRef.current = clamped;
        setVideoOpacity(clamped);
    }, []);

    const cancelFadeFrame = useCallback(() => {
        if (frameRef.current !== null) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }
    }, []);

    const animateFade = useCallback(
        (targetOpacity: number, durationMs = 500) => {
            cancelFadeFrame();
            fadeStartRef.current = null;
            fadeFromRef.current = currentOpacityRef.current;
            fadeToRef.current = targetOpacity;

            const step = (timestamp: number) => {
                if (fadeStartRef.current === null) {
                    fadeStartRef.current = timestamp;
                }

                const elapsed = timestamp - fadeStartRef.current;
                const progress = Math.min(elapsed / durationMs, 1);
                const nextOpacity =
                    fadeFromRef.current +
                    (fadeToRef.current - fadeFromRef.current) * progress;

                applyOpacity(nextOpacity);

                if (progress < 1) {
                    frameRef.current = requestAnimationFrame(step);
                } else {
                    frameRef.current = null;
                }
            };

            frameRef.current = requestAnimationFrame(step);
        },
        [applyOpacity, cancelFadeFrame],
    );

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedData = () => {
            fadingOutRef.current = false;
            animateFade(1, 500);
        };

        const handleTimeUpdate = () => {
            if (fadingOutRef.current) return;
            const remaining = video.duration - video.currentTime;
            if (Number.isFinite(remaining) && remaining <= 0.55) {
                fadingOutRef.current = true;
                animateFade(0, 500);
            }
        };

        const handleEnded = () => {
            fadingOutRef.current = false;
            cancelFadeFrame();
            applyOpacity(0);

            if (resetTimerRef.current !== null) {
                window.clearTimeout(resetTimerRef.current);
            }

            resetTimerRef.current = window.setTimeout(() => {
                video.currentTime = 0;
                video.play().catch(() => {});
                animateFade(1, 500);
            }, 100);
        };

        video.addEventListener("loadeddata", handleLoadedData);
        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("ended", handleEnded);

        return () => {
            cancelFadeFrame();
            if (resetTimerRef.current !== null) {
                window.clearTimeout(resetTimerRef.current);
            }
            video.removeEventListener("loadeddata", handleLoadedData);
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("ended", handleEnded);
        };
    }, [animateFade, applyOpacity, cancelFadeFrame]);

    const runJobSearch = useCallback(async (raw: string) => {
        const q = sanitizeIlikeFragment(raw).slice(0, 120);

        if (q.length < 2) {
            searchSeq.current += 1;
            setHits([]);
            setCompanyByEmployerId(new Map());
            setSearchError(null);
            setSearchLoading(false);
            setLastFetchedNormalizedQuery("");
            return;
        }

        const seq = ++searchSeq.current;
        setSearchLoading(true);
        setSearchError(null);

        try {
            if (!isSupabaseBrowserConfigured()) {
                setHits([]);
                setCompanyByEmployerId(new Map());
                setSearchError(t("heroJobSearchError"));
                return;
            }

            const supabase = createSPAClient();
            const pattern = `%${q}%`;

            const { data: titleData, error: titleError } = await supabase
                .from("jobs")
                .select(
                    "id, title, employer_id, district, category, salary_from, salary_to, created_at",
                )
                .eq("is_active", true)
                .ilike("title", pattern)
                .order("created_at", { ascending: false })
                .limit(8);

            if (seq !== searchSeq.current) return;

            if (titleError) {
                setHits([]);
                setCompanyByEmployerId(new Map());
                setSearchError(t("heroJobSearchError"));
                return;
            }

            const titleRows = ((titleData ?? []) as JobHit[]).slice();
            const merged: JobHit[] = [...titleRows];
            const taken = new Set(titleRows.map(r => r.id));
            const remainder = 8 - merged.length;

            if (remainder > 0) {
                const { data: descData, error: descError } = await supabase
                    .from("jobs")
                    .select(
                        "id, title, employer_id, district, category, salary_from, salary_to, created_at",
                    )
                    .eq("is_active", true)
                    .ilike("description", pattern)
                    .order("created_at", { ascending: false })
                    .limit(24);

                if (seq !== searchSeq.current) return;

                if (!descError && descData) {
                    for (const row of descData as JobHit[]) {
                        if (merged.length >= 8) break;
                        if (taken.has(row.id)) continue;
                        taken.add(row.id);
                        merged.push(row);
                    }
                }
            }

            setHits(merged);

            const employerIds = Array.from(
                new Set(merged.map(r => r.employer_id).filter(Boolean)),
            ) as string[];
            if (employerIds.length === 0) {
                setCompanyByEmployerId(new Map());
                return;
            }

            const { data: emps } = await supabase
                .from("employer_profiles")
                .select("profile_id, company_name")
                .in("profile_id", employerIds);

            if (seq !== searchSeq.current) return;

            const map = new Map<string, string>();
            ((emps ?? []) as Array<{ profile_id: string; company_name: string | null }>).forEach(e => {
                if (e.company_name) map.set(e.profile_id, e.company_name);
            });
            setCompanyByEmployerId(map);
        } finally {
            if (seq === searchSeq.current) {
                setSearchLoading(false);
                setLastFetchedNormalizedQuery(q);
            }
        }
    }, [t]);

    useEffect(() => {
        const trimmed = query.trim();

        const resetShort = () => {
            searchSeq.current += 1;
            setHits([]);
            setCompanyByEmployerId(new Map());
            setSearchLoading(false);
            setSearchError(null);
            setLastFetchedNormalizedQuery("");
            setDebouncing(false);
        };

        if (trimmed.length === 0) {
            resetShort();
            return;
        }

        if (trimmed.length < 2) {
            resetShort();
            return;
        }

        setDebouncing(true);
        const id = window.setTimeout(() => {
            setDebouncing(false);
            void runJobSearch(trimmed);
        }, 450);

        return () => {
            window.clearTimeout(id);
            setDebouncing(false);
        };
    }, [query, runJobSearch]);

    const handleJobSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void runJobSearch(query.trim());
    };

    const jobsLinkHref = signedIn ? "/jobs" : `/auth/login?next=${encodeURIComponent("/jobs")}`;

    const trimmedQuery = query.trim();
    const normalizedQuery = sanitizeIlikeFragment(trimmedQuery).slice(0, 120);
    const showInlinePanel = trimmedQuery.length >= 1;
    const showSearchBusy = searchLoading || debouncing;

    return (
        <section className="relative min-h-screen bg-black overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-0">
                <video
                    ref={videoRef}
                    className="pointer-events-none h-full w-full translate-y-[17%] object-cover"
                    src={VIDEO_URL}
                    autoPlay
                    muted
                    playsInline
                    preload="metadata"
                    style={{ opacity: videoOpacity }}
                />
                <div className="pointer-events-none absolute inset-0 bg-black/45" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col pointer-events-auto">
                <nav className="relative z-20 px-6 py-6">
                    <div className="liquid-glass mx-auto flex w-full max-w-5xl items-center justify-between rounded-full px-6 py-3">
                        <div className="flex min-w-0 items-center gap-6 md:gap-8">
                            <div className="[&_a]:text-white [&_svg]:text-white [&_span]:text-white">
                                <Logo showText />
                            </div>
                            <div className="hidden items-center gap-8 md:flex">
                                <a
                                    href="#features"
                                    className="truncate text-sm font-medium text-white/80 transition-colors hover:text-white"
                                >
                                    {t("landingFeaturesHeading")}
                                </a>
                                <a
                                    href="#pricing"
                                    className="text-sm font-medium text-white/80 transition-colors hover:text-white"
                                >
                                    {t("pricing")}
                                </a>
                                <a
                                    href="#employers"
                                    className="text-sm font-medium text-white/80 transition-colors hover:text-white"
                                >
                                    {t("navForEmployers")}
                                </a>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 md:gap-4">
                            {signedIn ? (
                                <Link href="/jobs" className="hidden text-sm font-medium text-white sm:inline">
                                    {t("ctaBrowseJobs")}
                                </Link>
                            ) : (
                                <Link href="/auth/register" className="hidden text-sm font-medium text-white sm:inline">
                                    {t("register")}
                                </Link>
                            )}
                            <Link
                                href={signedIn ? "/dashboard" : "/auth/login"}
                                className="liquid-glass rounded-full px-5 py-2 text-sm font-medium text-white md:px-6"
                            >
                                {signedIn ? t("dashboard") : t("login")}
                            </Link>
                        </div>
                    </div>
                </nav>

                <div className="relative z-10 flex flex-1 -translate-y-[12%] flex-col items-center justify-center px-6 py-8 text-center sm:-translate-y-[18%] md:-translate-y-[20%]">
                    <h1
                        className="mb-6 max-w-4xl px-2 font-normal leading-tight tracking-tight text-white sm:mb-8 sm:text-5xl md:text-6xl lg:text-7xl"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                        {t("heroCinematicTitle")}
                    </h1>

                    <div className="w-full max-w-xl space-y-3 text-left sm:space-y-4">
                        <form
                            onSubmit={handleJobSearchSubmit}
                            className="liquid-glass flex items-center gap-3 rounded-full py-2 pl-6 pr-2"
                        >
                            <input
                                type="search"
                                name="job-search"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder={t("heroJobSearchPlaceholder")}
                                className="w-full min-w-0 bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
                                aria-label={t("heroJobSearchPlaceholder")}
                                autoComplete="off"
                                autoCorrect="off"
                            />
                            <button
                                type="submit"
                                className="shrink-0 rounded-full bg-white p-3 text-black"
                                aria-label={t("heroJobSearchSubmitAria")}
                                disabled={searchLoading}
                            >
                                <Search size={20} strokeWidth={2.25} />
                            </button>
                        </form>

                        <div className="flex flex-wrap justify-center gap-2 px-1">
                            {suggestionChips.map(chip => (
                                <button
                                    key={chip}
                                    type="button"
                                    onClick={() => setQuery(prev => (prev.trim() === chip ? prev : chip))}
                                    className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>

                        <p className="px-3 text-center text-sm leading-relaxed text-white/85 sm:px-4">
                            {t("landingHeroSub")}
                        </p>

                        {showInlinePanel && (
                            <div className="liquid-glass max-h-[min(52vh,420px)] overflow-y-auto rounded-2xl p-4 text-sm text-white shadow-lg">
                                {trimmedQuery.length > 0 && trimmedQuery.length < 2 ? (
                                    <p className="text-center text-white/60">{t("heroJobSearchTooShort")}</p>
                                ) : showSearchBusy ? (
                                    <p className="text-center text-white/60">{t("heroJobSearchLoading")}</p>
                                ) : searchError ? (
                                    <p className="text-center text-rose-200/90">{searchError}</p>
                                ) : hits.length > 0 ? (
                                    <>
                                        <p className="mb-3 border-b border-white/10 pb-2 text-center text-xs uppercase tracking-wide text-white/55">
                                            {t("heroJobSearchFound")}: <span className="text-white">{hits.length}</span>
                                        </p>
                                        <ul className="space-y-2">
                                            {hits.map(job => (
                                                <li key={job.id}>
                                                    <Link
                                                        href={`/jobs/${job.id}`}
                                                        className="block rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.06]"
                                                    >
                                                        <span className="line-clamp-2 font-medium text-white">
                                                            {job.title}
                                                        </span>
                                                        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/55">
                                                            <span>
                                                                {job.employer_id
                                                                    ? companyByEmployerId.get(job.employer_id) ??
                                                                      "—"
                                                                    : "—"}
                                                            </span>
                                                            {job.district ? (
                                                                <span>
                                                                    · {t("heroJobDistrictPrefix")} {job.district}
                                                                </span>
                                                            ) : null}
                                                            {job.category ? <span>· {job.category}</span> : null}
                                                            <span className="text-white/65">
                                                                · {formatSalary(job.salary_from, job.salary_to)}
                                                            </span>
                                                        </span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : normalizedQuery === lastFetchedNormalizedQuery &&
                                  normalizedQuery.length >= 2 ? (
                                    <p className="text-center text-white/65">{t("heroJobSearchNoResults")}</p>
                                ) : null}
                            </div>
                        )}

                        <div className="flex justify-center pt-1">
                            <Link
                                href={jobsLinkHref}
                                className="liquid-glass rounded-full px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
                            >
                                {t("ctaBrowseJobs")}
                            </Link>
                        </div>
                    </div>
                </div>

                <footer className="relative z-10 mt-auto flex justify-center gap-4 pb-12">
                    <a
                        href="https://instagram.com"
                        aria-label="Instagram"
                        target="_blank"
                        rel="noreferrer"
                        className="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
                    >
                        <Instagram size={20} />
                    </a>
                    <a
                        href="https://x.com"
                        aria-label="Twitter"
                        target="_blank"
                        rel="noreferrer"
                        className="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
                    >
                        <Twitter size={20} />
                    </a>
                    <Link
                        href="/"
                        aria-label="Website"
                        className="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
                    >
                        <Globe size={20} />
                    </Link>
                </footer>
            </div>
        </section>
    );
}
