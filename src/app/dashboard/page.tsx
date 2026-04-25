import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, Sparkles, Users, Plus, MessageCircle, CheckCircle2 } from "lucide-react";
import { getCurrentFullProfile } from "@/lib/profile";
import { createSSRClient } from "@/lib/supabase/server";

export const metadata = { title: "Обзор — Jumys" };
export const dynamic = "force-dynamic";

export default async function DashboardHome() {
    const data = await getCurrentFullProfile();
    if (!data || !data.profile) return null;
    const supabase = await createSSRClient();

    const isEmployer = data.profile.role === "employer";

    let jobsCount = 0;
    let applicationsCount = 0;
    let newApplicationsCount = 0;

    if (isEmployer) {
        const { count: jc } = await supabase
            .from("jobs")
            .select("id", { count: "exact", head: true })
            .eq("employer_id", data.user.id);
        jobsCount = jc ?? 0;

        const { data: myJobs } = await supabase
            .from("jobs")
            .select("id")
            .eq("employer_id", data.user.id);
        const jobRows = (myJobs ?? []) as Array<{ id: string }>;
        const jobIds = jobRows.map(j => j.id);

        if (jobIds.length > 0) {
            const { count: ac } = await supabase
                .from("applications")
                .select("id", { count: "exact", head: true })
                .in("job_id", jobIds);
            applicationsCount = ac ?? 0;

            const { count: nac } = await supabase
                .from("applications")
                .select("id", { count: "exact", head: true })
                .in("job_id", jobIds)
                .eq("status", "new");
            newApplicationsCount = nac ?? 0;
        }
    } else {
        const { count: ac } = await supabase
            .from("applications")
            .select("id", { count: "exact", head: true })
            .eq("seeker_id", data.user.id);
        applicationsCount = ac ?? 0;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    Привет, {data.profile.full_name?.split(" ")[0] ?? "друг"}!
                </h1>
                <p className="text-muted-foreground mt-1">
                    {isEmployer
                        ? "Управляйте вакансиями и откликами"
                        : "Откликайтесь на вакансии в Актау"}
                </p>
            </div>

            {isEmployer ? (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-5 w-5 text-primary-700" />
                                <CardTitle>Мои вакансии</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{jobsCount}</p>
                            <Link href="/dashboard/jobs" className="text-sm text-primary-700 hover:underline">
                                Посмотреть →
                            </Link>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-primary-700" />
                                <CardTitle>Отклики</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{applicationsCount}</p>
                            <Link href="/dashboard/applications" className="text-sm text-primary-700 hover:underline">
                                Посмотреть →
                            </Link>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-amber-600" />
                                <CardTitle>Новые</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-amber-600">{newApplicationsCount}</p>
                            <p className="text-sm text-gray-500">Ожидают просмотра</p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Sparkles className="h-5 w-5 text-primary-700" />
                                <CardTitle>AI Рекомендации</CardTitle>
                            </div>
                            <CardDescription>Подборка вакансий по вашему профилю</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/recommendations">
                                <Button>Смотреть подборку</Button>
                            </Link>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-primary-700" />
                                <CardTitle>Мои отклики</CardTitle>
                            </div>
                            <CardDescription>{applicationsCount} шт.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/applications">
                                <Button variant="outline">Посмотреть</Button>
                            </Link>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <MessageCircle className="h-5 w-5 text-emerald-600" />
                                <CardTitle>Telegram</CardTitle>
                            </div>
                            <CardDescription className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                Уведомления подключены
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/settings">
                                <Button variant="outline" size="sm">Управлять</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            )}

            {isEmployer && (
                <Card>
                    <CardHeader>
                        <CardTitle>Быстрые действия</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link href="/jobs/new">
                            <Button>
                                <Plus className="h-4 w-4" />
                                Создать вакансию
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
