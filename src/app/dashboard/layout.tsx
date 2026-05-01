import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { MeshGridBackground } from "@/components/ui/mesh-grid-bg";
import { getCurrentFullProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const data = await getCurrentFullProfile();
    if (!data) redirect("/auth/login");
    if (!data.user.email_confirmed) {
        redirect("/auth/verify-email");
    }

    if (!data.profile || !data.profile.role) {
        redirect("/onboarding/role");
    }
    if (data.profile.role === "seeker" && !data.seeker) {
        redirect("/onboarding/seeker");
    }
    if (data.profile.role === "employer" && !data.employer) {
        redirect("/onboarding/employer");
    }
    if (!data.profile.telegram_chat_id) {
        redirect("/onboarding/telegram");
    }

    return (
        <div className="dark min-h-screen relative text-white flex w-full bg-[#050505]">
            <MeshGridBackground intensity="soft" />
            <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: "radial-gradient(ellipse 60% 40% at 80% 10%, rgba(251,146,60,0.06), transparent 60%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(56,189,248,0.05), transparent 60%)" }} />
            <DashboardNav
                role={data.profile.role}
                email={data.user.email}
                name={data.profile.full_name}
            />
            <main className="flex-1 min-w-0 lg:h-screen lg:overflow-y-auto relative z-0">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
