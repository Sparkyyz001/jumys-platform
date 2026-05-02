import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100">
            <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: "radial-gradient(ellipse 60% 40% at 70% 0%, rgba(251,146,60,0.06), transparent 60%), radial-gradient(ellipse 40% 40% at 10% 100%, rgba(251,146,60,0.04), transparent 60%)" }} />
            <header className="border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center">
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-xl">
                        <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/30">
                            <Briefcase className="h-4 w-4 text-amber-400" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">Jumys</span>
                    </Link>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 py-12">
                {children}
            </main>
        </div>
    );
}
