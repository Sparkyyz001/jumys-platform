"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, LayoutDashboard, Sparkles, FileText, LogOut, Plus, Settings, LifeBuoy, ShieldCheck, Map as MapIcon, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createSPASassClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
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
            { href: "/dashboard", label: t("navOverview"), icon: LayoutDashboard },
            { href: "/dashboard/jobs", label: t("navMyJobs"), icon: Briefcase },
            { href: "/dashboard/applications", label: t("navApplications"), icon: FileText },
            { href: "/jobs", label: t("findJob"), icon: Sparkles },
            { href: "/jobs/map", label: t("mapView"), icon: MapIcon },
        ]
        : [
            { href: "/dashboard", label: t("navOverview"), icon: LayoutDashboard },
            { href: "/dashboard/recommendations", label: t("navMatches"), icon: Sparkles },
            { href: "/dashboard/applications", label: t("navMyApps"), icon: FileText },
            { href: "/jobs", label: t("findJob"), icon: Briefcase },
            { href: "/jobs/map", label: t("mapView"), icon: MapIcon },
        ];
    const tailLinks = [
        { href: "/pricing", label: t("pricing"), icon: Crown },
        { href: "/dashboard/settings", label: t("settings"), icon: Settings },
        { href: "/dashboard/settings#trust-safety", label: t("verify"), icon: ShieldCheck },
        { href: "https://t.me/jumys_support", label: t("navSupport"), icon: LifeBuoy, external: true },
    ];

    const handleLogout = async () => {
        const client = await createSPASassClient();
        await client.logout();
        router.push("/");
    };

    const linkBase = "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const linkInactive = "text-gray-300 hover:bg-white/5 hover:text-white";
    const linkActive = "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white ring-1 ring-blue-500/30";

    return (
        <>
            {/* Mobile header */}
            <div className="lg:hidden sticky top-0 z-40 border-b border-white/10 bg-[#0b1326]/80 backdrop-blur-xl">
                <div className="px-4 py-3 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400"
                    >
                        <Briefcase className="h-5 w-5 text-blue-400" />
                        Jumys
                    </Link>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
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
                                    "whitespace-nowrap inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium border transition-colors",
                                    active
                                        ? "bg-blue-600/20 border-blue-500/40 text-white"
                                        : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Desktop sidebar - sticky on scroll */}
            <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/10 bg-[#0a1224]/80 backdrop-blur-xl flex-col sticky top-0 h-screen">
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400"
                    >
                        <Briefcase className="h-6 w-6 text-blue-400" />
                        Jumys
                    </Link>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {role === "employer" && (
                        <Link href="/jobs/new">
                            <Button
                                className="w-full mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-blue-500/30"
                                size="sm"
                            >
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
                                className={cn(linkBase, active ? linkActive : linkInactive)}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        );
                    })}
                    <div className="my-3 border-t border-white/10" />
                    {tailLinks.map(({ href, label, icon: Icon, external }) => {
                        const active = !external && (pathname === href || pathname.startsWith(href.split("#")[0]));
                        return (
                            <Link
                                key={href}
                                href={href}
                                target={external ? "_blank" : undefined}
                                rel={external ? "noreferrer" : undefined}
                                className={cn(linkBase, active ? linkActive : linkInactive)}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between gap-2 px-1">
                        <LanguageSwitcher />
                    </div>
                    <div className="px-3 py-2">
                        <p className="text-sm font-medium text-white truncate">{name ?? email ?? t("user")}</p>
                        <p className="text-xs text-gray-400 truncate">
                            {role === "employer" ? t("employer") : t("seeker")}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        {t("logout")}
                    </button>
                </div>
            </aside>
        </>
    );
}
