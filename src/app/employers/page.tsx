"use client";

import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { Check, ShieldCheck, Sparkles, TrendingDown, TrendingUp, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const BENEFITS = [
    { icon: Sparkles, iconWrap: "bg-gradient-to-br from-violet-500/10 to-violet-500/0", iconColor: "text-violet-500", titleKey: "employersFeatureAiTitle", textKey: "employersFeatureAiText" },
    { icon: ShieldCheck, iconWrap: "bg-gradient-to-br from-amber-500/10 to-amber-500/0", iconColor: "text-amber-500", titleKey: "employersFeatureVerifyTitle", textKey: "employersFeatureVerifyText" },
    { icon: TrendingUp, iconWrap: "bg-gradient-to-br from-emerald-500/10 to-emerald-500/0", iconColor: "text-emerald-500", titleKey: "employersFeatureBoostTitle", textKey: "employersFeatureBoostText" },
] as const;

const COMPARE_ROWS = [
    { featureKey: "employersRowDistricts", jumys: "check", hh: "x", olx: "x" },
    { featureKey: "employersRowAi", jumys: "check", hh: "partial", olx: "x" },
    { featureKey: "employersRowTelegram", jumys: "check", hh: "x", olx: "x" },
    { featureKey: "employersRowVerified", jumys: "check", hh: "check", olx: "x" },
    { featureKey: "employersRowPrice", jumys: "4 990 ₸", hh: "18 000 ₸", olx: "5 000 ₸" },
] as const;

export default function EmployersPage() {
    const { t } = useI18n();

    const renderCell = (value: string) => {
        if (value === "check") return <Check className="size-4 text-emerald-500 mx-auto" />;
        if (value === "x") return <X className="size-4 text-muted-foreground mx-auto" />;
        if (value === "partial") return <span className="text-sm text-muted-foreground">{t("employersPartial")}</span>;
        return <span className="text-sm text-foreground">{value}</span>;
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <section className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 grid gap-8 lg:grid-cols-2 items-center">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-muted text-xs px-3 py-1 text-muted-foreground">
                            {t("employersBadge")}
                        </span>
                        <h1 className="mt-4 text-4xl lg:text-6xl font-bold tracking-tight leading-[1.1]">{t("employersTitle")}</h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-xl">{t("employersSub")}</p>
                        <Link href="/auth/register?role=employer" className="inline-block mt-8">
                            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0">
                                {t("employersCta")}
                            </Button>
                        </Link>
                    </div>
                    <Card className="border-border/60 bg-card">
                        <CardContent className="p-6">
                            <p className="text-5xl font-bold text-foreground leading-none">
                                <NumberFlow value={3.2} /> <span className="text-2xl">{t("heroMockupDays")}</span>
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">{t("employersAvgHire")}</p>
                            <p className="mt-2 inline-flex items-center gap-1 text-emerald-500 text-sm font-medium">
                                <TrendingDown className="size-4" />
                                {t("employersVs")}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">{t("employersWhy")}</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {BENEFITS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Card key={item.titleKey} className="rounded-2xl border border-border/40 bg-card p-6 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200">
                                    <CardContent className="p-0">
                                        <div className={`size-14 rounded-2xl ${item.iconWrap} flex items-center justify-center`}>
                                            <Icon size={28} strokeWidth={1.5} className={item.iconColor} />
                                        </div>
                                        <h3 className="mt-4 font-semibold text-foreground">{t(item.titleKey)}</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">{t(item.textKey)}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="pb-12 px-4">
                <div className="max-w-6xl mx-auto rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-foreground">{t("employersTableFeature")}</th>
                                    <th className="px-4 py-3 font-medium text-foreground bg-primary/5">{t("employersTableJumys")}</th>
                                    <th className="px-4 py-3 font-medium text-foreground">{t("employersTableHH")}</th>
                                    <th className="px-4 py-3 font-medium text-foreground">{t("employersTableOlx")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARE_ROWS.map((row) => (
                                    <tr key={row.featureKey} className="border-t border-border">
                                        <td className="px-4 py-3 text-muted-foreground">{t(row.featureKey)}</td>
                                        <td className="px-4 py-3 text-center bg-primary/5">{renderCell(row.jumys)}</td>
                                        <td className="px-4 py-3 text-center">{renderCell(row.hh)}</td>
                                        <td className="px-4 py-3 text-center">{renderCell(row.olx)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="px-4 pb-16">
                <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-violet-500/5 to-indigo-500/5 py-16 px-6 text-center border border-border/50">
                    <h2 className="text-3xl font-bold text-foreground">{t("employersCtaTitle")}</h2>
                    <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                        <Link href="/auth/register?role=employer">
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0">
                                {t("employersCtaPrimary")}
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button variant="outline">{t("employersCtaSecondary")}</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
