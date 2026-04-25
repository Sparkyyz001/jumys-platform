"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Lang = "kk" | "ru" | "en";
type I18nKey =
    | "findJob"
    | "postJob"
    | "verify"
    | "settings"
    | "login"
    | "register"
    | "dashboard"
    | "heroTitle"
    | "heroTitleAccent"
    | "heroDescription"
    | "ctaStart"
    | "ctaBrowseJobs"
    | "freshJobs"
    | "freshJobsSubtitle"
    | "allJobs"
    | "statsActive"
    | "statsSeekers"
    | "statsApplications"
    | "youthTitle"
    | "youthText"
    | "verifyTitle"
    | "verifyText"
    | "ctaReady"
    | "ctaReadyDesc"
    | "createAccount"
    | "howItWorks";

const translations: Record<Lang, Record<I18nKey, string>> = {
    kk: {
        findJob: "Жұмыс табу",
        postJob: "Вакансия жариялау",
        verify: "Тексеру",
        settings: "Баптаулар",
        login: "Кіру",
        register: "Тіркелу",
        dashboard: "Кабинет",
        heroTitle: "Jumys Platform: Ақтаудағы жастар жұмысы",
        heroTitleAccent: "AI-ұсыныспен",
        heroDescription:
            "Jumys сіздің профиліңізге сай вакансияларды таңдайды, ал жұмыс берушілерге үміткерлерді автоматты түрде ұсынады",
        ctaStart: "Жұмыс іздеуді бастау",
        ctaBrowseJobs: "Вакансияларды көру",
        freshJobs: "Ақтаудағы жаңа вакансиялар",
        freshJobsSubtitle: "Нақты ұсыныстар, нақты уақытта жаңарады",
        allJobs: "Барлық вакансиялар",
        statsActive: "Белсенді вакансиялар",
        statsSeekers: "Жүйедегі үміткерлер",
        statsApplications: "Аптадағы өтінімдер",
        youthTitle: "Жастар мен студенттерге",
        youthText: "Ақтаудағы қосымша жұмыс, тағылымдама және бастапқы вакансиялар, аудан мен тәжірибе бойынша сүзгі.",
        verifyTitle: "Жеке басын растау",
        verifyText: "Баптауларда жұмыс беруші мен үміткерді IIN/BIN бойынша тексеру қойындысы бар.",
        ctaReady: "Ақтауда жұмыс табуға дайынсыз ба?",
        ctaReadyDesc: "Тіркелу тегін, профиль толтырылғаннан кейін бірден алғашқы ұсыныс пайда болады",
        createAccount: "Аккаунт құру",
        howItWorks: "Jumys қалай жұмыс істейді",
    },
    ru: {
        findJob: "Найти работу",
        postJob: "Разместить вакансию",
        verify: "Проверка",
        settings: "Настройки",
        login: "Войти",
        register: "Регистрация",
        dashboard: "Кабинет",
        heroTitle: "Jumys Platform: Работа в Актау для молодежи",
        heroTitleAccent: "с AI-подбором",
        heroDescription:
            "Jumys подбирает вакансии под ваш профиль, а работодателям находит подходящих кандидатов автоматически",
        ctaStart: "Начать искать работу",
        ctaBrowseJobs: "Смотреть вакансии",
        freshJobs: "Свежие вакансии в Актау",
        freshJobsSubtitle: "Реальные предложения, обновляются в реальном времени",
        allJobs: "Все вакансии",
        statsActive: "Активные вакансии",
        statsSeekers: "Соискатели в системе",
        statsApplications: "Отклики за неделю",
        youthTitle: "Для молодежи и студентов",
        youthText: "Подработка, стажировки и стартовые вакансии в Актау с фильтрами по району и опыту.",
        verifyTitle: "Проверка личности",
        verifyText: "В настройках доступна отдельная вкладка верификации работодателя и соискателя по IIN/BIN.",
        ctaReady: "Готовы найти работу в Актау?",
        ctaReadyDesc: "Регистрация бесплатна, первая подборка появится сразу после заполнения профиля",
        createAccount: "Создать аккаунт",
        howItWorks: "Как Jumys работает",
    },
    en: {
        findJob: "Find Job",
        postJob: "Post Job",
        verify: "Verify",
        settings: "Settings",
        login: "Sign in",
        register: "Sign up",
        dashboard: "Dashboard",
        heroTitle: "Jumys Platform: Jobs in Aktau for youth",
        heroTitleAccent: "with AI matching",
        heroDescription:
            "Jumys ranks jobs for your profile and surfaces best-fit candidates to employers automatically",
        ctaStart: "Start job hunt",
        ctaBrowseJobs: "Browse jobs",
        freshJobs: "Fresh jobs in Aktau",
        freshJobsSubtitle: "Real openings, updated in real time",
        allJobs: "All jobs",
        statsActive: "Active jobs",
        statsSeekers: "Seekers on board",
        statsApplications: "Applications this week",
        youthTitle: "For students & youth",
        youthText: "Part-time, internships and entry-level jobs in Aktau, filtered by district and experience.",
        verifyTitle: "Identity verification",
        verifyText: "Settings include a dedicated tab for IIN/BIN verification of employers and seekers.",
        ctaReady: "Ready to find work in Aktau?",
        ctaReadyDesc: "Registration is free, the first match appears right after you fill in your profile",
        createAccount: "Create account",
        howItWorks: "How Jumys works",
    },
};

interface I18nContextValue {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (key: I18nKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Lang>("ru");

    useEffect(() => {
        const saved = localStorage.getItem("jumys_lang") as Lang | null;
        if (saved && (saved === "kk" || saved === "ru" || saved === "en")) {
            setLangState(saved);
        }
    }, []);

    const value = useMemo<I18nContextValue>(() => ({
        lang,
        setLang: (nextLang: Lang) => {
            setLangState(nextLang);
            try {
                localStorage.setItem("jumys_lang", nextLang);
            } catch {
                // ignore storage failures (private mode etc.)
            }
        },
        t: (key: I18nKey) => translations[lang][key] ?? key,
    }), [lang]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) {
        throw new Error("useI18n must be used inside I18nProvider");
    }
    return ctx;
}
