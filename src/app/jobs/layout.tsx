import Link from "next/link";
import { Briefcase } from "lucide-react";
import { createSSRClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DashboardNav } from "@/components/DashboardNav";

export const dynamic = "force-dynamic";

export default async function JobsLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = user
        ? await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle()
        : { data: null };
    const profileRow = profile as { role: "employer" | "seeker"; full_name: string | null } | null;

    return (
        <div className="min-h-screen w-full bg-[#050505] text-zinc-100">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-lg font-bold tracking-tight text-white"
                    >
                        <Briefcase className="h-6 w-6 text-amber-400" />
                        Jumys
                    </Link>
                    <nav className="flex items-center gap-3 sm:gap-4">
                        <LanguageSwitcher />
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="hidden text-sm text-zinc-400 transition-colors hover:text-white sm:inline-block"
                                >
                                    Кабинет
                                </Link>
                                <Link href="/dashboard">
                                    <Button
                                        size="sm"
                                        className="border-0 bg-white text-black hover:bg-zinc-200"
                                    >
                                        Открыть кабинет
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                                >
                                    Войти
                                </Link>
                                <Link href="/auth/register">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
                                    >
                                        Регистрация
                                    </Button>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>
            {user && profileRow?.role ? (
                <div className="flex">
                    <DashboardNav role={profileRow.role} email={user.email ?? null} name={profileRow.full_name ?? null} />
                    <main className="min-w-0 flex-1 bg-[#050505]">{children}</main>
                </div>
            ) : (
                <main className="bg-[#050505]">{children}</main>
            )}
        </div>
    );
}
