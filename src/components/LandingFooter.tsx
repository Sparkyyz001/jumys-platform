"use client";

import Link from "next/link";
import { Briefcase, ArrowUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function LandingFooter() {
    const { t } = useI18n();
    const year = new Date().getFullYear();

    const handleScrollTop = () => {
        if (typeof window !== "undefined") {
            window.scroll({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <footer className="py-12 text-sm text-gray-400 border-t border-white/10 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="md:col-span-1">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400"
                        >
                            <Briefcase className="h-5 w-5 text-blue-400" />
                            Jumys
                        </Link>
                        <p className="mt-3 text-gray-500 leading-relaxed">
                            AI-поиск работы и кандидатов в Актау. Уведомления в Telegram, верификация компаний.
                        </p>
                    </div>

                    <div>
                        <p className="font-semibold text-white mb-3">Платформа</p>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/jobs" className="hover:text-white transition-colors">
                                    {t("findJob")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/jobs/map" className="hover:text-white transition-colors">
                                    {t("mapView")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="hover:text-white transition-colors">
                                    {t("pricing")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="hover:text-white transition-colors">
                                    {t("dashboard")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-semibold text-white mb-3">Документы</p>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/privacy" className="hover:text-white transition-colors">
                                    {t("privacy")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-white transition-colors">
                                    {t("terms")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-semibold text-white mb-3">Поддержка</p>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="https://t.me/jumys_support"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-400 hover:underline"
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

                <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                    <p>© {year} Jumys Platform. AI-поиск работы в Актау.</p>
                    <button
                        type="button"
                        onClick={handleScrollTop}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 hover:border-white/20 hover:text-white transition-colors"
                        aria-label="Наверх"
                    >
                        <ArrowUp className="h-3.5 w-3.5" />
                        Наверх
                    </button>
                </div>
            </div>
        </footer>
    );
}
