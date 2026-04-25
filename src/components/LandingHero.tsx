"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LocationTag } from "@/components/ui/location-tag";
import { DotMapBackground } from "@/components/ui/dot-map-background";
import { useI18n } from "@/lib/i18n";

interface LandingHeroProps {
    signedIn: boolean;
}

export function LandingHero({ signedIn }: LandingHeroProps) {
    const { t } = useI18n();

    return (
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-50">
                <DotMapBackground />
            </div>
            <div
                aria-hidden
                className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[720px] rounded-full bg-gradient-to-r from-blue-600/30 via-indigo-500/25 to-purple-500/20 blur-3xl -z-10"
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

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                    {t("heroTitle")} <br />
                    <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        {t("heroTitleAccent")}
                    </span>
                </h1>

                <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
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
                    <Link href={signedIn ? "/jobs" : "/auth/login?next=/jobs"}>
                        <Button
                            variant="outline"
                            size="lg"
                            className="bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white"
                        >
                            {t("ctaBrowseJobs")}
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
