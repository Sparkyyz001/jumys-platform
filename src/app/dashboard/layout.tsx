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
        <div className="dark min-h-screen relative text-white flex w-full overflow-x-hidden isolate">
            <MeshGridBackground intensity="soft" />
            <div className="relative z-10 flex w-full">
                <DashboardNav
                    role={data.profile.role}
                    email={data.user.email}
                    name={data.profile.full_name}
                />
                <main className="flex-1 min-w-0 lg:h-screen lg:overflow-y-auto">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
