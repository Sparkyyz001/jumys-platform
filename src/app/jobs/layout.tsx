import Link from "next/link";
import { Briefcase } from "lucide-react";
import { createSSRClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DashboardNav } from "@/components/DashboardNav";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

export default async function JobsLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = user
        ? await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle()
        : { data: null };
    const profileRow = profile as { role: "employer" | "seeker"; full_name: string | null } | null;

    return (
        <div className="min-h-screen bg-background w-full overflow-x-hidden">
            <header className="border-b bg-background/95 sticky top-0 z-40 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-primary-700 font-bold text-xl">
                        <Briefcase className="h-6 w-6" />
                        Jumys
                    </Link>
                    <nav className="flex items-center gap-4">
                        <ThemeToggle />
                        <LanguageSwitcher />
                        {user ? (
                            <>
                                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline-block">
                                    Кабинет
                                </Link>
                                <Link href="/dashboard">
                                    <Button size="sm">Открыть кабинет</Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
                                    Войти
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="sm">Регистрация</Button>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>
            {user && profileRow?.role ? (
                <div className="flex">
                    <DashboardNav role={profileRow.role} email={user.email ?? null} name={profileRow.full_name ?? null} />
                    <main className="flex-1 min-w-0">
                        <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
                    </main>
                </div>
            ) : (
                <main>{children}</main>
            )}
        </div>
    );
}
