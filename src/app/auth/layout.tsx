import Link from "next/link";
import { ArrowLeft, ArrowRight, Briefcase } from "lucide-react";
import { DotMapBackground } from "@/components/ui/dot-map-background";
import { MeshGridBackground } from "@/components/ui/mesh-grid-bg";
import { ParallaxLightSpots } from "@/components/ui/cinematic-effects";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#050505] p-4">
            <MeshGridBackground intensity="default" />
            <ParallaxLightSpots />
            <div className="relative z-0 flex w-full max-w-5xl overflow-hidden rounded-2xl bg-[#090b13]/90 text-white shadow-2xl ring-1 ring-white/[0.08] backdrop-blur-3xl">
                <div className="relative hidden min-h-[640px] overflow-hidden border-r border-white/[0.06] md:block md:w-1/2">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0f1120] to-[#151929]">
                        <DotMapBackground />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
                            <Link
                                href="/"
                                className="absolute left-6 top-6 inline-flex items-center text-xs text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                                На главную
                            </Link>
                            <div className="mb-6 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Briefcase className="text-white h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                                Jumys Platform
                            </h2>
                            <p className="text-sm text-center text-gray-400 max-w-xs mb-8">
                                AI-подбор работы и кандидатов в Актау. Уведомления в Telegram, верификация компаний.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-center gap-2">
                                    <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
                                    Умная подборка по навыкам и району
                                </li>
                                <li className="flex items-center gap-2">
                                    <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
                                    Telegram-бот с откликом в один клик
                                </li>
                                <li className="flex items-center gap-2">
                                    <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
                                    Verified Business для работодателей
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                    <Link
                        href="/"
                        className="md:hidden mb-4 inline-flex items-center text-xs text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                        На главную
                    </Link>
                    {children}
                </div>
            </div>
        </div>
    );
}
