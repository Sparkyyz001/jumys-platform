import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex">
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white relative">
                <Link
                    href="/"
                    className="absolute left-8 top-8 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    На главную
                </Link>

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex items-center justify-center gap-2 text-primary-700 font-bold text-2xl">
                        <Briefcase className="h-7 w-7" />
                        Jumys
                    </div>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    {children}
                </div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800">
                <div className="w-full flex items-center justify-center p-12">
                    <div className="max-w-md text-white space-y-6">
                        <h3 className="text-3xl font-bold">
                            AI-поиск работы в Актау
                        </h3>
                        <p className="text-primary-100">
                            Jumys подбирает вакансии под ваш профиль и уведомляет о подходящих предложениях в Telegram
                        </p>
                        <ul className="space-y-2 text-primary-100">
                            <li>✓ Умная подборка по навыкам и району</li>
                            <li>✓ Telegram-бот с откликом в один клик</li>
                            <li>✓ Для работодателей — ранжирование кандидатов</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
