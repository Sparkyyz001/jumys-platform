import Link from "next/link";
import { Search, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Выберите роль — Jumys" };

export default function RolePage() {
    return (
        <div>
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Кто вы?</h1>
                <p className="mt-2 text-gray-600">Выберите, как будете использовать Jumys</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Link href="/onboarding/seeker" className="group">
                    <Card className="h-full transition-all group-hover:shadow-lg group-hover:border-primary-400 cursor-pointer">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                                <Search className="h-6 w-6 text-primary-700" />
                            </div>
                            <CardTitle>Ищу работу</CardTitle>
                            <CardDescription>
                                Заполните профиль, получайте подходящие вакансии в Актау и откликайтесь в один клик
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• AI-подбор вакансий под ваши навыки</li>
                                <li>• Объяснение почему вакансия подходит</li>
                                <li>• Уведомления в Telegram</li>
                            </ul>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/onboarding/employer" className="group">
                    <Card className="h-full transition-all group-hover:shadow-lg group-hover:border-primary-400 cursor-pointer">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                                <Users className="h-6 w-6 text-primary-700" />
                            </div>
                            <CardTitle>Ищу сотрудников</CardTitle>
                            <CardDescription>
                                Разместите вакансии и получите подборку подходящих кандидатов автоматически
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Публикация вакансий</li>
                                <li>• AI-ранжирование откликов</li>
                                <li>• Связь с кандидатами по WhatsApp</li>
                            </ul>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
