"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

interface LandingNavProps {
    signedIn: boolean;
}

export function LandingNav({ signedIn }: LandingNavProps) {
    const { t } = useI18n();

    return (
        <nav className="fixed top-0 w-full bg-[#060818]/80 backdrop-blur-xl z-50 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400"
                    >
                        <Briefcase className="h-6 w-6 text-blue-400" />
                        Jumys
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/pricing"
                            className="hidden md:inline-flex items-center text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
                        >
                            {t("pricing")}
                        </Link>
                        <ThemeToggle />
                        <LanguageSwitcher />
                        {signedIn ? (
                            <Link href="/dashboard">
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0"
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
                                        className="text-gray-300 hover:text-white hover:bg-white/10"
                                    >
                                        {t("login")}
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-blue-500/20"
                                    >
                                        {t("register")}
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
