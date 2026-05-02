"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, LayoutDashboard, Sparkles, FileText, LogOut, Plus, Settings, LifeBuoy, ShieldCheck, Map as MapIcon, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
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

    const linkBase = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200";
    const linkInactive = "text-zinc-400 hover:bg-amber-500/[0.07] hover:text-amber-100";
    const linkActive = "bg-gradient-to-r from-amber-500/20 to-orange-500/[0.12] text-amber-100 ring-1 ring-amber-500/30 shadow-sm shadow-amber-500/10";

    return (
        <>
            <style>{`
                @keyframes sb-orb-pulse {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.85; transform: scale(1.08); }
                }
                .sb-orb { animation: sb-orb-pulse 5s ease-in-out infinite; }
                @keyframes sb-line-flow {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
            `}</style>

            {/* ── Mobile top bar ── */}
            <div className="lg:hidden sticky top-0 z-40 border-b border-white/[0.06] bg-[#050505]/95 backdrop-blur-xl">
                <div className="px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                        <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500/25 to-orange-500/15 border border-amber-500/30">
                            <Briefcase className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">Jumys</span>
                    </Link>
                    <LanguageSwitcher />
                </div>
                <nav className="px-3 pb-3 flex gap-1.5 overflow-x-auto">
                    {links.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                                    active
                                        ? "bg-amber-500/20 border-amber-500/40 text-amber-100"
                                        : "bg-white/[0.03] text-zinc-400 border-white/[0.07] hover:text-amber-200 hover:bg-amber-500/[0.07] hover:border-amber-500/25"
                                )}
                            >
                                <Icon className="h-3 w-3" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* ── Desktop sidebar ── */}
            <aside
                className="hidden lg:flex w-64 shrink-0 flex-col sticky top-0 h-screen relative overflow-hidden"
                style={{
                    background: "linear-gradient(180deg, #0b0803 0%, #080704 50%, #050505 100%)",
                    borderRight: "1px solid rgba(251,146,60,0.09)",
                }}
            >
                {/* Ambient orb at top */}
                <div className="sb-orb pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-amber-500/[0.06] blur-3xl" />
                {/* Thin amber glow line on right edge */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-amber-500/25 to-transparent" />

                {/* Logo header */}
                <div className="relative h-16 flex items-center px-5 border-b border-white/[0.05]">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500/25 to-orange-500/15 border border-amber-500/35 shadow-lg shadow-amber-500/10">
                            <Briefcase className="h-4.5 w-4.5 text-amber-400" style={{ height: "1.1rem", width: "1.1rem" }} />
                        </div>
                        <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400 tracking-tight">
                            Jumys
                        </span>
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    {role === "employer" && (
                        <Link href="/jobs/new" className="block mb-3">
                            <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all">
                                <Plus className="h-4 w-4" />
                                {t("postJob")}
                            </button>
                        </Link>
                    )}

                    {links.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                        return (
                            <Link key={href} href={href} className={cn(linkBase, active ? linkActive : linkInactive)}>
                                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-amber-400" : "")} />
                                {label}
                            </Link>
                        );
                    })}

                    {/* Amber glow divider */}
                    <div className="my-3 mx-2">
                        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/18 to-transparent" />
                    </div>

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
                                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-amber-400" : "")} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom user section */}
                <div className="p-3 border-t border-white/[0.05] space-y-2">
                    <div className="px-1">
                        <LanguageSwitcher />
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 hover:border-amber-500/20 transition-all duration-200">
                        <p className="text-sm font-medium text-zinc-200 truncate">{name ?? email ?? t("user")}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">
                            {role === "employer" ? t("employer") : t("seeker")}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-red-400/80 hover:bg-red-500/[0.07] hover:text-red-300 transition-all duration-200"
                    >
                        <LogOut className="h-4 w-4" />
                        {t("logout")}
                    </button>
                </div>
            </aside>
        </>
    );
}
