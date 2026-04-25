"use client";

import Link from "next/link";
import { ArrowRight, Users, ShieldCheck } from "lucide-react";
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

    return (
        <>
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-3">
                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                        <CardContent className="p-5">
                            <p className="text-xs text-gray-400">{t("statsActive")}</p>
                            <p className="text-3xl font-bold mt-1 text-white">{activeJobsCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                        <CardContent className="p-5">
                            <p className="text-xs text-gray-400">{t("statsSeekers")}</p>
                            <p className="text-3xl font-bold mt-1 text-white">{seekersCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                        <CardContent className="p-5">
                            <p className="text-xs text-gray-400">{t("statsApplications")}</p>
                            <p className="text-3xl font-bold mt-1 text-white">{applicationsLastWeek}</p>
                        </CardContent>
                    </Card>
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
