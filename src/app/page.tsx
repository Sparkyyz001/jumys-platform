import Link from "next/link";
import { ArrowRight, Briefcase, MapPin, Users, ShieldCheck } from "lucide-react";
import { createSSRClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroMeshBackground } from "@/components/HeroMeshBackground";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { JobCard } from "@/components/JobCard";
import { ProjectShowcase, type ProjectShowcaseItem } from "@/components/ui/project-showcase";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-env";

const ROADMAP_ITEMS: ProjectShowcaseItem[] = [
    {
        title: "AI-подбор вакансий",
        description: "Embedding-модель ранжирует вакансии под ваш профиль и навыки — без ручного поиска.",
        badge: "01",
        link: "/jobs",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    },
    {
        title: "Telegram-бот для откликов",
        description: "Уведомления о новых вакансиях и отклики в один клик прямо в Telegram.",
        badge: "02",
        link: "/auth/register",
        image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?q=80&w=1200&auto=format&fit=crop",
    },
    {
        title: "Только Актау",
        description: "Фильтры по микрорайонам Актау: 1, 3А, 4А, Приморский, Koktem и другие.",
        badge: "03",
        link: "/jobs",
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1200&auto=format&fit=crop",
    },
    {
        title: "Проверенные компании",
        description: "Верификация работодателей по BIN/IIN и значок Verified Business в карточке вакансии.",
        badge: "04",
        link: "/auth/register",
        image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1200&auto=format&fit=crop",
    },
];

export const metadata = {
    title: "Jumys — AI-поиск работы в Актау",
    description: "Найдите работу или сотрудников в Актау с помощью AI-подбора"
};
export const dynamic = "force-dynamic";

interface LatestJob {
    id: string;
    title: string;
    district: string | null;
    category: string | null;
    employment: string | null;
    salary_from: number | null;
    salary_to: number | null;
    employer_id: string | null;
}

interface EmployerLite {
    profile_id: string;
    company_name: string | null;
    company_type: string | null;
}

