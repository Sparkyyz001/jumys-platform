"use client";

import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { Check, ShieldCheck, Sparkles, TrendingDown, TrendingUp, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

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
        if (value === "check") return <Check className="size-4 text-emerald-400 mx-auto" />;
        if (value === "x") return <X className="size-4 text-zinc-600 mx-auto" />;
        if (value === "partial") return <span className="text-sm text-zinc-500">{t("employersPartial")}</span>;
        return <span className="text-sm text-zinc-300">{value}</span>;
    };

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100">
            <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: "radial-gradient(ellipse 70% 50% at 15% 10%, rgba(251,146,60,0.07), transparent 60%), radial-gradient(ellipse 60% 50% at 85% 80%, rgba(56,189,248,0.06), transparent 60%)" }} />

            {/* Hero */}
            <section className="py-16 lg:py-24 px-4">
                <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-2 items-center">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                            {t("employersBadge")}
                        </span>
                        <h1 className="mt-4 text-4xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-zinc-100">{t("employersTitle")}</h1>
                        <p className="mt-4 text-lg text-zinc-400 max-w-xl">{t("employersSub")}</p>
                        <Link href="/auth/register?role=employer" className="inline-block mt-8">
                            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all">
                                {t("employersCta")}
                            </button>
                        </Link>
                    </div>
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-3xl p-6">
                        <p className="text-5xl font-bold text-zinc-100 leading-none">
                            <NumberFlow value={3.2} /> <span className="text-2xl text-zinc-400">{t("heroMockupDays")}</span>
                        </p>
                        <p className="mt-2 text-sm text-zinc-500">{t("employersAvgHire")}</p>
                        <p className="mt-2 inline-flex items-center gap-1 text-emerald-400 text-sm font-medium">
                            <TrendingDown className="size-4" />
                            {t("employersVs")}
                        </p>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-zinc-100 mb-8">{t("employersWhy")}</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {BENEFITS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.titleKey} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-3xl p-6 hover:-translate-y-0.5 transition-transform duration-200">
                                    <div className={`size-12 rounded-xl ${item.iconWrap} flex items-center justify-center`}>
                                        <Icon size={24} strokeWidth={1.5} className={item.iconColor} />
                                    </div>
                                    <h3 className="mt-4 font-semibold text-zinc-100">{t(item.titleKey)}</h3>
                                    <p className="mt-2 text-sm text-zinc-400">{t(item.textKey)}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Compare table */}
            <section className="pb-12 px-4">
                <div className="max-w-6xl mx-auto rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-white/[0.07] bg-white/[0.03]">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-zinc-400">{t("employersTableFeature")}</th>
                                    <th className="px-4 py-3 font-medium text-amber-300 bg-amber-500/5">{t("employersTableJumys")}</th>
                                    <th className="px-4 py-3 font-medium text-zinc-400">{t("employersTableHH")}</th>
                                    <th className="px-4 py-3 font-medium text-zinc-400">{t("employersTableOlx")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARE_ROWS.map((row) => (
                                    <tr key={row.featureKey} className="border-t border-white/[0.06]">
                                        <td className="px-4 py-3 text-zinc-400">{t(row.featureKey)}</td>
                                        <td className="px-4 py-3 text-center bg-amber-500/5">{renderCell(row.jumys)}</td>
                                        <td className="px-4 py-3 text-center">{renderCell(row.hh)}</td>
                                        <td className="px-4 py-3 text-center">{renderCell(row.olx)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 pb-16">
                <div className="max-w-6xl mx-auto rounded-3xl border border-white/[0.07] bg-gradient-to-br from-amber-500/5 to-orange-500/5 py-16 px-6 text-center">
                    <h2 className="text-3xl font-bold text-zinc-100">{t("employersCtaTitle")}</h2>
                    <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                        <Link href="/auth/register?role=employer">
                            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all">
                                {t("employersCtaPrimary")}
                            </button>
                        </Link>
                        <Link href="/pricing">
                            <button className="inline-flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07]">
                                {t("employersCtaSecondary")}
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
