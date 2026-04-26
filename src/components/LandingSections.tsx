"use client";

import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { ArrowRight, Users, ShieldCheck, TrendingUp } from "lucide-react";
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
        <section className="py-20 px-4 relative overflow-hidden">
            <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-purple-600/10"
            />
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white">{t("ctaReady")}</h2>
                <p className="mt-3 text-gray-300">{t("ctaReadyDesc")}</p>
                <Link href="/auth/register" className="inline-block mt-8">
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/30 border-0"
                    >
                        {t("createAccount")}
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}

export function FreshJobsHeading() {
    const { t } = useI18n();
    return (
        <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">{t("freshJobs")}</h2>
            <p className="text-sm text-gray-400 mt-1">{t("freshJobsSubtitle")}</p>
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
                className="bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white"
            >
                {t("allJobs")}
                <ArrowRight className="h-4 w-4" />
            </Button>
        </Link>
    );
}
