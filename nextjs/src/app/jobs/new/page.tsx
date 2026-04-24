import { redirect } from "next/navigation";
import { getCurrentFullProfile } from "@/lib/profile";
import { JobForm } from "./form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = { title: "Новая вакансия — Jumys" };

export default async function NewJobPage() {
    const data = await getCurrentFullProfile();
    if (!data) redirect("/auth/login");
    if (!data.profile || data.profile.role !== "employer") {
        redirect("/onboarding/role");
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Новая вакансия</CardTitle>
                    <CardDescription>
                        Заполните поля — мы подберём подходящих кандидатов автоматически
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <JobForm />
                </CardContent>
            </Card>
        </div>
    );
}
