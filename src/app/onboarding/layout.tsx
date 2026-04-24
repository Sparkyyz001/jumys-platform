import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            <header className="border-b border-gray-100 bg-white">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center">
                    <Link href="/" className="flex items-center gap-2 text-primary-700 font-bold text-xl">
                        <Briefcase className="h-6 w-6" />
                        Jumys
                    </Link>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 py-12">
                {children}
            </main>
        </div>
    );
}
