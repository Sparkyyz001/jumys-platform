"use client";

import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { ArrowRight, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface LandingHeroProps {
    signedIn: boolean;
}

export function LandingHero({ signedIn }: LandingHeroProps) {
    const { t } = useI18n();
    void signedIn;
    const matches = [
        { title: "Консультант", company: "Caspian Tourism Hub", salary: "315 000 ₸", score: "92%", tone: "emerald" as const },
        { title: "Support engineer", company: "IT Shop", salary: "520 000 ₸", score: "87%", tone: "violet" as const },
        { title: "Кладовщик", company: "KMG Logistics", salary: "240 000 ₸", score: "81%", tone: "amber" as const },
    ];
    const scoreStyles = {
        emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    };

    return (
        <section className="py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="w-full lg:w-3/5"
                    >
                        <span className="inline-flex items-center gap-2 rounded-full bg-muted text-xs px-3 py-1 text-muted-foreground">
                            {t("heroBadge")}
                        </span>

                        <h1 className="mt-4 text-4xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
                            {t("heroTitle")} <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                                {t("heroTitleAccent")}
                            </span>
                        </h1>

                        <p className="mt-4 text-lg text-muted-foreground max-w-xl">
                            {t("heroDescription")}
                        </p>

                        <div className="mt-8 flex gap-3 flex-wrap">
                            <Link href="/auth/register">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0"
                                >
                                    {t("ctaStart")}
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/employers">
                                <Button variant="outline" size="lg">
                                    {t("heroEmployerCta")}
                                </Button>
                            </Link>
                        </div>

                        <p className="mt-8 text-sm text-muted-foreground">{t("heroSocialProof")}</p>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative w-full lg:w-2/5 rounded-2xl border border-border bg-card shadow-xl p-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-sm font-semibold text-white">
                                АТ
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">Айгерим Т.</p>
                                <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                                    <MapPin className="size-3.5" />
                                    {t("heroMockupRole")}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2.5">
                            {matches.map((match, i) => (
                                <motion.div
                                    key={match.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.15, duration: 0.35 }}
                                    className="rounded-lg border border-border p-3 flex items-start justify-between gap-2"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{match.title}</p>
                                        <p className="text-xs text-muted-foreground">{match.company}</p>
                                        <p className="text-sm font-semibold text-foreground mt-1">{match.salary}</p>
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${scoreStyles[match.tone]}`}>
                                        {match.score}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-4 rounded-xl border border-border bg-background/80 p-3">
                            <p className="text-5xl font-bold text-foreground leading-none">
                                <NumberFlow value={3.2} />{" "}
                                <span className="text-2xl font-semibold">{t("heroMockupDays")}</span>
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">{t("heroMockupAvgHire")}</p>
                            <p className="mt-1 text-xs text-emerald-500 font-medium">{t("heroMockupVs")}</p>
                        </div>

                        <div className="absolute -bottom-3 -right-3 rounded-xl border border-border bg-background shadow-lg p-3 flex items-center gap-2">
                            <span className="size-8 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center">
                                <Send className="size-4" />
                            </span>
                            <p className="text-xs font-medium text-foreground">{t("heroMockupToast")}</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
