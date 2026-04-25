"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, LayoutDashboard, Sparkles, FileText, LogOut, Plus, Settings, LifeBuoy, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createSPASassClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface DashboardNavProps {
    role: UserRole;
    email: string | null;
    name: string | null;
}

export function DashboardNav({ role, email, name }: DashboardNavProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { t } = useI18n();

    const links = role === "employer"
        ? [
            { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
            { href: "/dashboard/jobs", label: "Мои вакансии", icon: Briefcase },
            { href: "/dashboard/applications", label: "Отклики", icon: FileText },
            { href: "/jobs", label: t("findJob"), icon: Sparkles },
        ]
        : [
            { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
            { href: "/dashboard/recommendations", label: "Подборка", icon: Sparkles },
            { href: "/dashboard/applications", label: "Мои отклики", icon: FileText },
            { href: "/jobs", label: t("findJob"), icon: Briefcase },
        ];
    const tailLinks = [
        { href: "/dashboard/settings", label: t("settings"), icon: Settings },
        { href: "/dashboard/settings#trust-safety", label: t("verify"), icon: ShieldCheck },
        { href: "https://t.me/jumys_support", label: "Support", icon: LifeBuoy, external: true },
    ];

    const handleLogout = async () => {
        const client = await createSPASassClient();
        await client.logout();
        router.push("/");
    };

    return (
        <>
            <div className="lg:hidden sticky top-0 z-40 border-b bg-white">
                <div className="px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-primary-700 font-bold text-lg">
                        <Briefcase className="h-5 w-5" />
                        Jumys
                    </Link>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </div>
                <nav className="px-3 pb-3 flex gap-2 overflow-x-auto">
                    {links.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "whitespace-nowrap inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium border",
                                    active ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-white text-gray-600 border-gray-200"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <aside className="hidden lg:flex w-64 shrink-0 border-r bg-white min-h-screen flex-col">
            <div className="h-16 flex items-center px-6 border-b">
                <Link href="/" className="flex items-center gap-2 text-primary-700 font-bold text-xl">
                    <Briefcase className="h-6 w-6" />
                    Jumys
                </Link>
            </div>

            <nav className="flex-1 p-3 space-y-1">
                {role === "employer" && (
                    <Link href="/jobs/new">
                        <Button className="w-full mb-3" size="sm">
                            <Plus className="h-4 w-4" />
                            {t("postJob")}
                        </Button>
                    </Link>
                )}

                {links.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                                active
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </Link>
                    );
                })}
                {tailLinks.map(({ href, label, icon: Icon, external }) => (
                    <Link
                        key={href}
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </Link>
                ))}
            </nav>

            <div className="p-3 border-t space-y-2">
                <div className="flex items-center justify-between gap-2 px-1">
                    <LanguageSwitcher />
                    <ThemeToggle />
                </div>
                <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{name ?? email ?? "Пользователь"}</p>
                    <p className="text-xs text-gray-500 truncate">
                        {role === "employer" ? "Работодатель" : "Соискатель"}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
                >
                    <LogOut className="h-4 w-4" />
                    Выйти
                </button>
            </div>
            </aside>
        </>
    );
}