export default async function Home() {
    let user: { id: string; email?: string | null } | null = null;
    let activeJobsCount = 0;
    let seekersCount = 0;
    let applicationsLastWeek = 0;
    let latestJobs: LatestJob[] = [];
    const employerById = new Map<string, EmployerLite>();

    if (isSupabaseBrowserConfigured()) {
        try {
            const supabase = await createSSRClient();
            const { data: { user: u } } = await supabase.auth.getUser();
            user = u;

            const [jobsCountRes, seekersCountRes, appsCountRes, latestRes] = await Promise.all([
                supabase.from("jobs").select("id", { count: "exact", head: true }).eq("is_active", true),
                supabase.from("seeker_profiles").select("profile_id", { count: "exact", head: true }),
                supabase
                    .from("applications")
                    .select("id", { count: "exact", head: true })
                    .gte("created_at", new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()),
                supabase
                    .from("jobs")
                    .select("id, title, district, category, employment, salary_from, salary_to, employer_id, is_active, created_at")
                    .eq("is_active", true)
                    .order("created_at", { ascending: false })
                    .limit(6),
            ]);
            activeJobsCount = jobsCountRes.count ?? 0;
            seekersCount = seekersCountRes.count ?? 0;
            applicationsLastWeek = appsCountRes.count ?? 0;
            latestJobs = ((latestRes.data ?? []) as LatestJob[]).slice(0, 6);

            const employerIds = Array.from(
                new Set(latestJobs.map(j => j.employer_id).filter((v): v is string => Boolean(v)))
            );
            if (employerIds.length > 0) {
                const { data: emps } = await supabase
                    .from("employer_profiles")
                    .select("profile_id, company_name, company_type")
                    .in("profile_id", employerIds);
                ((emps ?? []) as EmployerLite[]).forEach(e => employerById.set(e.profile_id, e));
            }
        } catch (e) {
            console.error("home data", e);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-slate-100">
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-white/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="flex items-center gap-2 text-primary-700 font-bold text-xl">
                            <Briefcase className="h-6 w-6" />
                            Jumys
                        </Link>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <LanguageSwitcher />
                            {user ? (
                                <>
                                    <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline-block">
                                        Профиль
                                    </Link>
                                    <Link href="/dashboard">
                                        <Button size="sm">Кабинет</Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login">
                                        <Button variant="ghost" size="sm">Войти</Button>
                                    </Link>
                                    <Link href="/auth/register">
                                        <Button size="sm">Регистрация</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <HeroMeshBackground />
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-1.5 border border-white/50 bg-white/60 text-primary-700 px-3 py-1 rounded-full text-sm font-medium mb-6 shadow-sm backdrop-blur-md">
                        <MapPin className="h-3.5 w-3.5" />
                        Актау, Казахстан
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
                        {user ? "Работа в Актау" : "Jumys Platform: Работа в Актау для молодежи"} <br />
                        <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">с AI-подбором</span>
                    </h1>
                    <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
                        Jumys подбирает вакансии под ваш профиль, а работодателям находит подходящих кандидатов автоматически
                    </p>
                    <div className="mt-10 flex gap-3 justify-center flex-wrap">
                        <Link href="/auth/register">
                            <Button size="lg">
                                Начать искать работу
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href={user ? "/jobs" : "/auth/login?next=/jobs"}>
                            <Button variant="outline" size="lg">
                                Смотреть вакансии
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-10 px-4">
                <ProjectShowcase items={ROADMAP_ITEMS} heading="Как Jumys работает" />
            </section>

            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-3">
                    <Card className="bg-white/80 border-white/50">
                        <CardContent className="p-5">
                            <p className="text-xs text-gray-500">Активные вакансии</p>
                            <p className="text-2xl font-bold mt-1">{activeJobsCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 border-white/50">
                        <CardContent className="p-5">
                            <p className="text-xs text-gray-500">Соискатели в системе</p>
                            <p className="text-2xl font-bold mt-1">{seekersCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 border-white/50">
                        <CardContent className="p-5">
                            <p className="text-xs text-gray-500">Отклики за неделю</p>
                            <p className="text-2xl font-bold mt-1">{applicationsLastWeek}</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {latestJobs.length > 0 && (
                <section className="py-14 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold">Свежие вакансии в Актау</h2>
                                <p className="text-sm text-gray-600 mt-1">Реальные предложения, обновляются в реальном времени</p>
                            </div>
                            <Link href={user ? "/jobs" : "/auth/login?next=/jobs"}>
                                <Button variant="outline" size="sm">
                                    Все вакансии
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {latestJobs.map(j => {
                                const emp = j.employer_id ? employerById.get(j.employer_id) : null;
                                const verified = Boolean(emp?.company_type && /BIN\/IIN:\s*\d{12}/i.test(emp.company_type));
                                return (
                                    <JobCard
                                        key={j.id}
                                        id={j.id}
                                        title={j.title}
                                        company={emp?.company_name ?? null}
                                        district={j.district}
                                        category={j.category}
                                        employment={j.employment}
                                        salary_from={j.salary_from}
                                        salary_to={j.salary_to}
                                        verified={verified}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            <section className="py-10 px-4">
                <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-2">
                    <Card className="border border-white/45 bg-white/70 backdrop-blur-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="h-5 w-5 text-primary-700" />
                                <h3 className="font-semibold">Для молодежи и студентов</h3>
                            </div>
                            <p className="text-sm text-gray-600">Подработка, стажировки и стартовые вакансии в Актау с фильтрами по району и опыту.</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-white/45 bg-white/70 backdrop-blur-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldCheck className="h-5 w-5 text-primary-700" />
                                <h3 className="font-semibold">Проверка личности</h3>
                            </div>
                            <p className="text-sm text-gray-600">В настройках доступна отдельная вкладка верификации работодателя и соискателя по IIN/BIN.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="py-16 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white px-4 relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Готовы найти работу в Актау?
                    </h2>
                    <p className="mt-3 text-primary-100">
                        Регистрация бесплатна, первая подборка появится сразу после заполнения профиля
                    </p>
                    <Link href="/auth/register" className="inline-block mt-8">
                        <Button size="lg" variant="secondary" className="bg-white text-primary-700 hover:bg-gray-100">
                            Создать аккаунт
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            <footer className="py-10 text-sm text-gray-500 border-t bg-white/60">
                <div className="max-w-7xl mx-auto px-4 grid gap-6 md:grid-cols-3">
                    <div>
                        <p className="font-semibold text-gray-800">Jumys Platform</p>
                        <p className="mt-2">© {new Date().getFullYear()} AI-поиск работы в Актау</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">Our Team</p>
                        <p className="mt-2">Product Lead - Hackathon Strategy</p>
                        <p>Full-stack Dev - Platform & AI Matching</p>
                        <p>UX Engineer - Mobile-first Interface</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">Support Contacts</p>
                        <a href="https://t.me/jumys_support" target="_blank" rel="noreferrer" className="block mt-2 text-primary-700 hover:underline">
                            Telegram: @jumys_support
                        </a>
                        <a href="https://wa.me/" target="_blank" rel="noreferrer" className="block text-emerald-700 hover:underline">
                            WhatsApp Support
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
