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
                                <Users className="h-5 w-5 text-amber-400" />
                                <h3 className="font-semibold text-white">{t("youthTitle")}</h3>
                            </div>
                            <p className="text-sm text-gray-400">{t("youthText")}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldCheck className="h-5 w-5 text-amber-400" />
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
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden px-4 py-28"
        >
            {/* Amber mesh gradient background */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(245,158,11,0.13), transparent 70%), " +
                        "radial-gradient(ellipse 40% 40% at 20% 50%, rgba(249,115,22,0.08), transparent 60%)",
                }}
            />
            {/* Top glow line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

            {/* Floating orbs */}
            <motion.div
                className="pointer-events-none absolute left-[10%] top-[20%] h-40 w-40 rounded-full bg-amber-500/[0.06] blur-3xl"
                animate={{ y: [0, -18, 0], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="pointer-events-none absolute right-[12%] bottom-[15%] h-56 w-56 rounded-full bg-orange-500/[0.05] blur-3xl"
                animate={{ y: [0, 14, 0], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-flex mb-6 rounded-full border border-amber-500/25 bg-amber-500/[0.08] px-3 py-1 text-xs text-amber-300"
                >
                    Jumys · Актау
                </motion.div>
                <h2 className="text-4xl font-semibold tracking-tighter text-zinc-100 md:text-5xl">{t("ctaReady")}</h2>
                <p className="mt-4 text-zinc-400 max-w-xl mx-auto">{t("ctaReadyDesc")}</p>
                <Link href="/auth/register" className="inline-block mt-10">
                    <motion.div
                        animate={{
                            boxShadow: [
                                "0 0 0px rgba(245,158,11,0)",
                                "0 0 36px rgba(245,158,11,0.35)",
                                "0 0 0px rgba(245,158,11,0)",
                            ],
                        }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                        className="rounded-xl"
                    >
                        <button className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-7 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all">
                            {t("createAccount")}
                            <ArrowRight className="h-4 w-4" />
                        </button>
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
                className="rounded-xl border-white/[0.08] bg-white/[0.03] text-zinc-100 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.18)] transition-all"
            >
                {t("allJobs")}
                <ArrowRight className="h-4 w-4" />
            </Button>
        </Link>
    );
}
