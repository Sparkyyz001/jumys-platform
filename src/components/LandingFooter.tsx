"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/brand/Logo";

export function LandingFooter() {
    const { t } = useI18n();
    const year = new Date().getFullYear();

    const handleScrollTop = () => {
        if (typeof window !== "undefined") {
            window.scroll({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <motion.footer
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-white/[0.015] py-14 text-sm text-zinc-400 overflow-hidden"
        >
            {/* Amber glow top line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            {/* Subtle ambient glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-amber-500/[0.04] blur-3xl" />
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="md:col-span-1">
                        <Logo className="text-white" />
                        <p className="mt-3 leading-relaxed text-zinc-500">
                            {t("footerAbout")}
                        </p>
                    </div>

                    <div>
                        <p className="mb-3 font-semibold text-zinc-100">{t("footerPlatform")}</p>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/jobs" className="transition-colors hover:text-zinc-100">
                                    {t("findJob")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/jobs/map" className="transition-colors hover:text-zinc-100">
                                    {t("mapView")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="transition-colors hover:text-zinc-100">
                                    {t("pricing")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="transition-colors hover:text-zinc-100">
                                    {t("dashboard")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="mb-3 font-semibold text-zinc-100">{t("footerDocs")}</p>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/privacy" className="transition-colors hover:text-zinc-100">
                                    {t("privacy")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="transition-colors hover:text-zinc-100">
                                    {t("terms")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="mb-3 font-semibold text-zinc-100">{t("footerSupport")}</p>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="https://t.me/jumys_support"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-amber-400 hover:text-amber-300 transition-colors"
                                >
                                    Telegram @jumys_support
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://wa.me/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-400 hover:underline"
                                >
                                    WhatsApp
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center justify-between gap-4 pt-6 text-xs text-zinc-500 sm:flex-row" style={{ borderTop: "1px solid", borderImage: "linear-gradient(90deg, transparent, rgba(251,146,60,0.2), transparent) 1" }}>
                    <p>© {year} Jumys Platform. AI-поиск работы в Актау.</p>
                    <button
                        type="button"
                        onClick={handleScrollTop}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1.5 transition-colors hover:border-white/[0.16] hover:text-zinc-100"
                        aria-label="Наверх"
                    >
                        <ArrowUp className="h-3.5 w-3.5" />
                        {t("footerBackToTop")}
                    </button>
                </div>
            </div>
        </motion.footer>
    );
}
