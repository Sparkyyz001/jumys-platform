import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Политика конфиденциальности — Jumys",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
        <div className="text-sm text-gray-300 leading-relaxed space-y-2 [&_a]:text-blue-400 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
            {children}
        </div>
    </section>
);

export default function PrivacyPage() {
    return (
        <div className="dark min-h-screen bg-gradient-to-br from-[#060818] via-[#0a0d20] to-[#0d1023] text-white">
            <div className="max-w-3xl mx-auto px-4 py-12">
                <Link
                    href="/"
                    className="inline-flex items-center text-xs text-gray-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    На главную
                </Link>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Политика конфиденциальности</h1>
                <p className="text-sm text-gray-500 mt-1 mb-10">Обновлено: 25 апреля 2026 г.</p>

                <Section title="1. Какие данные мы собираем">
                    <ul>
                        <li>Email и пароль (хранится в виде хеша через Supabase Auth).</li>
                        <li>Имя, телефон, район Актау, навыки, опыт работы — то, что вы указали в профиле.</li>
                        <li>Telegram chat_id и username — после привязки бота.</li>
                        <li>Историю откликов на вакансии и историю постинга вакансий.</li>
                        <li>Аватар (если загрузили) — в Supabase Storage.</li>
                    </ul>
                </Section>

                <Section title="2. Зачем мы их используем">
                    <ul>
                        <li>Подбор подходящих вакансий или кандидатов AI-моделью (OpenAI embeddings, gpt-4o-mini).</li>
                        <li>Отправка уведомлений о новых вакансиях и откликах в Telegram.</li>
                        <li>Защита от спама и верификация компаний (BIN/IIN).</li>
                        <li>Аналитика количества активных вакансий, откликов, регистраций.</li>
                    </ul>
                </Section>

                <Section title="3. Что мы НЕ делаем">
                    <ul>
                        <li>Не продаём ваши контакты третьим лицам.</li>
                        <li>Не показываем телефон работодателю до момента, когда соискатель сам отправил отклик.</li>
                        <li>Не отправляем рекламу в Telegram, кроме уведомлений по вашим действиям.</li>
                    </ul>
                </Section>

                <Section title="4. Хранение и удаление">
                    <p>
                        Данные хранятся в Supabase (Postgres + Storage), регион — Frankfurt (eu-central-1).
                        Удалить аккаунт и все связанные данные можно в{" "}
                        <Link href="/dashboard/settings">настройках</Link> или письмом на{" "}
                        <a href="mailto:privacy@jumys.kz">privacy@jumys.kz</a>.
                    </p>
                </Section>

                <Section title="5. Файлы cookie и сессии">
                    <p>
                        Мы используем httpOnly cookies для авторизации (Supabase SSR). Аналитики и трекеров
                        третьих лиц нет.
                    </p>
                </Section>

                <Section title="6. Контакты">
                    <p>
                        По всем вопросам конфиденциальности —{" "}
                        <a href="https://t.me/jumys_support">Telegram @jumys_support</a> или{" "}
                        <a href="mailto:privacy@jumys.kz">privacy@jumys.kz</a>.
                    </p>
                </Section>
            </div>
        </div>
    );
}
