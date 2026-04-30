"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/brand/Logo";

interface LandingNavProps {
    signedIn: boolean;
}

export function LandingNav({ signedIn }: LandingNavProps) {
    const { t } = useI18n();

    return (
        <motion.nav
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-[#050505]/85 backdrop-blur-3xl"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Logo className="text-white" />
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/pricing"
                            className="hidden md:inline-flex items-center rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-100"
                        >
                            {t("pricing")}
                        </Link>
                        <Link
                            href="/employers"
                            className="hidden md:inline-flex items-center rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-100"
                        >
                            {t("navForEmployers")}
                        </Link>
                        <LanguageSwitcher />
                        {signedIn ? (
                            <Link href="/dashboard">
                                <Button
                                    size="sm"
                                    className="border-0 bg-zinc-100 text-black hover:bg-white hover:shadow-[0_0_24px_rgba(56,189,248,0.22)]"
                                >
                                    {t("dashboard")}
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
                                    >
                                        {t("login")}
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button
                                        size="sm"
                                        className="border border-white/[0.08] bg-white/[0.03] text-zinc-100 hover:bg-sky-400/10 hover:shadow-[0_0_24px_rgba(56,189,248,0.22)]"
                                    >
                                        {t("register")}
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
