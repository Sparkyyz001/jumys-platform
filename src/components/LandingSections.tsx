"use client";

import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { ArrowRight, Users, ShieldCheck, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

interface LandingFeaturesProps {
    activeJobsCount: number;
    seekersCount: number;
    applicationsLastWeek: number;
}

export function LandingFeatures({ activeJobsCount, seekersCount, applicationsLastWeek }: LandingFeaturesProps) {
    const { t } = useI18n();
    const stats = [
        { label: t("statsActive"), value: activeJobsCount, trend: "+12%" },
        { label: t("statsSeekers"), value: seekersCount, trend: "+8%" },
        { label: t("statsApplications"), value: applicationsLastWeek, trend: "+24%" },
    ];

    return (
        <>
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-3">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border-border/40 bg-card/70 backdrop-blur-xl">
                            <CardContent className="p-5">
                                <div className="mt-1 flex items-end gap-2">
                                    <p className="text-3xl lg:text-4xl font-bold text-foreground">
                                        <NumberFlow value={stat.value} />
                                    </p>
                                    <span className="mb-1 inline-flex items-center gap-1 text-xs text-emerald-500 font-medium">
                                        <TrendingUp size={14} className="text-emerald-500" />
                                        {stat.trend}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="py-10 px-4">
                <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-2">
                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="h-5 w-5 text-blue-400" />
                                <h3 className="font-semibold text-white">{t("youthTitle")}</h3>
                            </div>
                            <p className="text-sm text-gray-400">{t("youthText")}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldCheck className="h-5 w-5 text-blue-400" />
                                <h3 className="font-semibold text-white">{t("verifyTitle")}</h3>
                            </div>
                            <p className="text-sm text-gray-400">{t("verifyText")}</p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </>
    );
}

export function LandingFinalCTA() {
    const { t } = useI18n();

    return (
        <motion.section
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden px-4 py-24"
        >
            <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-br from-sky-400/12 via-sky-400/6 to-transparent"
            />
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <h2 className="text-4xl font-semibold tracking-tighter text-zinc-100 md:text-5xl">{t("ctaReady")}</h2>
                <p className="mt-4 text-zinc-400">{t("ctaReadyDesc")}</p>
                <Link href="/auth/register" className="inline-block mt-8">
                    <motion.div
                        animate={{ boxShadow: ["0 0 0px rgba(56,189,248,0.15)", "0 0 28px rgba(56,189,248,0.28)", "0 0 0px rgba(56,189,248,0.15)"] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                        className="rounded-xl"
                    >
                        <Button
                            size="lg"
                            className="rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-100 hover:bg-sky-400/10"
                        >
                            {t("createAccount")}
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </motion.div>
                </Link>
            </div>
        </motion.section>
    );
}

export function FreshJobsHeading() {
    const { t } = useI18n();
    return (
        <div>
            <h2 className="text-3xl font-semibold tracking-tighter text-zinc-100 md:text-4xl">{t("freshJobs")}</h2>
            <p className="mt-1 text-sm text-zinc-400">{t("freshJobsSubtitle")}</p>
        </div>
    );
}

export function AllJobsButton({ href }: { href: string }) {
    const { t } = useI18n();
    return (
        <Link href={href}>
            <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/[0.08] bg-white/[0.03] text-zinc-100 hover:bg-sky-400/10 hover:text-zinc-100 hover:shadow-[0_0_24px_rgba(56,189,248,0.22)]"
            >
                {t("allJobs")}
                <ArrowRight className="h-4 w-4" />
            </Button>
        </Link>
    );
}
