"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function CaseStudy() {
    const { t } = useI18n();

    return (
        <motion.section
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="py-20"
        >
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="mb-12 text-center text-4xl font-semibold tracking-tighter text-zinc-100">{t("caseStudyHeading")}</h2>
                <div className="mx-auto grid max-w-4xl grid-cols-1 items-center gap-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-3xl lg:grid-cols-12">
                    <div className="lg:col-span-3">
                        <div className="flex size-14 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] font-semibold text-zinc-100">
                            CT
                        </div>
                        <p className="mt-3 font-semibold text-zinc-100">{t("caseStudyCompany")}</p>
                        <p className="text-sm text-zinc-400">{t("caseStudyRole")}</p>
                    </div>
                    <div className="lg:col-span-6 relative">
                        <Quote className="absolute -left-2 -top-2 size-6 text-zinc-600" />
                        <p className="pl-4 italic text-zinc-400">{t("caseStudyQuote")}</p>
                    </div>
                    <div className="lg:col-span-3">
                        <p className="text-4xl font-semibold tracking-tight text-emerald-400">−68%</p>
                        <p className="text-sm text-zinc-400">{t("caseStudyTime")}</p>
                    </div>
                </div>
                <p className="mt-6 text-center text-sm text-zinc-400">
                    <Link href="https://t.me/jumys_support" target="_blank" rel="noreferrer" className="hover:underline">
                        {t("caseStudyLink")}
                    </Link>
                </p>
            </div>
        </motion.section>
    );
}
