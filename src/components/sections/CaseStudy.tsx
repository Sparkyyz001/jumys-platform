"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Quote, TrendingDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function CaseStudy() {
    const { t } = useI18n();

    return (
        <>
            {/* ── Amber section divider ── */}
            <div className="pointer-events-none mx-auto max-w-4xl px-4">
                <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            </div>

            <motion.section
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="py-20"
            >
                <div className="max-w-7xl mx-auto px-4">
                    <motion.h2
                        initial={{ opacity: 0, filter: "blur(8px)", y: 12 }}
                        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="mb-12 text-center text-4xl font-semibold tracking-tighter text-zinc-100"
                    >
                        {t("caseStudyHeading")}
                    </motion.h2>

                    <div className="mx-auto max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97, y: 16 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="relative grid grid-cols-1 items-center gap-6 rounded-2xl border border-amber-500/[0.12] bg-white/[0.02] p-8 backdrop-blur-3xl lg:grid-cols-12"
                            style={{ boxShadow: "0 0 60px rgba(245,158,11,0.04), inset 0 1px 0 rgba(245,158,11,0.06)" }}
                        >
                            {/* Top glow */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

                            {/* Company */}
                            <div className="lg:col-span-3">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/[0.08] font-bold text-amber-300 shadow-lg shadow-amber-500/10">
                                    CT
                                </div>
                                <p className="mt-3 font-semibold text-zinc-100">{t("caseStudyCompany")}</p>
                                <p className="text-sm text-zinc-400">{t("caseStudyRole")}</p>
                            </div>

                            {/* Quote */}
                            <div className="lg:col-span-6 relative">
                                <Quote className="absolute -left-2 -top-2 size-6 text-amber-500/30" />
                                <p className="pl-4 italic text-zinc-400 leading-relaxed">{t("caseStudyQuote")}</p>
                            </div>

                            {/* Metric */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="lg:col-span-3 text-center lg:text-left"
                            >
                                <div className="inline-flex items-center gap-1.5">
                                    <TrendingDown className="h-6 w-6 text-emerald-400" />
                                    <p className="text-4xl font-bold tracking-tight text-emerald-400">−68%</p>
                                </div>
                                <p className="text-sm text-zinc-400 mt-1">{t("caseStudyTime")}</p>
                            </motion.div>
                        </motion.div>

                        <p className="mt-6 text-center text-sm text-zinc-500">
                            <Link
                                href="https://t.me/jumys_support"
                                target="_blank"
                                rel="noreferrer"
                                className="text-amber-400/70 hover:text-amber-300 transition-colors hover:underline"
                            >
                                {t("caseStudyLink")}
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.section>
        </>
    );
}
