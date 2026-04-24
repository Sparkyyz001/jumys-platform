import Link from "next/link";
import { ArrowRight, Briefcase, Sparkles, MessageCircle, MapPin, Users, ShieldCheck } from "lucide-react";
import { createSSRClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroMeshBackground } from "@/components/HeroMeshBackground";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = {
    title: "Jumys — AI-поиск работы в Актау",
    description: "Найдите работу или сотрудников в Актау с помощью AI-подбора"
};
export const dynamic = "force-dynamic";

export default async function Home() {
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();

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

            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="border border-white/45 bg-white/65 backdrop-blur-xl hover:shadow-[0_18px_45px_rgba(124,58,237,0.16)] hover:-translate-y-1 transition-all duration-200">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                                    <Sparkles className="h-6 w-6 text-primary-700" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">AI-подбор</h3>
                                <p className="text-gray-600 text-sm">
                                    Вакансии ранжируются по соответствию вашим навыкам и району
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border border-white/45 bg-white/65 backdrop-blur-xl hover:shadow-[0_18px_45px_rgba(124,58,237,0.16)] hover:-translate-y-1 transition-all duration-200">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                                    <MessageCircle className="h-6 w-6 text-primary-700" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Telegram-бот</h3>
                                <p className="text-gray-600 text-sm">
                                    Получайте уведомления и откликайтесь в один клик из Telegram
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border border-white/45 bg-white/65 backdrop-blur-xl hover:shadow-[0_18px_45px_rgba(124,58,237,0.16)] hover:-translate-y-1 transition-all duration-200">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                                    <MapPin className="h-6 w-6 text-primary-700" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Только Актау</h3>
                                <p className="text-gray-600 text-sm">
                                    Фильтруйте по микрорайонам: 1, 3А, 4А, Приморский, Koktem и другим
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-3">
                    <Card className="bg-white/80 border-white/50">
                        <CardContent className="p-5">
                            <p className="text-xs text-gray-500">Активные вакансии</p>
                            <p className="text-2xl font-bold mt-1">120+</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 border-white/50">
                        <CardContent className="p-5">
                            <p className="text-xs text-gray-500">Проверенные профили</p>
                            <p className="text-2xl font-bold mt-1">80+</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 border-white/50">
                        <CardContent className="p-5">
                            <p className="text-xs text-gray-500">Отклики за неделю</p>
                            <p className="text-2xl font-bold mt-1">300+</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

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
