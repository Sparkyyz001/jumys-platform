"use client";

import Link from "next/link";
import { Quote } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function CaseStudy() {
    const { t } = useI18n();

    return (
        <section className="py-16">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-10 text-foreground">{t("caseStudyHeading")}</h2>
                <div className="max-w-4xl mx-auto rounded-2xl border border-border bg-card shadow-sm p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-3">
                        <div className="size-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                            CT
                        </div>
                        <p className="mt-3 font-semibold text-foreground">{t("caseStudyCompany")}</p>
                        <p className="text-sm text-muted-foreground">{t("caseStudyRole")}</p>
                    </div>
                    <div className="lg:col-span-6 relative">
                        <Quote className="absolute -top-2 -left-2 size-6 text-muted-foreground/30" />
                        <p className="italic text-muted-foreground pl-4">{t("caseStudyQuote")}</p>
                    </div>
                    <div className="lg:col-span-3">
                        <p className="text-4xl font-bold text-emerald-500">−68%</p>
                        <p className="text-sm text-muted-foreground">{t("caseStudyTime")}</p>
                    </div>
                </div>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    <Link href="https://t.me/jumys_support" target="_blank" rel="noreferrer" className="hover:underline">
                        {t("caseStudyLink")}
                    </Link>
                </p>
            </div>
        </section>
    );
}
