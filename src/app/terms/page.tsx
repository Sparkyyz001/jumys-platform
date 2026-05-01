import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Условия использования — Jumys",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
        <div className="text-sm text-gray-300 leading-relaxed space-y-2 [&_a]:text-amber-400 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
            {children}
        </div>
    </section>
);

export default function TermsPage() {
    return (
        <div className="dark min-h-screen relative text-white bg-[#050505]">
            <div
                className="pointer-events-none fixed inset-0 -z-10"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 10% 10%, rgba(251,146,60,0.06), transparent 60%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(56,189,248,0.06), transparent 60%)",
                }}
            />
            <div className="max-w-3xl mx-auto px-4 py-12">
                <Link
                    href="/"
                    className="inline-flex items-center text-xs text-gray-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    На главную
                </Link>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Условия использования</h1>
                <p className="text-sm text-gray-500 mt-1 mb-10">Обновлено: 25 апреля 2026 г.</p>

                <Section title="1. О сервисе">
                    <p>
                        Jumys Platform — сервис AI-поиска работы и кандидатов в Актау. Сервис в стадии MVP,
                        мы можем менять функциональность и ценообразование. Об изменениях уведомим в Telegram.
                    </p>
                </Section>

                <Section title="2. Регистрация">
                    <ul>
                        <li>Использование сервиса возможно только после регистрации с подтверждением email.</li>
                        <li>Один человек — один аккаунт.</li>
                        <li>Запрещено выдавать себя за другое лицо или компанию.</li>
                    </ul>
                </Section>

                <Section title="3. Контент пользователей">
                    <ul>
                        <li>Запрещены вакансии с нарушением трудового законодательства РК.</li>
                        <li>Запрещены оффер-обманы (несуществующие вакансии, схемы «оплати за стажировку»).</li>
                        <li>Запрещён спам и автоматизированные отклики.</li>
                    </ul>
                </Section>

                <Section title="4. Тарифы Boost / Pro">
                    <p>
                        Платные тарифы дают приоритет в выдаче и дополнительные возможности (см.{" "}
                        <Link href="/pricing">страницу тарифов</Link>). Оплата за месяц/год списывается единоразово,
                        можно отменить в любой момент — действие текущего периода сохраняется до конца оплаченного срока.
                    </p>
                </Section>

                <Section title="5. Возврат средств">
                    <p>
                        Возврат возможен в течение 7 дней с момента оплаты, если функция Boost не использовалась
                        (вакансия не была закреплена в ТОПе). Запрос — на{" "}
                        <a href="mailto:billing@jumys.kz">billing@jumys.kz</a>.
                    </p>
                </Section>

                <Section title="6. Ограничение ответственности">
                    <p>
                        Jumys предоставляет инфраструктуру для встречи работодателей и соискателей. Мы не являемся
                        стороной трудового договора и не отвечаем за действия пользователей друг перед другом,
                        кроме случаев, когда мы прямо нарушили законодательство РК.
                    </p>
                </Section>

                <Section title="7. Контакты">
                    <p>
                        Поддержка — <a href="https://t.me/jumys_support">Telegram @jumys_support</a>.
                        По вопросам конфиденциальности — см.{" "}
                        <Link href="/privacy">политику конфиденциальности</Link>.
                    </p>
                </Section>
            </div>
        </div>
    );
}
