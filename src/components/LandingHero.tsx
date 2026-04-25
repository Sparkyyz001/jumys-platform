"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LocationTag } from "@/components/ui/location-tag";
import { DotMapBackground } from "@/components/ui/dot-map-background";
import { AnimatedGridLayer } from "@/components/ui/mesh-grid-bg";
import { useI18n } from "@/lib/i18n";

interface LandingHeroProps {
    signedIn: boolean;
}

export function LandingHero({ signedIn }: LandingHeroProps) {
    const { t } = useI18n();

    return (
        <section className="relative pt-32 pb-20 px-4 overflow-hidden isolate">
            <AnimatedGridLayer />
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
                <DotMapBackground />
            </div>
            <div
                aria-hidden
                className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[820px] rounded-full bg-gradient-to-r from-blue-600/35 via-indigo-500/30 to-purple-500/25 blur-[120px] -z-10 animate-aurora"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-5xl mx-auto text-center"
            >
                <div className="flex justify-center mb-6">
                    <LocationTag city="Актау" country="Казахстан" timezone="+05" timeZoneIana="Asia/Aqtau" />
                </div>

                <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="inline-flex items-center gap-1.5 mb-5 px-3 py-1 rounded-full text-[11px] font-medium glass-card-strong text-blue-300"
                >
                    <Sparkles className="h-3 w-3" />
                    AI-матчинг · Telegram · 39 микрорайонов Актау
                </motion.span>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.05]">
                    {t("heroTitle")} <br />
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-shine">
                        {t("heroTitleAccent")}
                    </span>
                </h1>

                <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    {t("heroDescription")}
                </p>

                <div className="mt-10 flex gap-3 justify-center flex-wrap">
                    <Link href="/auth/register">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/30 border-0"
                        >
                            {t("ctaStart")}
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href={signedIn ? "/jobs/map" : "/auth/login?next=/jobs/map"}>
                        <Button
                            variant="outline"
                            size="lg"
                            className="bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white backdrop-blur-md"
                        >
                            {t("ctaBrowseJobs")}
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
