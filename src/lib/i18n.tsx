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
    | "heroBadge"
    | "heroEmployerCta"
    | "heroSocialProof"
    | "heroMockupRole"
    | "heroMockupToast"
    | "heroMockupDays"
    | "heroMockupAvgHire"
    | "heroMockupVs"
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
    | "howItWorks"
    | "navOverview"
    | "navMyJobs"
    | "navApplications"
    | "navMatches"
    | "navMyApps"
    | "navSupport"
    | "logout"
    | "employer"
    | "seeker"
    | "user"
    | "mapView"
    | "listView"
    | "pricing"
    | "boostJob"
    | "privacy"
    | "terms"
    | "navForEmployers"
    | "employersBadge"
    | "employersTitle"
    | "employersSub"
    | "employersCta"
    | "employersAvgHire"
    | "employersVs"
    | "employersWhy"
    | "employersFeatureAiTitle"
    | "employersFeatureAiText"
    | "employersFeatureVerifyTitle"
    | "employersFeatureVerifyText"
    | "employersFeatureBoostTitle"
    | "employersFeatureBoostText"
    | "employersCompareTitle"
    | "employersTableFeature"
    | "employersTableJumys"
    | "employersTableHH"
    | "employersTableOlx"
    | "employersRowDistricts"
    | "employersRowAi"
    | "employersRowTelegram"
    | "employersRowVerified"
    | "employersRowPrice"
    | "employersPartial"
    | "employersCtaTitle"
    | "employersCtaPrimary"
    | "employersCtaSecondary";

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
        heroBadge: "🇰🇿 Ақтауда жасалған · AI-матчинг",
        heroEmployerCta: "Мен жұмыс берушімін",
        heroSocialProof: "720 вакансия · 124 үміткер · 39 шағын аудан",
        heroMockupRole: "Үміткер · 1 ш/а",
        heroMockupToast: "Сізге жаңа вакансия",
        heroMockupDays: "күн",
        heroMockupAvgHire: "Jumys арқылы орташа жалдау уақыты",
        heroMockupVs: "−68% кәдімгі жалдаумен салыстырғанда",
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
        navOverview: "Шолу",
        navMyJobs: "Менің вакансияларым",
        navApplications: "Өтінімдер",
        navMatches: "Ұсыныс",
        navMyApps: "Менің өтінімдерім",
        navSupport: "Қолдау",
        logout: "Шығу",
        employer: "Жұмыс беруші",
        seeker: "Үміткер",
        user: "Қолданушы",
        mapView: "Картада көру",
        listView: "Тізіммен",
        pricing: "Тарифтер",
        boostJob: "Топқа шығару",
        privacy: "Құпиялылық саясаты",
        terms: "Пайдалану шарттары",
        navForEmployers: "Мен жұмыс берушімін",
        employersBadge: "Ақтаудағы бизнес үшін",
        employersTitle: "Ақтауда тезірек әрі арзан жалдаңыз",
        employersSub: "AI сіздің ауданыңыздағы 124+ үміткерден лайықтыларын табады. Жазылым 4 990 ₸/ай бастап.",
        employersCta: "Вакансияны тегін жариялау",
        employersAvgHire: "Jumys арқылы орташа жалдау уақыты",
        employersVs: "−68% кәдімгі жалдаумен салыстырғанда",
        employersWhy: "Неге Jumys",
        employersFeatureAiTitle: "AI үміткерлерді ранжирлейді",
        employersFeatureAiText: "Қолмен іріктеусіз — үміткерлер вакансияңызға релеванттылығы бойынша сұрыпталады.",
        employersFeatureVerifyTitle: "Verified Business",
        employersFeatureVerifyText: "БСН/ЖСН тексерісі вакансияларыңыздың CTR-ін орташа 1.4× арттырады.",
        employersFeatureBoostTitle: "Boost вакансиялар",
        employersFeatureBoostText: "Бекітілген вакансия 7 күнде 6× көбірек өтінім алады.",
        employersCompareTitle: "Салыстыру",
        employersTableFeature: "Функция",
        employersTableJumys: "Jumys",
        employersTableHH: "hh.kz",
        employersTableOlx: "OLX",
        employersRowDistricts: "Шағын аудандар бойынша жергілікті матчинг",
        employersRowAi: "AI үміткерлерді іріктеу",
        employersRowTelegram: "Telegram хабарламалары",
        employersRowVerified: "Verified Business (БСН/ЖСН)",
        employersRowPrice: "Айына бастапқы баға",
        employersPartial: "ішінара",
        employersCtaTitle: "AI арқылы жалдауға дайынсыз ба?",
        employersCtaPrimary: "Тегін бастау",
        employersCtaSecondary: "Тарифтерді көру",
    },
    ru: {
        findJob: "Найти работу",
        postJob: "Разместить вакансию",
        verify: "Проверка",
        settings: "Настройки",
        login: "Войти",
        register: "Регистрация",
        dashboard: "Кабинет",
        heroTitle: "Найди работу в Актау",
        heroTitleAccent: "за 24 часа",
        heroDescription:
            "Jumys подбирает вакансии под твой профиль и район. Отклик в один клик через Telegram.",
        heroBadge: "🇰🇿 Сделано в Актау · AI-матчинг",
        heroEmployerCta: "Я работодатель",
        heroSocialProof: "720 вакансий · 124 соискателя · 39 микрорайонов",
        heroMockupRole: "Соискатель · 1 мкр.",
        heroMockupToast: "Новая вакансия для тебя",
        heroMockupDays: "дня",
        heroMockupAvgHire: "среднее время найма через Jumys",
        heroMockupVs: "−68% vs обычный найм",
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
        navOverview: "Обзор",
        navMyJobs: "Мои вакансии",
        navApplications: "Отклики",
        navMatches: "Подборка",
        navMyApps: "Мои отклики",
        navSupport: "Поддержка",
        logout: "Выйти",
        employer: "Работодатель",
        seeker: "Соискатель",
        user: "Пользователь",
        mapView: "На карте",
        listView: "Списком",
        pricing: "Тарифы",
        boostJob: "Поднять в топ",
        privacy: "Политика конфиденциальности",
        terms: "Условия использования",
        navForEmployers: "Я работодатель",
        employersBadge: "Для бизнеса в Актау",
        employersTitle: "Нанимайте в Актау быстрее и дешевле",
        employersSub: "AI находит подходящих кандидатов из 124+ соискателей в твоём районе. Подписка от 4 990 ₸/мес.",
        employersCta: "Разместить вакансию бесплатно",
        employersAvgHire: "среднее время найма через Jumys",
        employersVs: "−68% vs обычный найм",
        employersWhy: "Почему Jumys",
        employersFeatureAiTitle: "AI ранжирует кандидатов",
        employersFeatureAiText: "Без ручного отбора — кандидаты упорядочены по релевантности к вашей вакансии.",
        employersFeatureVerifyTitle: "Verified Business",
        employersFeatureVerifyText: "Проверка БИН/ИИН повышает CTR ваших вакансий в 1.4×.",
        employersFeatureBoostTitle: "Boost вакансий",
        employersFeatureBoostText: "Закреплённая вакансия получает в 6× больше откликов за 7 дней.",
        employersCompareTitle: "Сравнение",
        employersTableFeature: "Функция",
        employersTableJumys: "Jumys",
        employersTableHH: "hh.kz",
        employersTableOlx: "OLX",
        employersRowDistricts: "Локальный матчинг по микрорайонам",
        employersRowAi: "AI-подбор кандидатов",
        employersRowTelegram: "Telegram-уведомления",
        employersRowVerified: "Verified Business (БИН/ИИН)",
        employersRowPrice: "Цена/месяц от",
        employersPartial: "частично",
        employersCtaTitle: "Готовы нанимать через AI?",
        employersCtaPrimary: "Начать бесплатно",
        employersCtaSecondary: "Посмотреть тарифы",
    },
    en: {
        findJob: "Find Job",
        postJob: "Post Job",
        verify: "Verify",
        settings: "Settings",
        login: "Sign in",
        register: "Sign up",
        dashboard: "Dashboard",
        heroTitle: "Find a job in Aktau",
        heroTitleAccent: "in 24 hours",
        heroDescription:
            "Jumys matches jobs to your profile and district. Apply in one click via Telegram.",
        heroBadge: "🇰🇿 Built in Aktau · AI matching",
        heroEmployerCta: "I am an employer",
        heroSocialProof: "720 jobs · 124 seekers · 39 microdistricts",
        heroMockupRole: "Seeker · 1st district",
        heroMockupToast: "A new vacancy for you",
        heroMockupDays: "days",
        heroMockupAvgHire: "average time-to-hire with Jumys",
        heroMockupVs: "−68% vs traditional hiring",
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
        navOverview: "Overview",
        navMyJobs: "My jobs",
        navApplications: "Applications",
        navMatches: "Matches",
        navMyApps: "My applications",
        navSupport: "Support",
        logout: "Sign out",
        employer: "Employer",
        seeker: "Seeker",
        user: "User",
        mapView: "Map view",
        listView: "List view",
        pricing: "Pricing",
        boostJob: "Boost to top",
        privacy: "Privacy policy",
        terms: "Terms of use",
        navForEmployers: "I am an employer",
        employersBadge: "For businesses in Aktau",
        employersTitle: "Hire in Aktau faster and cheaper",
        employersSub: "AI finds the right candidates from 124+ seekers in your district. Plans start at 4,990 ₸/month.",
        employersCta: "Post a vacancy for free",
        employersAvgHire: "average time-to-hire with Jumys",
        employersVs: "−68% vs traditional hiring",
        employersWhy: "Why Jumys",
        employersFeatureAiTitle: "AI ranks candidates",
        employersFeatureAiText: "No manual screening — candidates are sorted by relevance to your vacancy.",
        employersFeatureVerifyTitle: "Verified Business",
        employersFeatureVerifyText: "BIN/IIN verification increases vacancy CTR by 1.4× on average.",
        employersFeatureBoostTitle: "Vacancy boost",
        employersFeatureBoostText: "Pinned vacancies get 6× more applications in 7 days.",
        employersCompareTitle: "Comparison",
        employersTableFeature: "Feature",
        employersTableJumys: "Jumys",
        employersTableHH: "hh.kz",
        employersTableOlx: "OLX",
        employersRowDistricts: "Local matching by microdistrict",
        employersRowAi: "AI candidate matching",
        employersRowTelegram: "Telegram notifications",
        employersRowVerified: "Verified Business (BIN/IIN)",
        employersRowPrice: "Monthly price from",
        employersPartial: "partial",
        employersCtaTitle: "Ready to hire with AI?",
        employersCtaPrimary: "Start free",
        employersCtaSecondary: "View pricing",
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
