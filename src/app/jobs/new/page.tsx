import { redirect } from "next/navigation";
import { getCurrentFullProfile } from "@/lib/profile";
import { JobForm } from "./form";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Новая вакансия — Jumys" };
export const dynamic = "force-dynamic";

export default async function NewJobPage() {
    const data = await getCurrentFullProfile();
    if (!data) redirect("/auth/login");
    if (!data.profile || data.profile.role !== "employer") {
        redirect("/onboarding/role");
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/30">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-100">Новая вакансия</h1>
                </div>
                <p className="text-sm text-zinc-400 ml-10">Заполните поля — мы подберём подходящих кандидатов автоматически</p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-3xl p-6 hover:border-amber-500/15 transition-all duration-300">
                <JobForm />
            </div>
        </div>
    );
}
