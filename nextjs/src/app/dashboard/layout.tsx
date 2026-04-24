import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { getCurrentFullProfile } from "@/lib/profile";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const data = await getCurrentFullProfile();
    if (!data) redirect("/auth/login");

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
        <div className="min-h-screen bg-gray-50 flex w-full overflow-x-hidden">
            <DashboardNav
                role={data.profile.role}
                email={data.user.email}
                name={data.profile.full_name}
            />
            <main className="flex-1 min-w-0">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
